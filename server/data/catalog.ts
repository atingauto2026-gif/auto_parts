import type {
  CatalogCategory,
  LandingContent,
  ShopImage,
  ShopProduct,
  ShopVariant,
} from '#shared/types'

const photos = {
  car: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
  workshop: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1200&q=85',
  wheel: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85',
  interior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',
  road: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
  tools: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=85',
}

export const CATEGORY_META: CatalogCategory[] = [
  { id: 'lighting', label: 'Lighting', blurb: 'See more. Drive with confidence.', image: photos.car },
  { id: 'performance', label: 'Performance', blurb: 'Parts that put you in control.', image: photos.wheel },
  { id: 'interior', label: 'Interior', blurb: 'A better fit for every journey.', image: photos.interior },
  { id: 'exterior', label: 'Exterior', blurb: 'Protection and utility, made to fit.', image: photos.road },
  { id: 'tools', label: 'Tools & Recovery', blurb: 'Be ready for the road ahead.', image: photos.tools },
  { id: 'maintenance', label: 'Maintenance', blurb: 'Keep your vehicle running right.', image: photos.workshop },
]

interface Seed {
  handle: string
  code: string
  name: string
  category: string
  categoryLabel: string
  price: number
  compareAtPrice?: number
  image: string
  tagline: string
  badges: string[]
  features: string[]
  specs: { label: string; value: string }[]
  isNew?: boolean
  best?: boolean
}

