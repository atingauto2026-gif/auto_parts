import { deleteLine } from '../../utils/cartStore'

interface Body {
  lineId?: string
}

export default defineEventHandler(async (event) => {
  // DELETE request bodies can be dropped or handled inconsistently by some
  // edge/proxy runtimes. Prefer the query parameter, but keep body support for
  // compatibility with older storefront clients.
  const query = getQuery(event)
  const body = await readBody<Body>(event).catch(() => undefined)
  const lineId = String(query.lineId ?? body?.lineId ?? '').trim()

  if (!lineId) {
    throw createError({ statusCode: 400, statusMessage: 'lineId is required' })
  }

  try {
    return { cart: await deleteLine(event, lineId) }
  } catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : 'Could not remove item',
    })
  }
})
