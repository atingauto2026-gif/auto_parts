import type { Cart, CartLine } from '#shared/types'
import { fallbackProducts } from '../data/catalog'

/**
 * In-memory cart used only when Storefront credentials are absent. It exists so
 * the whole storefront (add / update / remove / totals) can be previewed before
 * the Shopify channel is wired up. Checkout is disabled in this mode because
 * Shopify owns payment — there is no local substitute for it.
 */
interface DemoLine {
  id: string
  variantId: string
  quantity: number
}

const carts = new Map<string, DemoLine[]>()

let sequence = 0

function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${Date.now().toString(36)}-${sequence}`
}

function money(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: 'AUD' }
}

function resolveLine(line: DemoLine): CartLine | null {
  const product = fallbackProducts().find((item) =>
    item.variants.some((variant) => variant.id === line.variantId),
  )
  if (!product) return null
  const variant = product.variants.find((item) => item.id === line.variantId)
  if (!variant?.price) return null

  return {
    id: line.id,
    quantity: line.quantity,
    merchandise: {
      id: variant.id,
      title: variant.title,
      price: variant.price,
      image: variant.image,
      productTitle: product.title,
      productHandle: product.handle,
    },
  }
}

function build(id: string, lines: DemoLine[]): Cart {
  const resolved = lines
    .map(resolveLine)
    .filter((line): line is CartLine => line !== null)

  const subtotal = resolved.reduce(
    (sum, line) => sum + Number(line.merchandise.price.amount) * line.quantity,
    0,
  )

  return {
    id,
    checkoutUrl: '',
    totalQuantity: resolved.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: money(subtotal),
    total: money(subtotal),
    lines: resolved,
  }
}

export function demoCreateCart(): Cart {
  const id = nextId('demo-cart')
  carts.set(id, [])
  return build(id, [])
}

export function demoGetCart(id: string): Cart | null {
  const lines = carts.get(id)
  if (!lines) return null
  return build(id, lines)
}

export function demoAddLine(id: string, variantId: string, quantity: number): Cart {
  const lines = carts.get(id) ?? []
  const existing = lines.find((line) => line.variantId === variantId)
  if (existing) {
    existing.quantity += quantity
  } else {
    // Preview-catalogue variants carry no price and cannot be purchased.
    const sellable = fallbackProducts().some((product) =>
      product.variants.some((variant) => variant.id === variantId && variant.price),
    )
    if (!sellable) throw new Error('This product is not purchasable in preview mode')
    lines.push({ id: nextId('demo-line'), variantId, quantity })
  }
  carts.set(id, lines)
  return build(id, lines)
}

export function demoUpdateLine(id: string, lineId: string, quantity: number): Cart {
  const lines = carts.get(id) ?? []
  const line = lines.find((item) => item.id === lineId)
  if (line) line.quantity = quantity
  return build(id, lines.filter((item) => item.quantity > 0))
}

export function demoRemoveLine(id: string, lineId: string): Cart {
  const lines = (carts.get(id) ?? []).filter((item) => item.id !== lineId)
  carts.set(id, lines)
  return build(id, lines)
}
