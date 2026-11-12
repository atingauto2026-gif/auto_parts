import { getCart } from '../../utils/cartStore'
import { isShopifyConfigured } from '../../utils/shopify'

export default defineEventHandler(async (event) => {
  const cart = await getCart(event)
  return { cart, checkoutEnabled: isShopifyConfigured() }
})
