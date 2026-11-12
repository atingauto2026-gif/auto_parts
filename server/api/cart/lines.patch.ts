import { changeLine } from '../../utils/cartStore'

interface Body {
  lineId?: string
  quantity?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const lineId = String(body?.lineId ?? '').trim()
  const quantity = Math.max(0, Math.min(99, Number(body?.quantity ?? 0)))

  if (!lineId) {
    throw createError({ statusCode: 400, statusMessage: 'lineId is required' })
  }

  try {
    return { cart: await changeLine(event, lineId, quantity) }
  } catch (error) {
    throw createError({
      statusCode: 422,
      statusMessage: error instanceof Error ? error.message : 'Could not update item',
    })
  }
})
