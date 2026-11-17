#!/usr/bin/env node
/**
 * admin-auth-check.mjs
 * 管理员登录链路冒烟测试。
 *
 * 用法：
 *   node scripts/admin-auth-check.mjs
 *   node scripts/admin-auth-check.mjs https://roadready-auto.pages.dev
 *   node scripts/admin-auth-check.mjs --no-otp        # 跳过真实发送 OTP 邮件
 */

const BASE = (
  process.argv.find((a) => a.startsWith('http')) ||
  process.env.BASE_URL ||
  'https://roadready-auto.pages.dev'
).replace(/\/$/, '')

const SEND_OTP = !process.argv.includes('--no-otp')
const ADMIN_EMAIL = 'atingauto2026@gmail.com'
const HEADER_KEYS = ['server', 'cf-ray', 'allow', 'content-type', 'via']

let passed = 0
let failed = 0
let blocked = 0
const results = []

function bodyText(raw) {
  return raw.length > 400 ? `${raw.slice(0, 400)}…` : raw
}

async function request(method, path, { body } = {}) {
  const url = `${BASE}${path}`
  const started = Date.now()
  let res
  try {
    res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'manual',
    })
  } catch (error) {
    return { url, method, networkError: error.message, ms: Date.now() - started }
  }
  const raw = await res.text()
  const headers = {}
  for (const key of HEADER_KEYS) {
    const value = res.headers.get(key)
    if (value) headers[key] = value
  }
  return { url, method, status: res.status, headers, raw, body: bodyText(raw), ms: Date.now() - started }
}

function check(name, condition, detail) {
  const ok = Boolean(condition)
  if (ok) passed++
  else failed++
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (detail) console.log(`      ${detail}`)
}

function describe(r) {
  if (r.networkError) return `network error: ${r.networkError} (${r.ms}ms)`
  return `HTTP ${r.status} ${JSON.stringify(r.headers)} body=${r.body} (${r.ms}ms)`
}

console.log(`\nTarget: ${BASE}\n${'='.repeat(72)}`)

// 1. 登录页可访问，且包含发送按钮文案
{
  const r = await request('GET', '/admin/login')
  check(
    'GET /admin/login -> 200 且页面渲染登录卡片',
    r.status === 200 && /管理员登录|发送安全登录链接/.test(r.raw || ''),
    describe({ ...r, body: `contains_login_markup=${/管理员登录/.test(r.raw || '')}`, raw: '' }),
  )
}

// 2. 未登录访问 /api/admin/auth/me 应 401
{
  const r = await request('GET', '/api/admin/auth/me')
  check('GET /api/admin/auth/me (无 Cookie) -> 401', r.status === 401, describe(r))
}

// 3. 伪造 token 换取会话应 401（不是 405）
{
  const r = await request('POST', '/api/admin/auth/session', { body: { access_token: 'invalid', refresh_token: 'invalid' } })
  check('POST /api/admin/auth/session (伪造 token) -> 401', r.status === 401, describe(r))
}

// 4. 非管理员邮箱应 403
{
  const r = await request('POST', '/api/admin/auth/request', { body: { email: 'not-admin@example.com' } })
  check('POST /api/admin/auth/request (非管理员邮箱) -> 403', r.status === 403, describe(r))
}

// 5. 对照组：用 GET 打只注册了 POST 的接口，Nitro 会返回 404（而不是 405）
{
  const r = await request('GET', '/api/admin/auth/request')
  check('GET /api/admin/auth/request (错误方法) -> 404 且为 JSON 错误', r.status === 404 && /Page not found/.test(r.raw || ''), describe(r))
}

