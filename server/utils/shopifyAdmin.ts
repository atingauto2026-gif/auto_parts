import type { H3Event } from 'h3'

interface AdminConnection {
  endpoint: string
  host: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

/**
 * Reads a setting from (in order) the Cloudflare Pages bindings, the Nuxt
 * runtime config, and process.env. On Cloudflare the bindings never reach
 * useRuntimeConfig(), so reading them directly is the only reliable path.
 */
function readVar(event: H3Event | undefined, envNames: string[], configKey: string): string {
  const cfEnv = (event as { context?: { cloudflare?: { env?: Record<string, unknown> } } })?.context
    ?.cloudflare?.env
  for (const name of envNames) {
    const value = cfEnv?.[name]
    if (value != null && String(value).trim()) return String(value).trim()
  }

  const config = useRuntimeConfig(event) as Record<string, unknown>
  const fromConfig = config?.[configKey]
  if (fromConfig != null && String(fromConfig).trim()) return String(fromConfig).trim()

  for (const name of envNames) {
    const value = typeof process !== 'undefined' ? process.env?.[name] : undefined
    if (value != null && String(value).trim()) return String(value).trim()
  }
  return ''
}

const readDomain = (event?: H3Event) =>
  readVar(event, ['NUXT_SHOPIFY_DOMAIN', 'NITRO_SHOPIFY_DOMAIN'], 'shopifyDomain')
const readVersion = (event?: H3Event) =>
  readVar(event, ['NUXT_SHOPIFY_API_VERSION', 'NITRO_SHOPIFY_API_VERSION'], 'shopifyApiVersion') ||
  '2025-10'
const readClientId = (event?: H3Event) =>
  readVar(event, ['NUXT_SHOPIFY_ADMIN_CLIENT_ID', 'NITRO_SHOPIFY_ADMIN_CLIENT_ID'], 'shopifyAdminClientId')
const readClientSecret = (event?: H3Event) =>
  readVar(
    event,
    ['NUXT_SHOPIFY_ADMIN_CLIENT_SECRET', 'NITRO_SHOPIFY_ADMIN_CLIENT_SECRET'],
    'shopifyAdminClientSecret',
  )
const readStaticToken = (event?: H3Event) =>
  readVar(event, ['NUXT_SHOPIFY_ADMIN_TOKEN', 'NITRO_SHOPIFY_ADMIN_TOKEN'], 'shopifyAdminToken')

export function adminConnection(event?: H3Event): AdminConnection | null {
  const domain = readDomain(event)
  if (!domain) return null
  const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return { endpoint: `https://${host}/admin/api/${readVersion(event)}/graphql.json`, host }
}

export function isAdminConfigured(event?: H3Event): boolean {
  if (!adminConnection(event)) return false
  return Boolean(readStaticToken(event) || (readClientId(event) && readClientSecret(event)))
}

async function adminToken(connection: AdminConnection, event?: H3Event): Promise<string | null> {
  const staticToken = readStaticToken(event)
  if (staticToken) return staticToken

  const clientId = readClientId(event)
  const clientSecret = readClientSecret(event)
  if (!clientId || !clientSecret) return null

  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value

  const response = await $fetch<{ access_token?: string; expires_in?: number; error?: string }>(
    `https://${connection.host}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
      retry: 0,
      timeout: 15000,
    },
  )

  if (!response.access_token) throw new Error(`SHOPIFY_ADMIN_TOKEN_FAILED: ${response.error || 'no token'}`)

  const lifetime = Math.max(120, Number(response.expires_in) || 86400) - 120
  cachedToken = { value: response.access_token, expiresAt: Date.now() + lifetime * 1000 }
  return cachedToken.value
}

export async function adminGraphql<T>(
  event: H3Event,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const connection = adminConnection(event)
  if (!connection) throw new Error('SHOPIFY_ADMIN_NOT_CONFIGURED')
  const token = await adminToken(connection, event)
  if (!token) throw new Error('SHOPIFY_ADMIN_NOT_CONFIGURED')

  const response = await $fetch<{ data?: T; errors?: { message: string }[] }>(connection.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: { query, variables },
    retry: 0,
    timeout: 15000,
  })

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '))
  }
  if (!response.data) throw new Error('Empty Admin API response')
  return response.data
}
