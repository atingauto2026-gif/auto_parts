import type { CatalogCategory, LandingContent, ShopProduct } from '#shared/types'
import {
  CATEGORY_META,
  fallbackLanding,
  fallbackProduct,
  fallbackProducts,
  withDedicatedDefaults,
} from '../data/catalog'
import { fetchProduct, fetchProducts, isShopifyConfigured } from '../utils/shopify'

/**
 * Shopify products carry title/description/media but not the editorial landing
 * copy. When a product has no local content override we still render a complete
 * page by deriving the structure from the product record itself.
 */
export function landingFromProduct(product: ShopProduct): LandingContent {
  const local = fallbackLanding(product.handle)
  if (local) return local

  const parts = product.title.split(/[—–|-]/)
  const code = (parts[0] ?? product.title).trim()
  const name = (parts.slice(1).join(' ') || product.productType || '').trim()

  const sentences = product.description
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  const category = CATEGORY_META.find(
    (item) => item.label.toLowerCase() === product.productType.toLowerCase(),
  )

  const landing: LandingContent = {
    code,
    name,
    category: category?.id ?? slugify(product.productType || 'product'),
    categoryLabel: product.productType || 'Product',
    tagline: sentences[0] ?? product.title,
    lead: sentences.slice(0, 2).join(' ') || product.title,
    badges: product.tags.filter((tag) => !tag.startsWith('_')).slice(0, 6),
    stats: [],
    highlights: [],
    why: sentences.slice(1, 7),
    features: [],
    metric: null,
    dataRows: [],
    gallery: product.images.slice(1, 5).map((image, index) => ({
      image: image.url,
      title: image.altText || `Detail ${index + 1}`,
      text: '',
    })),
    safety: [],
    compare: null,
    scenarios: [],
    specs: [],
    kit: [],
    video: null,
    heroImage: product.featuredImage?.url ?? product.images[0]?.url ?? null,
    galleryImages: product.images.map((image) => image.url),
  }

  return withDedicatedDefaults(
    landing,
    product.featuredImage?.url ?? product.images[0]?.url ?? '',
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function listProducts(): Promise<{
  source: 'shopify' | 'fallback'
  products: ShopProduct[]
}> {
  if (isShopifyConfigured()) {
    try {
      // Shopify is the source of truth — an empty shopify list is a valid
      // result, never a reason to show the bundled catalogue.
      return { source: 'shopify', products: await fetchProducts() }
    } catch (error) {
      console.warn('[shopify] product list failed, using bundled catalogue:', error)
    }
  }
  return { source: 'fallback', products: fallbackProducts() }
}

export async function getProductDetail(handle: string): Promise<{
  source: 'shopify' | 'fallback'
  product: ShopProduct
  landing: LandingContent
} | null> {
  if (isShopifyConfigured()) {
    try {
      const product = await fetchProduct(handle)
      // A handle Shopify does not know is a 404 — falling back to the bundled
      // catalogue would resurrect products that were deliberately removed.
      if (!product) return null
      return { source: 'shopify', product, landing: landingFromProduct(product) }
    } catch (error) {
      console.warn(`[shopify] product "${handle}" failed, using bundled catalogue:`, error)
    }
  }

  const product = fallbackProduct(handle)
  if (!product) return null
  const landing = fallbackLanding(handle)
  if (!landing) return null
  return { source: 'fallback', product, landing }
}

export function listCategories(): CatalogCategory[] {
  return CATEGORY_META
}
