import type { H3Event } from 'h3'

interface SupabaseConfig { url: string; key: string }

function readValue(event: H3Event | undefined, names: string[], configKey: string): string {
  const cfEnv = (event as { context?: { cloudflare?: { env?: Record<string, unknown> } } } | undefined)
    ?.context?.cloudflare?.env
  for (const name of names) {
    const value = cfEnv?.[name]
    if (value != null && String(value).trim()) return String(value).trim()
  }
  const config = useRuntimeConfig(event) as Record<string, unknown>
  const configured = config[configKey]
  if (configured != null && String(configured).trim()) return String(configured).trim()
  for (const name of names) {
    const runtimeProcess = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process
    const value = runtimeProcess?.env?.[name]
    if (value != null && String(value).trim()) return String(value).trim()
  }
  return ''
}

export function supabaseConfig(event?: H3Event): SupabaseConfig {
  const url = readValue(event, ['SUPABASE_URL', 'NUXT_SUPABASE_URL'], 'supabaseUrl').replace(/\/$/, '')
  const key = readValue(event, ['SUPABASE_SECRET_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NUXT_SUPABASE_SECRET_KEY'], 'supabaseSecretKey')
  if (!url || !key) throw createError({ statusCode: 503, statusMessage: 'Supabase server credentials are not configured.' })
  return { url, key }
}

export async function db<T>(
  event: H3Event,
  table: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; query?: Record<string, string>; body?: unknown; prefer?: string } = {},
): Promise<T> {
  const { url, key } = supabaseConfig(event)
  const query = new URLSearchParams(options.query ?? {}).toString()
  const endpoint = `${url}/rest/v1/${table}${query ? `?${query}` : ''}`
  return await $fetch<T>(endpoint, {
    method: options.method ?? 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body !== undefined ? { body: options.body } : {}),
    retry: 0,
    timeout: 15000,
  } as any) as T
}
