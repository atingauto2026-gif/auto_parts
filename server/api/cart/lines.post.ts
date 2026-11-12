import { addLine } from '../../utils/cartStore'

interface Body {
  variantId?: string
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const variantId = String(body?.variantId ?? '').trim()
  const quantity = Math.max(1, Math.min(99, Number(body?.quantity ?? 1)))

  if (!variantId) {
    throw createError({ statusCode: 400, statusMessage: 'variantId is required' })
  }

  try {
    return { cart: await addLine(event, variantId, quantity) }
  } catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : 'Could not add item',
    })
  }
})
