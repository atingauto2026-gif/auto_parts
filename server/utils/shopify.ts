import type { Cart, ShopProduct } from '#shared/types'

interface ShopifyConnection {
  endpoint: string
  token: string
}

/**
 * Credentials are read from private runtime config (NUXT_SHOPIFY_*) so they
 * never reach the browser. Returns null when the storefront is not wired up
 * yet, which lets every route fall back to the bundled catalogue.
 */
export function shopifyConnection(): ShopifyConnection | null {
  const config = useRuntimeConfig()
  const domain = String(config.shopifyDomain || '').trim()
  const token = String(config.shopifyStorefrontToken || '').trim()
  if (!domain || !token) return null
  const version = String(config.shopifyApiVersion || '2025-10').trim()
  const host = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  return {
    endpoint: `https://${host}/api/${version}/graphql.json`,
    token,
  }
}

export function isShopifyConfigured(): boolean {
  return shopifyConnection() !== null
}

export async function storefront<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const connection = shopifyConnection()
  if (!connection) throw new Error('SHOPIFY_NOT_CONFIGURED')

  const response = await $fetch<{
    data?: T
    errors?: { message: string }[]
  }>(connection.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Storefront-Access-Token': connection.token,
    },
    body: { query, variables },
    retry: 0,
    timeout: 15000,
  })

  if (response.errors?.length) {
    throw new Error(response.errors.map((error) => error.message).join('; '))
  }
  if (!response.data) throw new Error('Empty Storefront API response')
  return response.data
}

/* -------------------------------------------------------------------------- */
/* Fragments                                                                  */
/* -------------------------------------------------------------------------- */

const IMAGE_FRAGMENT = `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    featuredImage { ...ImageFields }
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange {
      minVariantPrice { amount currencyCode }
    }
  }
`

const VARIANT_FRAGMENT = `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    selectedOptions { name value }
    image { ...ImageFields }
  }
`

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { ...ImageFields }
            product { title handle }
          }
        }
      }
    }
  }
`

/* -------------------------------------------------------------------------- */
/* Normalisers                                                                */
/* -------------------------------------------------------------------------- */

interface RawProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  productType: string
  vendor: string
  tags: string[]
  availableForSale: boolean
  featuredImage: ShopProduct['featuredImage']
  priceRange: ShopProduct['priceRange']
  compareAtPriceRange?: { minVariantPrice: { amount: string; currencyCode: string } } | null
  images?: { nodes: ShopProduct['images'] }
  variants?: { nodes: ShopProduct['variants'] }
}

export function normaliseProduct(raw: RawProduct): ShopProduct {
  const compareAt = raw.compareAtPriceRange?.minVariantPrice
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    productType: raw.productType,
    vendor: raw.vendor,
    tags: raw.tags ?? [],
    availableForSale: raw.availableForSale,
    featuredImage: raw.featuredImage ?? null,
    images: raw.images?.nodes ?? (raw.featuredImage ? [raw.featuredImage] : []),
    priceRange: raw.priceRange,
    compareAtPrice: compareAt && Number(compareAt.amount) > 0 ? compareAt : null,
    variants: (raw.variants?.nodes ?? []).map((variant) => ({
      ...variant,
      quantityAvailable: variant.quantityAvailable ?? null,
      compareAtPrice:
        variant.compareAtPrice && Number(variant.compareAtPrice.amount) > 0
          ? variant.compareAtPrice
          : null,
    })),
  }
}

interface RawCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: { amount: string; currencyCode: string }
    totalAmount: { amount: string; currencyCode: string }
  }
  lines: {
    nodes: {
      id: string
      quantity: number
      merchandise: {
        id: string
        title: string
        price: { amount: string; currencyCode: string }
        image: ShopProduct['featuredImage']
        product: { title: string; handle: string }
      }
    }[]
  }
}

export function normaliseCart(raw: RawCart): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: raw.cost.subtotalAmount,
    total: raw.cost.totalAmount,
    lines: raw.lines.nodes.map((line) => ({
      id: line.id,
      quantity: line.quantity,
      merchandise: {
        id: line.merchandise.id,
        title: line.merchandise.title,
        price: line.merchandise.price,
        image: line.merchandise.image ?? null,
        productTitle: line.merchandise.product.title,
        productHandle: line.merchandise.product.handle,
      },
    })),
  }
}

/* -------------------------------------------------------------------------- */
/* Operations                                                                 */
/* -------------------------------------------------------------------------- */

export async function fetchProducts(first = 48): Promise<ShopProduct[]> {
  const data = await storefront<{
    products: { nodes: RawProduct[] }
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${PRODUCT_FRAGMENT}
    query Products($first: Int!) {
      products(first: $first, sortKey: TITLE) {
        nodes { ...ProductFields }
      }
    }
    `,
    { first },
  )
  return data.products.nodes.map(normaliseProduct)
}

