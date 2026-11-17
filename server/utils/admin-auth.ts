import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie, getRequestURL, createError } from 'h3'

const ADMIN_EMAIL = 'atingauto2026@gmail.com'
const ACCESS_COOKIE = 'rr_admin_access'
const REFRESH_COOKIE = 'rr_admin_refresh'

function envValue(event: H3Event, names: string[], configKey: string) {
  const env = (event.context as any).cloudflare?.env ?? {}
  for (const name of names) {
    const value = env[name] ?? (typeof process !== 'undefined' ? process.env?.[name] : undefined)
    if (value != null && String(value).trim()) return String(value).trim()
  }
  const config = useRuntimeConfig(event) as Record<string, unknown>
  const value = config[configKey]
  return value != null ? String(value).trim() : ''
}

export function authConfig(event: H3Event) {
  const url = envValue(event, ['SUPABASE_URL', 'NUXT_SUPABASE_URL'], 'supabaseUrl').replace(/\/$/, '')
  const key = envValue(event, ['SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_ANON_KEY'], 'supabasePublishableKey')
  if (!url || !key) throw createError({ statusCode: 503, statusMessage: 'Supabase Auth is not configured.' })
  return { url, key }
}

function setSessionCookies(event: H3Event, session: { access_token: string; refresh_token: string; expires_in?: number }) {
  const secure = getRequestURL(event).protocol === 'https:'
  const common = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/', maxAge: 60 * 60 * 24 * 30 }
  setCookie(event, ACCESS_COOKIE, session.access_token, { ...common, maxAge: Math.max(60, session.expires_in ?? 3600) })
  setCookie(event, REFRESH_COOKIE, session.refresh_token, common)
}

async function fetchAuthUser(url: string, key: string, accessToken: string) {
  return await $fetch<{ id: string; email?: string; email_confirmed_at?: string | null }>(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    retry: 0,
    timeout: 10000,
  })
}

export async function requireAdmin(event: H3Event) {
  const { url, key } = authConfig(event)
  let accessToken = getCookie(event, ACCESS_COOKIE) || ''
  const refreshToken = getCookie(event, REFRESH_COOKIE) || ''
  if (!accessToken && !refreshToken) throw createError({ statusCode: 401, statusMessage: 'Please sign in.' })

  let user: Awaited<ReturnType<typeof fetchAuthUser>> | null = null
  if (accessToken) {
    try { user = await fetchAuthUser(url, key, accessToken) } catch {}
  }
  if (!user && refreshToken) {
    try {
      const session = await $fetch<{ access_token: string; refresh_token: string; expires_in?: number }>(`${url}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: { refresh_token: refreshToken },
        retry: 0,
        timeout: 10000,
      })
      setSessionCookies(event, session)
      accessToken = session.access_token
      user = await fetchAuthUser(url, key, accessToken)
    } catch {}
  }
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL || !user.email_confirmed_at) {
    deleteCookie(event, ACCESS_COOKIE, { path: '/' })
    deleteCookie(event, REFRESH_COOKIE, { path: '/' })
    throw createError({ statusCode: 401, statusMessage: 'Administrator authentication required.' })
  }
  return { user, accessToken }
}

export async function sendAdminMagicLink(event: H3Event) {
  const body = await readBody<{ email?: string }>(event)
  if (body?.email?.trim().toLowerCase() !== ADMIN_EMAIL) {
    throw createError({ statusCode: 403, statusMessage: 'This email is not authorized for administration.' })
  }
  const origin = getRequestURL(event).origin
  const hostname = getRequestURL(event).hostname
  if (hostname !== 'roadready-auto.pages.dev' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    throw createError({ statusCode: 403, statusMessage: 'Unrecognized admin sign-in domain.' })
  }
  const { url, key } = authConfig(event)
  try {
    await $fetch(`${url}/auth/v1/otp?redirect_to=${encodeURIComponent(origin + '/')}`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: { email: ADMIN_EMAIL, create_user: true },
      retry: 0,
      timeout: 10000,
    })
    return { success: true }
  } catch (error: any) {
    const response = error?.response
    const data = error?.data ?? response?._data ?? {}
    const detail = data.msg || data.message || data.error_description || data.error || data.code || error?.statusMessage || error?.message
    const status = response?.status || error?.statusCode || error?.status || data.status
    const safeDetail = typeof detail === 'string' ? detail.replace(/[\\r\\n]+/g, ' ').slice(0, 180) : ''
    const responseUrl = typeof response?.url === 'string'
      ? response.url.replace(/[?#].*$/, '')
      : ''
    const header = (name: string) => {
      const value = response?.headers?.get?.(name)
      return typeof value === 'string' ? value.replace(/[\\r\\n]+/g, ' ').slice(0, 100) : ''
    }
    const diagnostics = [
      'method=POST',
      'endpoint=/auth/v1/otp',
      responseUrl ? `response_url=${responseUrl}` : '',
      header('allow') ? `allow=${header('allow')}` : '',
      header('server') ? `server=${header('server')}` : '',
      header('via') ? `via=${header('via')}` : '',
      header('cf-ray') ? `cf-ray=${header('cf-ray')}` : '',
      header('content-type') ? `content_type=${header('content-type')}` : '',
    ].filter(Boolean).join('; ')
    console.error('[admin-auth] OTP request failed', {
      method: 'POST',
      endpoint: '/auth/v1/otp',
      status: status ?? null,
      responseUrl,
      allow: header('allow') || null,
      server: header('server') || null,
      via: header('via') || null,
      cfRay: header('cf-ray') || null,
      contentType: header('content-type') || null,
    })
    throw createError({
      statusCode: 502,
      statusMessage: `Supabase Auth error${status ? ` (${status})` : ''}: ${safeDetail || 'Request failed'}. [${diagnostics}]`,
    })
  }
}

export async function acceptAdminSession(event: H3Event) {
  const body = await readBody<{ access_token?: string; refresh_token?: string; expires_in?: number }>(event)
  if (!body?.access_token || !body?.refresh_token || body.access_token.length > 10000 || body.refresh_token.length > 10000) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sign-in session.' })
  }
  const { url, key } = authConfig(event)
  let user
  try { user = await fetchAuthUser(url, key, body.access_token) } catch {
    throw createError({ statusCode: 401, statusMessage: 'The sign-in link is invalid or expired.' })
  }
  if (user.email?.toLowerCase() !== ADMIN_EMAIL || !user.email_confirmed_at) {
    throw createError({ statusCode: 403, statusMessage: 'This account is not authorized as an administrator.' })
  }
  setSessionCookies(event, body as { access_token: string; refresh_token: string; expires_in?: number })
  return { success: true, email: ADMIN_EMAIL }
}

export function clearAdminSession(event: H3Event) {
  deleteCookie(event, ACCESS_COOKIE, { path: '/' })
  deleteCookie(event, REFRESH_COOKIE, { path: '/' })
}
