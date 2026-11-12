import type { Cart } from '#shared/types'
import type { H3Event } from 'h3'
import {
  addCartLines,
  createCart,
  fetchCart,
  isShopifyConfigured,
  removeCartLines,
  updateCartLines,
} from './shopify'
import {
  demoAddLine,
  demoCreateCart,
  demoGetCart,
  demoRemoveLine,
  demoUpdateLine,
} from './demoCart'

const CART_COOKIE = 'vesper_cart'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function readCartId(event: H3Event): string | null {
  return getCookie(event, CART_COOKIE) ?? null
}

export function writeCartId(event: H3Event, cartId: string): void {
  setCookie(event, CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export function clearCartId(event: H3Event): void {
  deleteCookie(event, CART_COOKIE, { path: '/' })
}

export async function getCart(event: H3Event): Promise<Cart | null> {
  const id = readCartId(event)
  if (!id) return null

  if (isShopifyConfigured()) {
    const cart = await fetchCart(id)
    if (!cart) clearCartId(event)
    return cart
  }

  const cart = demoGetCart(id)
  if (!cart) clearCartId(event)
  return cart
}

/** Creates a cart on first write so read-only visits never allocate one. */
export async function requireCart(event: H3Event): Promise<Cart> {
  const existing = await getCart(event)
  if (existing) return existing

  const cart = isShopifyConfigured() ? await createCart([]) : demoCreateCart()
  writeCartId(event, cart.id)
  return cart
}

export async function addLine(
  event: H3Event,
  variantId: string,
  quantity: number,
): Promise<Cart> {
  const cart = await requireCart(event)

  if (isShopifyConfigured()) {
    return addCartLines(cart.id, [{ merchandiseId: variantId, quantity }])
  }

  const updated = demoAddLine(cart.id, variantId, quantity)
  writeCartId(event, updated.id)
  return updated
}

export async function changeLine(
  event: H3Event,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const cart = await requireCart(event)

  if (isShopifyConfigured()) {
    return updateCartLines(cart.id, [{ id: lineId, quantity }])
  }

  return demoUpdateLine(cart.id, lineId, quantity)
}

export async function deleteLine(event: H3Event, lineId: string): Promise<Cart> {
  const cart = await requireCart(event)

  if (isShopifyConfigured()) {
    return removeCartLines(cart.id, [lineId])
  }

  return demoRemoveLine(cart.id, lineId)
}