export async function fetchProduct(handle: string): Promise<ShopProduct | null> {
  const data = await storefront<{
    product: RawProduct | null
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${PRODUCT_FRAGMENT}
    ${VARIANT_FRAGMENT}
    query Product($handle: String!) {
      product(handle: $handle) {
        ...ProductFields
        images(first: 12) { nodes { ...ImageFields } }
        variants(first: 60) { nodes { ...VariantFields } }
      }
    }
    `,
    { handle },
  )
  return data.product ? normaliseProduct(data.product) : null
}

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await storefront<{
    cartCreate: {
      cart: RawCart | null
      userErrors: { field: string[] | null; message: string }[]
    }
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${CART_FRAGMENT}
    mutation CartCreate($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    `,
    {
      lines: lines.map((line) => ({
        merchandiseId: line.merchandiseId,
        quantity: line.quantity,
      })),
    },
  )

  const errors = data.cartCreate.userErrors
  if (errors.length) throw new Error(errors.map((error) => error.message).join('; '))
  if (!data.cartCreate.cart) throw new Error('Cart could not be created')
  return normaliseCart(data.cartCreate.cart)
}

export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await storefront<{ cart: RawCart | null }>(
    `
    ${IMAGE_FRAGMENT}
    ${CART_FRAGMENT}
    query Cart($id: ID!) {
      cart(id: $id) { ...CartFields }
    }
    `,
    { id: cartId },
  )
  return data.cart ? normaliseCart(data.cart) : null
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const data = await storefront<{
    cartLinesAdd: {
      cart: RawCart | null
      userErrors: { field: string[] | null; message: string }[]
    }
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${CART_FRAGMENT}
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    `,
    { cartId, lines },
  )

  const errors = data.cartLinesAdd.userErrors
  if (errors.length) throw new Error(errors.map((error) => error.message).join('; '))
  if (!data.cartLinesAdd.cart) throw new Error('Cart not found')
  return normaliseCart(data.cartLinesAdd.cart)
}

export async function updateCartLines(
  cartId: string,
  lines: { id: string; quantity: number }[],
): Promise<Cart> {
  const data = await storefront<{
    cartLinesUpdate: {
      cart: RawCart | null
      userErrors: { field: string[] | null; message: string }[]
    }
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${CART_FRAGMENT}
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    `,
    { cartId, lines },
  )

  const errors = data.cartLinesUpdate.userErrors
  if (errors.length) throw new Error(errors.map((error) => error.message).join('; '))
  if (!data.cartLinesUpdate.cart) throw new Error('Cart not found')
  return normaliseCart(data.cartLinesUpdate.cart)
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<Cart> {
  const data = await storefront<{
    cartLinesRemove: {
      cart: RawCart | null
      userErrors: { field: string[] | null; message: string }[]
    }
  }>(
    `
    ${IMAGE_FRAGMENT}
    ${CART_FRAGMENT}
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ...CartFields }
        userErrors { field message }
      }
    }
    `,
    { cartId, lineIds },
  )

  const errors = data.cartLinesRemove.userErrors
  if (errors.length) throw new Error(errors.map((error) => error.message).join('; '))
  if (!data.cartLinesRemove.cart) throw new Error('Cart not found')
  return normaliseCart(data.cartLinesRemove.cart)
}
