export interface Money {
  amount: string
  currencyCode: string
}

export interface ShopImage {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export interface ShopVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable: number | null
  /** Null only in the bundled preview catalogue — Shopify variants always carry a price. */
  price: Money | null
  compareAtPrice: Money | null
  selectedOptions: { name: string; value: string }[]
  image: ShopImage | null
}

export interface ShopProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  productType: string
  vendor: string
  tags: string[]
  availableForSale: boolean
  featuredImage: ShopImage | null
  images: ShopImage[]
  /** Null only in the bundled preview catalogue — Shopify products always carry a price range. */
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money } | null
  compareAtPrice: Money | null
  variants: ShopVariant[]
}

export interface CartLine {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: Money
    image: ShopImage | null
    productTitle: string
    productHandle: string
  }
}

export interface Cart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  subtotal: Money
  total: Money
  lines: CartLine[]
}

export interface CatalogCategory {
  id: string
  label: string
  blurb: string
  image: string
}

/* -------------------------------------------------------------------------- */
/* Product landing content                                                    */
/* -------------------------------------------------------------------------- */

export interface LandingStat {
  value: string
  label: string
}

export interface LandingHighlight {
  title: string
  text: string
  icon?: string
}

export interface LandingSpecItem {
  label: string
  value: string
}

export interface LandingSpecGroup {
  title: string
  items: LandingSpecItem[]
}

export interface LandingMediaItem {
  image: string
  title: string
  text: string
}

export interface LandingCompare {
  head: string[]
  rows: string[][]
}

/* -------------------------------------------------------------------------- */
/* Dedicated landing-page blocks                                              */
/* -------------------------------------------------------------------------- */

export interface LandingOverview {
  heading: string
  paragraphs: string[]
}

export interface LandingMetric {
  value: string
  unit: string
  label: string
}

export interface LandingEngineeringItem {
  name: string
  value: string
  detail: string
}

export interface LandingEngineering {
  image: string
  heading: string
  lead: string
  items: LandingEngineeringItem[]
}

export interface LandingChartPoint {
  label: string
  value: number
  caption: string
}

export interface LandingPerformance {
  heading: string
  lead: string
  chartTitle: string
  note: string
  points: LandingChartPoint[]
  figureImage: string
  figureTitle: string
  figureText: string
}

export interface LandingApplication {
  title: string
  desc: string
}

export interface LandingFaq {
  q: string
  a: string
}

export interface LandingContent {
  code: string
  name: string
  category: string
  categoryLabel: string
  tagline: string
  lead: string
  badges: string[]
  stats: LandingStat[]
  highlights: LandingHighlight[]
  why: string[]
  features: string[]
  metric: { value: string; label: string; note: string } | null
  dataRows: LandingSpecItem[]
  gallery: LandingMediaItem[]
  safety: { title: string; text: string }[]
  compare: LandingCompare | null
  scenarios: LandingMediaItem[]
  specs: LandingSpecGroup[]
  kit: { label: string; qty: string }[]
  video: string | null
  heroImage: string | null
  galleryImages: string[]
  overview?: LandingOverview | null
  metrics?: LandingMetric[]
  engineering?: LandingEngineering | null
  performance?: LandingPerformance | null
  applications?: LandingApplication[]
  faq?: LandingFaq[]
  notes?: string[]
}