// 6. 关键用例：真实请求 OTP
if (SEND_OTP) {
  const r = await request('POST', '/api/admin/auth/request', { body: { email: ADMIN_EMAIL } })
  const success = r.status === 200 && /"success"\s*:\s*true/.test(r.raw || '')
  const rateLimited = /\(429\)/.test(r.raw || '') || /over_email_send_rate_limit|rate limit/i.test(r.raw || '')
  if (success) {
    check('POST /api/admin/auth/request (真实 OTP) -> 200 {"success":true}', true, describe(r))
  } else if (rateLimited) {
    blocked++
    console.log('BLOCK  POST /api/admin/auth/request (真实 OTP) 被 Supabase 邮件频率限制拦截')
    console.log(`      ${describe(r)}`)
  } else {
    check('POST /api/admin/auth/request (真实 OTP) -> 200 {"success":true}', false, describe(r))
  }
  check('真实 OTP 请求未出现 405', r.status !== 405 && !/\(405\)/.test(r.raw || ''), describe(r))
  if (!success) {
    check(
      '失败诊断带出正确的 Supabase Auth 地址',
      /response_url=https:\/\/[a-z0-9]+\.supabase\.co\/auth\/v1\/otp/.test(r.raw || ''),
      describe(r),
    )
  }
} else {
  console.log('SKIP  POST /api/admin/auth/request (真实 OTP) —— 已指定 --no-otp')
}

// 7. 登出接口应恒为 200
{
  const r = await request('POST', '/api/admin/auth/logout')
  check('POST /api/admin/auth/logout -> 200', r.status === 200, describe(r))
}

// 8. 用户名 / 密码登录
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'RoadReady@2026'

async function login(username, password) {
  const res = await fetch(`${BASE}/api/admin/auth/password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const raw = await res.text()
  const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : []
  return {
    status: res.status,
    raw,
    setCookies,
    cookie: setCookies.map((item) => item.split(';')[0]).join('; '),
  }
}

if (!process.argv.includes('--no-password')) {
  const ok = await login(ADMIN_USER, ADMIN_PASS)
  if (ok.status === 503) {
    blocked++
    console.log('BLOCK  POST /api/admin/auth/password —— 未配置 ADMIN_PASSWORD')
    console.log(`      HTTP 503 ${ok.raw.slice(0, 200)}`)
  } else {
    check('POST /api/admin/auth/password (正确凭据) -> 200', ok.status === 200 && /"success"\s*:\s*true/.test(ok.raw), `HTTP ${ok.status} ${ok.raw.slice(0, 200)}`)
    check('登录成功下发 rr_admin_password Cookie', /(^|,\s*)rr_admin_password=/.test(ok.cookie), `cookies=${ok.cookie.replace(/=.*/, '=***')}`)

    const me = await fetch(`${BASE}/api/admin/auth/me`, { headers: { cookie: ok.cookie } })
    const meRaw = await me.text()
    check('GET /api/admin/auth/me (带会话) -> 200 authenticated', me.status === 200 && /"authenticated"\s*:\s*true/.test(meRaw), `HTTP ${me.status} ${meRaw.slice(0, 200)}`)

    const bad = await login(ADMIN_USER, `${ADMIN_PASS}-wrong`)
    check('POST /api/admin/auth/password (错误密码) -> 401', bad.status === 401, `HTTP ${bad.status} ${bad.raw.slice(0, 200)}`)

    const wrongUser = await login('root', ADMIN_PASS)
    check('POST /api/admin/auth/password (错误用户名) -> 401', wrongUser.status === 401, `HTTP ${wrongUser.status} ${wrongUser.raw.slice(0, 200)}`)

    const logout = await fetch(`${BASE}/api/admin/auth/logout`, { method: 'POST', headers: { cookie: ok.cookie } })
    const cleared = (logout.headers.getSetCookie ? logout.headers.getSetCookie() : []).some((item) => /^rr_admin_password=;/.test(item) && /Max-Age=0/i.test(item))
    check('登出时清除 rr_admin_password Cookie', logout.status === 200 && cleared, `HTTP ${logout.status} cleared=${cleared}`)
  }
} else {
  console.log('SKIP  密码登录 —— 已指定 --no-password')
}

console.log(`${'='.repeat(72)}\n结果: ${passed} passed, ${failed} failed, ${blocked} blocked\n`)

const failures = results.filter((r) => !r.ok)
if (failures.length) {
  console.log('失败用例：')
  for (const f of failures) console.log(`  - ${f.name}\n    ${f.detail}`)
  process.exitCode = 1
}