const SEEDS: Seed[] = [
  {
    handle: 'led-headlight-upgrade-kit',
    code: 'NIGHTDRIVE',
    name: 'LED Headlight Upgrade Kit',
    category: 'lighting',
    categoryLabel: 'Lighting',
    price: 189,
    compareAtPrice: 229,
    image: photos.car,
    tagline: 'A brighter, cleaner beam for late-night drives. Plug-and-play fitment for select vehicles.',
    badges: ['Plug & play', 'Best Seller'],
    features: ['Bright, crisp white output', 'Compact driver for easy installation', 'Built-in thermal protection', 'Pair of bulbs included'],
    specs: [{ label: 'Bulb type', value: 'H11 / H9 compatible' }, { label: 'Colour temperature', value: '6000K cool white' }, { label: 'In the box', value: '2 LED bulbs, driver modules' }],
    best: true,
  },
  {
    handle: 'all-terrain-tire-set',
    code: 'TRAILMARK',
    name: 'All-Terrain Tire',
    category: 'performance',
    categoryLabel: 'Performance',
    price: 249,
    image: photos.wheel,
    tagline: 'A confident all-terrain tread for daily commutes, weekend trails and the miles in between.',
    badges: ['All terrain', 'Road tested'],
    features: ['Balanced road and trail grip', 'Reinforced sidewall construction', 'Wide tread blocks for confident handling', 'Available in popular fitments'],
    specs: [{ label: 'Tread', value: 'All-terrain, 3PMSF rated' }, { label: 'Construction', value: 'Radial, reinforced sidewall' }, { label: 'Sold as', value: 'Single tire' }],
    isNew: true,
  },
  {
    handle: 'all-weather-floor-mats',
    code: 'CABINSHIELD',
    name: 'All-Weather Floor Mats',
    category: 'interior',
    categoryLabel: 'Interior',
    price: 119,
    compareAtPrice: 149,
    image: photos.interior,
    tagline: 'Custom-fit floor protection with deep channels that keep mud, spills and everyday mess contained.',
    badges: ['Custom fit', 'Easy clean'],
    features: ['Vehicle-specific shape', 'Raised edges help contain spills', 'Non-slip backing', 'Rinse clean in seconds'],
    specs: [{ label: 'Material', value: 'Odour-resistant TPE' }, { label: 'Coverage', value: 'Front and rear row' }, { label: 'Fit', value: 'Select makes and models' }],
    best: true,
  },
  {
    handle: 'aluminium-roof-rack-crossbars',
    code: 'ROAMER',
    name: 'Aluminium Roof Rack Crossbars',
    category: 'exterior',
    categoryLabel: 'Exterior',
    price: 279,
    image: photos.road,
    tagline: 'Free up cabin space with a low-profile rack system made for weekend gear and everyday utility.',
    badges: ['Lightweight', 'Lockable'],
    features: ['Aircraft-grade aluminium bars', 'Low-profile aerodynamic design', 'Lockable end caps', 'Vehicle-specific mounting kit'],
    specs: [{ label: 'Material', value: 'Anodised aluminium' }, { label: 'Finish', value: 'Matte black' }, { label: 'Load rating', value: 'Check vehicle roof limit' }],
  },
  {
    handle: 'dual-channel-dash-camera',
    code: 'ROADREC',
    name: 'Dual-Channel Dash Camera',
    category: 'interior',
    categoryLabel: 'Interior',
    price: 219,
    compareAtPrice: 259,
    image: photos.car,
    tagline: 'Clear front and rear recording with a wide field of view, night vision and parking mode.',
    badges: ['Front + rear', 'Night vision'],
    features: ['2K front and 1080p rear recording', 'Wide-angle glass lens', 'Loop recording with G-sensor', 'Parking mode with hardwire kit'],
    specs: [{ label: 'Front camera', value: '2K QHD' }, { label: 'Rear camera', value: 'Full HD 1080p' }, { label: 'Storage', value: 'MicroSD up to 256 GB (sold separately)' }],
    best: true,
  },
  {
    handle: 'ceramic-brake-pad-set',
    code: 'STOPLINE',
    name: 'Ceramic Brake Pad Set',
    category: 'performance',
    categoryLabel: 'Performance',
    price: 89,
    image: photos.workshop,
    tagline: 'Dependable stopping power with low dust and quiet operation for your daily driver.',
    badges: ['Low dust', 'Quiet ride'],
    features: ['Smooth, predictable braking', 'Low-dust ceramic compound', 'Anti-squeal shims included', 'Axle set with fitting hardware'],
    specs: [{ label: 'Compound', value: 'Ceramic' }, { label: 'Includes', value: 'Pads for one axle, hardware kit' }, { label: 'Fitment', value: 'Vehicle-specific; confirm before ordering' }],
  },
  {
    handle: 'compact-lithium-jump-starter',
    code: 'SPARK',
    name: 'Compact Lithium Jump Starter',
    category: 'tools',
    categoryLabel: 'Tools & Recovery',
    price: 149,
    image: photos.tools,
    tagline: 'A pocket-sized backup for unexpected flat batteries, with USB charging for your devices.',
    badges: ['12V', 'Road trip ready'],
    features: ['For compatible 12V petrol engines', 'Reverse-polarity and spark protection', 'USB power bank function', 'Compact carry case included'],
    specs: [{ label: 'System voltage', value: '12V' }, { label: 'Safety', value: 'Reverse-polarity protection' }, { label: 'In the box', value: 'Starter, clamps, USB cable, case' }],
    isNew: true,
  },
  {
    handle: 'synthetic-engine-oil-5w30',
    code: 'MILESTONE',
    name: 'Full Synthetic Engine Oil 5W-30',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    price: 54,
    image: photos.workshop,
    tagline: 'Full synthetic protection for a wide range of modern petrol engines. Always check your owner manual.',
    badges: ['Full synthetic', '4.73 L'],
    features: ['Helps protect against wear', 'Designed for modern engines', 'Convenient 5-quart size', 'Check viscosity and approvals in your manual'],
    specs: [{ label: 'Viscosity', value: 'SAE 5W-30' }, { label: 'Volume', value: '4.73 L (5 US qt)' }, { label: 'Type', value: 'Full synthetic' }],
  },
]

function toImage(url: string, alt: string): ShopImage {
  return { url, altText: alt, width: 1400, height: 1000 }
}

