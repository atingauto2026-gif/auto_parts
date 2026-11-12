interface Body {
  name?: string
  email?: string
  phone?: string
  company?: string
  product?: string
  message?: string
  leadType?: 'home_demo' | 'contact_page' | 'product_quote'
}

interface CustomerNode {
  id: string
  note: string | null
  tags: string[]
}

const FIND_CUSTOMER = `#graphql
  query FindCustomer($q: String!) {
    customers(first: 1, query: $q) {
      nodes { id note tags }
    }
  }
`

const CREATE_CUSTOMER = `#graphql
  mutation CreateCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id email }
      userErrors { field message }
    }
  }
`

const UPDATE_CUSTOMER = `#graphql
  mutation UpdateCustomer($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer { id email }
      userErrors { field message }
    }
  }
`

const LEAD_TAGS_BY_TYPE: Record<NonNullable<Body['leadType']>, string> = {
  home_demo: 'home-demo',
  contact_page: 'contact-page',
  product_quote: 'product-quote',
}

/**
 * Creates (or appends to) a Shopify customer so enquiries land in the same
 * back office as the live store. The Shopify Forms endpoint requires an
 * hCaptcha token that cannot be minted from a non-Shopify origin, so the
 * Admin API is the only CAPTCHA-free delivery path.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim().toLowerCase()
  const message = String(body?.message ?? '').trim()
  const phone = String(body?.phone ?? '').trim()
  const leadTags = ['website-lead', ...(body?.leadType && LEAD_TAGS_BY_TYPE[body.leadType] ? [LEAD_TAGS_BY_TYPE[body.leadType]] : [])]

  if (!name || !email || !message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email and message are required.',
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address.' })
  }

  if (!isAdminConfigured(event)) {
    throw createError({
      statusCode: 503,
      statusMessage:
        'Contact delivery is not configured yet. Set NUXT_SHOPIFY_ADMIN_CLIENT_ID / NUXT_SHOPIFY_ADMIN_CLIENT_SECRET in .env.',
    })
  }

  const note = [
    message,
    String(body?.company ?? '').trim() ? `Company: ${String(body?.company).trim()}` : '',
    String(body?.product ?? '').trim() ? `Product interest: ${String(body?.product).trim()}` : '',
    phone && !/^\+[1-9]\d{6,14}$/.test(phone) ? `Phone: ${phone}` : '',
    `Submitted from: ${getRequestURL(event).origin}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const [firstName, ...rest] = name.split(/\s+/)
  const lastName = rest.join(' ')

  try {
    const existing = await adminGraphql<{ customers: { nodes: CustomerNode[] } }>(event, FIND_CUSTOMER, {
      q: `email:${email}`,
    })
    const customer = existing.customers.nodes[0]

    if (customer) {
      const mergedNote = [customer.note, note].filter(Boolean).join('\n\n---\n\n')
      const mergedTags = Array.from(new Set([...(customer.tags ?? []), ...leadTags]))
      const updated = await adminGraphql<{
        customerUpdate: { userErrors: { field: string[]; message: string }[] }
      }>(event, UPDATE_CUSTOMER, { input: { id: customer.id, note: mergedNote, tags: mergedTags } })

      if (updated.customerUpdate.userErrors.length) {
        throw new Error(updated.customerUpdate.userErrors.map((error) => error.message).join('; '))
      }
    } else {
      const created = await adminGraphql<{
        customerCreate: { userErrors: { field: string[]; message: string }[] }
      }>(event, CREATE_CUSTOMER, {
        input: {
          firstName,
          lastName,
          email,
          // Admin API only accepts E.164; otherwise the raw value lives in the note.
          ...(/^\+[1-9]\d{6,14}$/.test(phone) ? { phone } : {}),
          note,
          tags: leadTags,
        },
      })

      if (created.customerCreate.userErrors.length) {
        throw new Error(created.customerCreate.userErrors.map((error) => error.message).join('; '))
      }
    }
  } catch (error) {
    console.error('[contact] Shopify Admin API failed:', error)
    const supportEmail = useRuntimeConfig(event).public.email
    throw createError({
      statusCode: 502,
      statusMessage: `We could not deliver your message. Please email ${supportEmail} instead.`,
    })
  }

  return { ok: true }
})
