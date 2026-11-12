import { listCategories } from '../utils/catalogService'
import { isShopifyConfigured } from '../utils/shopify'

export default defineEventHandler(() => {
  return {
    categories: listCategories(),
    storefrontConfigured: isShopifyConfigured(),
  }
})