function toProduct(seed: Seed): ShopProduct {
  const image = toImage(seed.image, seed.name)
  const money = (amount: number) => ({ amount: amount.toFixed(2), currencyCode: 'AUD' })
  const variantId = `gid://shopify/ProductVariant/fallback-${seed.handle}`
  const price = money(seed.price)
  const variant: ShopVariant = {
    id: variantId,
    title: 'Default Title',
    availableForSale: true,
    quantityAvailable: null,
    price,
    compareAtPrice: seed.compareAtPrice ? money(seed.compareAtPrice) : null,
    selectedOptions: [{ name: 'Title', value: 'Default Title' }],
    image,
  }
  const tags = [seed.category, ...seed.badges]
  if (seed.best) tags.push('Best Seller')
  if (seed.isNew) tags.push('New Release')

  return {
    id: `gid://shopify/Product/fallback-${seed.handle}`,
    handle: seed.handle,
    title: `${seed.code} — ${seed.name}`,
    description: seed.tagline,
    descriptionHtml: `<p>${seed.tagline}</p>`,
    productType: seed.categoryLabel,
    vendor: 'RoadReady Auto',
    tags,
    availableForSale: true,
    featuredImage: image,
    images: [image],
    priceRange: { minVariantPrice: price, maxVariantPrice: price },
    compareAtPrice: seed.compareAtPrice ? money(seed.compareAtPrice) : null,
    variants: [variant],
  }
}

export function fallbackProducts(): ShopProduct[] {
  return SEEDS.map(toProduct)
}

export function fallbackProduct(handle: string): ShopProduct | null {
  const seed = SEEDS.find((item) => item.handle === handle)
  return seed ? toProduct(seed) : null
}

export function fallbackCategories(): CatalogCategory[] {
  return CATEGORY_META
}

export function withDedicatedDefaults(landing: LandingContent, fallbackImage: string): LandingContent {
  return {
    ...landing,
    overview: landing.overview ?? {
      heading: `${landing.code} ${landing.name}`,
      paragraphs: [landing.lead || landing.tagline],
    },
    metrics: landing.metrics ?? [],
    engineering: landing.engineering ?? null,
    applications: landing.applications ?? landing.features.slice(0, 4).map((title) => ({ title, desc: '' })),
    faq: landing.faq ?? [],
    notes: landing.notes ?? [],
    performance: landing.performance ?? null,
    heroImage: landing.heroImage || fallbackImage,
  }
}

export function fallbackLanding(handle: string): LandingContent | null {
  const seed = SEEDS.find((item) => item.handle === handle)
  if (!seed) return null

  const landing: LandingContent = {
    code: seed.code,
    name: seed.name,
    category: seed.category,
    categoryLabel: seed.categoryLabel,
    tagline: seed.tagline,
    lead: seed.tagline,
    badges: seed.badges,
    stats: [],
    highlights: seed.features.map((title) => ({ title, text: '' })),
    why: seed.features,
    features: seed.features,
    metric: null,
    dataRows: seed.specs,
    gallery: [],
    safety: [],
    compare: null,
    scenarios: [],
    specs: [{ title: 'Product details', items: seed.specs }],
    kit: [],
    video: null,
    heroImage: seed.image,
    galleryImages: [seed.image],
    overview: { heading: 'Made for the miles ahead', paragraphs: [seed.tagline] },
    applications: seed.features.slice(0, 4).map((title) => ({ title, desc: '' })),
    faq: [
      { q: 'How do I check that this fits my vehicle?', a: 'Use the make, model and year on the product listing and compare with your owner manual. If you are unsure, contact our team before ordering.' },
      { q: 'Is installation included?', a: 'Installation is not included unless explicitly listed. Check the product details and consider a qualified installer for safety-critical components.' },
      { q: 'Can I return an item that does not fit?', a: 'Contact support with your order details before installing the product. Return eligibility depends on the item condition and applicable consumer laws.' },
    ],
    notes: ['Preview catalog pricing is illustrative and may change when a live store is connected.', 'Always confirm compatibility and manufacturer requirements before purchase.'],
  }

  return landing
}
