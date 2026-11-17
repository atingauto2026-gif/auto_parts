#!/usr/bin/env node
/**
 * mock-supabase.mjs
 * 本地假 Supabase Auth 服务，用于离线验证 /api/admin/auth/* 的行为。
 *
 * 用法：
 *   $env:MOCK_MODE='ok';   node scripts/mock-supabase.mjs   # 200 成功
 *   $env:MOCK_MODE='405';  node scripts/mock-supabase.mjs   # 复现 405
 *   $env:MOCK_MODE='429';  node scripts/mock-supabase.mjs   # 邮件频率限制
 *   $env:MOCK_MODE='500';  node scripts/mock-supabase.mjs   # Supabase 故障
 */
import http from 'node:http'

const PORT = Number(process.env.MOCK_PORT || 4010)
const MODE = process.env.MOCK_MODE || 'ok'

const server = http.createServer((req, res) => {
  let body = ''
  req.on('data', (chunk) => (body += chunk))
  req.on('end', () => {
    const record = {
      at: new Date().toISOString(),
      mode: MODE,
      method: req.method,
      url: req.url,
      apikey: req.headers.apikey || null,
      authorization: req.headers.authorization || null,
      contentType: req.headers['content-type'] || null,
      userAgent: req.headers['user-agent'] || null,
      body,
    }
    console.log('[mock-supabase]', JSON.stringify(record))

    if (MODE === 'ok') {
      if (req.url?.startsWith('/auth/v1/otp')) {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{}')
        return
      }
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end('{"id":"mock-user","email":"atingauto2026@gmail.com","email_confirmed_at":"2026-01-01T00:00:00Z"}')
      return
    }

    if (MODE === '405') {
      // 模拟 Cloudflare Pages 对静态资源的 POST 响应
      res.writeHead(405, { 'content-type': 'text/plain', allow: 'GET, HEAD', server: 'cloudflare' })
      res.end('Method Not Allowed')
      return
    }

    if (MODE === '429') {
      res.writeHead(429, { 'content-type': 'application/json', server: 'cloudflare' })
      res.end('{"code":429,"error_code":"over_email_send_rate_limit","msg":"email rate limit exceeded"}')
      return
    }

    res.writeHead(500, { 'content-type': 'application/json', server: 'cloudflare' })
    res.end('{"code":500,"msg":"internal error"}')
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-supabase] listening on http://127.0.0.1:${PORT} mode=${MODE}`)
})
