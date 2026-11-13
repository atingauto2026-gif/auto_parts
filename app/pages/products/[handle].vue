<script setup lang="ts">
import type { LandingContent, ShopProduct } from '#shared/types'

definePageMeta({
  key: (route) => route.fullPath,
})

const route = useRoute()
const config = useRuntimeConfig()
const { add, pending, checkoutEnabled } = useCart()

const { data, error } = await useFetch<{
  source: 'supabase'
  product: ShopProduct
  landing: LandingContent
}>(() => `/api/products/${route.params.handle}`, { key: 'product-detail' })

if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const product = computed(() => data.value!.product)
const landing = computed(() => data.value!.landing)

/* --------------------------------------------------------------- content */

const heroImage = computed(
  () => landing.value.heroImage || product.value.featuredImage?.url || '',
)

const heroStats = computed(() => landing.value.stats.slice(0, 4))
const metrics = computed(() => landing.value.metrics ?? [])
const overview = computed(() => landing.value.overview ?? null)
const engineering = computed(() => landing.value.engineering ?? null)
const performance = computed(() => landing.value.performance ?? null)
const applications = computed(() => landing.value.applications ?? [])
const faq = computed(() => landing.value.faq ?? [])
const notes = computed(() => landing.value.notes ?? [])
const specs = computed(() => landing.value.specs)

const chartMax = computed(() =>
  Math.max(1, ...(performance.value?.points.map((point) => point.value) ?? [1])),
)

const envelope = computed(() => landing.value.gallery.slice(0, 4))
const safety = computed(() => landing.value.safety)

/* ------------------------------------------------------------- commerce */

const variants = computed(() => product.value.variants)
const variantOptions = computed(() => variants.value.map((item) => ({
  label: `${item.title}${item.availableForSale ? '' : ' — sold out'}`,
  value: item.id,
  disabled: !item.availableForSale,
})))
const selectedId = ref(variants.value[0]?.id ?? '')
const quantity = ref(1)
const added = ref(false)
const cartError = ref('')

const variant = computed(
  () => variants.value.find((item) => item.id === selectedId.value) ?? variants.value[0] ?? null,
)

const priceMoney = computed(
  () => variant.value?.price ?? product.value.priceRange?.minVariantPrice ?? null,
)

const price = computed(() => (priceMoney.value ? formatMoney(priceMoney.value) : null))

const compareAt = computed(() => {
  const value = variant.value?.compareAtPrice ?? product.value.compareAtPrice
  if (!value || !priceMoney.value) return null
  return Number(value.amount) > Number(priceMoney.value.amount) ? formatMoney(value) : null
})

const inStock = computed(() => variant.value?.availableForSale ?? product.value.availableForSale)

/** Variants with a stored price can be added to the persistent cart. */
const purchasable = computed(() => Boolean(variant.value?.price))

const whatsappHref = computed(() => {
  const message = `Hello! I'm interested in the ${landing.value.code} ${landing.value.name}. Could you send me pricing and lead time?`
  return `https://wa.me/${config.public.whatsapp}?text=${encodeURIComponent(message)}`
})

async function addToCart() {
  if (!variant.value?.price) return
  const variantPrice = variant.value.price
  cartError.value = ''
  try {
    await add(variant.value.id, quantity.value)
    added.value = true
    trackEvent('add_to_cart', {
      currency: variantPrice.currencyCode,
      value: Number(variantPrice.amount) * quantity.value,
      items: [
        {
          item_id: product.value.handle,
          item_name: pageTitle.value,
          item_variant: variant.value.title,
          price: Number(variantPrice.amount),
          quantity: quantity.value,
        },
      ],
    })
    window.setTimeout(() => {
      added.value = false
    }, 2600)
  } catch (cause) {
    cartError.value = errorMessage(cause)
  }
}

function trackWhatsApp() {
  trackEvent('contact', { method: 'whatsapp', product: landing.value.code })
}

/* GA4 ecommerce: view_item fires once the product data is on the client. */
onMounted(() => {
  const money = product.value.priceRange?.minVariantPrice
  if (!money) return
  trackEvent('view_item', {
    currency: money.currencyCode,
    value: Number(money.amount),
    items: [
      {
        item_id: product.value.handle,
        item_name: pageTitle.value,
        price: Number(money.amount),
      },
    ],
  })
})

/* ------------------------------------------------------------------ seo */

const absoluteHero = computed(() =>
  heroImage.value.startsWith('http') ? heroImage.value : `${config.public.siteUrl}${heroImage.value}`,
)

const metaDescription = computed(() => {
  const text = landing.value.lead || landing.value.tagline
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}…` : text
})

const pageTitle = computed(() => `${landing.value.code} ${landing.value.name}`)

useSeoMeta({
  title: () => pageTitle.value,
  description: () => metaDescription.value,
  ogTitle: () => `${pageTitle.value} | RoadReady Auto`,
  ogDescription: () => metaDescription.value,
  ogType: 'website',
  ogImage: () => absoluteHero.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => `${pageTitle.value} | RoadReady Auto`,
  twitterDescription: () => metaDescription.value,
  twitterImage: () => absoluteHero.value,
})

const productLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: pageTitle.value,
  description: metaDescription.value,
  image: [absoluteHero.value],
  sku: landing.value.code,
  category: landing.value.categoryLabel,
  brand: { '@type': 'Brand', name: 'RoadReady Auto' },
  offers: product.value.priceRange
    ? {
        '@type': 'Offer',
        url: `${config.public.siteUrl}/products/${product.value.handle}`,
        priceCurrency: product.value.priceRange.minVariantPrice.currencyCode,
        price: product.value.priceRange.minVariantPrice.amount,
        availability: product.value.availableForSale
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'RoadReady Auto' },
      }
    : undefined,
}))

const breadcrumbLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${config.public.siteUrl}/` },
    { '@type': 'ListItem', position: 2, name: 'Products', item: `${config.public.siteUrl}/products` },
    {
      '@type': 'ListItem',
      position: 3,
      name: landing.value.categoryLabel,
      item: `${config.public.siteUrl}/products?category=${landing.value.category}`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: pageTitle.value,
      item: `${config.public.siteUrl}/products/${product.value.handle}`,
    },
  ],
}))

const faqLd = computed(() =>
  faq.value.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.value.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }
    : null,
)

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/products/${product.value.handle}` }],
  script: [
    { type: 'application/ld+json', innerHTML: JSON.stringify(productLd.value) },
    { type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbLd.value) },
  ],
})

if (faqLd.value) {
  useHead({
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(faqLd.value) }],
  })
}
</script>

<template>
  <div class="dl">
    <!-- 1 · Hero -->
    <section id="top" class="dl-hero dl-anchor">
      <img
        v-if="heroImage"
        class="dl-hero__media"
        :src="heroImage"
        :alt="`${landing.code} ${landing.name}`"
        fetchpriority="high"
      >
      <div class="dl-hero__shade"></div>

      <div class="dl-inner">
        <div class="dl-hero__copy">
          <p class="dl-hero__eyebrow">{{ landing.categoryLabel }}</p>

          <h1>
            <span class="dl-hero__model">{{ landing.code }}</span>
            <span>{{ landing.name }}</span>
          </h1>

          <p class="dl-hero__summary">{{ landing.lead }}</p>

          <div class="dl-hero__actions">
            <a class="dl-cta" href="#quote">Request a quote</a>
            <a class="dl-ghost" href="#specs">View specifications</a>
          </div>
        </div>

        <dl v-if="heroStats.length" class="dl-hero__stats">
          <div v-for="stat in heroStats" :key="stat.label" class="dl-hero__stat">
            <dt>{{ stat.label }}</dt>
            <dd>{{ stat.value }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 2 · Overview -->
    <section id="overview" class="dl-section dl-section--flush dl-anchor">
      <div class="dl-inner">
        <div v-if="overview" class="dl-split">
          <div class="dl-split__copy" data-reveal>
            <p class="dl-eyebrow">Overview</p>
            <h2>{{ overview.heading }}</h2>
            <p v-for="line in overview.paragraphs" :key="line" class="dl-lede">{{ line }}</p>
          </div>

          <figure v-if="heroImage" class="dl-figure dl-figure--tall" data-reveal>
            <img :src="heroImage" :alt="`${landing.code} ${landing.name}`" loading="lazy">
          </figure>
        </div>

        <dl v-if="metrics.length" class="dl-metrics">
          <div v-for="metric in metrics" :key="metric.label" class="dl-metric" data-reveal>
            <dd>{{ metric.value }}<span v-if="metric.unit">{{ metric.unit }}</span></dd>
            <dt>{{ metric.label }}</dt>
          </div>
        </dl>
      </div>
    </section>

    <!-- 3 · Order -->
    <section id="buy" class="dl-section dl-anchor">
      <div class="dl-inner">
        <div class="dl-buy" data-reveal>
          <div class="dl-buy__main">
            <p class="dl-eyebrow" style="margin-bottom: 0">Order</p>

            <div class="dl-buy__price">
              <strong>{{ price ?? 'Request a quote' }}</strong>
              <s v-if="compareAt">{{ compareAt }}</s>
              <a-tag v-if="price" :color="inStock ? 'success' : 'default'" class="dl-stock-tag">{{ inStock ? 'In stock' : 'Out of stock' }}</a-tag>
            </div>

            <div v-if="variants.length > 1" class="dl-form">
              <label>
                Configuration
                <a-select
                  v-model:value="selectedId"
                  :options="variantOptions"
                  class="dl-variant-select"
                />
              </label>
            </div>

            <div class="dl-buy__row">
              <div class="dl-form">
                <label>
                  Quantity
                  <QuantityStepper v-model="quantity" :min="1" :max="20" />
                </label>
              </div>

              <a-button
                type="primary"
                size="large"
                block
                class="dl-ant-buy"
                :loading="pending"
                :disabled="!inStock || !purchasable"
                @click="addToCart"
              >
                <template v-if="added">Added to cart</template>
                <template v-else-if="!purchasable">Request a quote</template>
                <template v-else-if="!inStock">Out of stock</template>
                <template v-else>Add to cart — {{ price }}</template>
              </a-button>
            </div>

            <a-alert v-if="cartError" class="dl-commerce-alert" type="error" show-icon :message="cartError" />
            <a-alert
              v-if="!checkoutEnabled"
              class="dl-commerce-alert"
              type="info"
              show-icon
              message="Checkout not yet available"
              description="Your product catalogue and cart are powered by Supabase. Online checkout will be enabled after a payment provider is connected."
            />
          </div>

          <aside class="dl-buy__aside">
            <h3>Check compatibility before you order</h3>
            <p>
              Fitment can vary by year, trim and market. Share your vehicle details with our team
              if you want a second opinion before ordering.
            </p>

            <ul v-if="landing.features.length" class="dl-buy__list">
              <li v-for="feature in landing.features.slice(0, 3)" :key="feature">
                <AppIcon name="check" :size="14" />
                <span>{{ feature }}</span>
              </li>
            </ul>

            <a v-if="config.public.whatsapp" :href="whatsappHref" target="_blank" rel="noopener" class="dl-ghost" style="justify-content: center" @click="trackWhatsApp">
              <AppIcon name="whatsapp" :size="16" />
              Chat on WhatsApp
            </a>
            <NuxtLink v-else to="/contact" class="dl-ghost" style="justify-content: center">
              Ask about fitment
            </NuxtLink>
          </aside>
        </div>
      </div>
    </section>

    <!-- 4 · Engineering -->
    <section v-if="engineering" id="engineering" class="dl-section dl-section--soft dl-anchor">
      <div class="dl-inner">
        <div class="dl-stack">
          <figure v-if="engineering.image" class="dl-stack__figure" data-reveal>
            <img :src="engineering.image" :alt="engineering.heading" loading="lazy">
          </figure>

          <div class="dl-stack__copy" data-reveal>
            <p class="dl-eyebrow">Engineering</p>
            <h2>{{ engineering.heading }}</h2>
            <p class="dl-lede">{{ engineering.lead }}</p>

            <ul class="dl-sensor-list">
              <li v-for="item in engineering.items" :key="item.name">
                <p class="dl-sensor-list__head">
                  <span>{{ item.name }}</span>
                  <strong>{{ item.value }}</strong>
                </p>
                <p v-if="item.detail" class="dl-sensor-list__detail">{{ item.detail }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 5 · Performance -->
    <section v-if="performance" class="dl-section">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Performance</p>
          <h2>{{ performance.heading }}</h2>
          <p class="dl-lede">{{ performance.lead }}</p>
        </div>

        <div class="dl-perf">
          <div class="dl-chart" data-reveal>
            <div class="dl-chart__plot">
              <div v-for="point in performance.points" :key="point.label" class="dl-chart__col">
                <span class="dl-chart__value">{{ point.caption }}</span>
                <span
                  class="dl-chart__bar"
                  :style="{ height: `${Math.round((point.value / chartMax) * 100)}%` }"
                ></span>
                <span class="dl-chart__caption">{{ point.label }}</span>
              </div>
            </div>
            <p class="dl-chart__title">{{ performance.chartTitle }}</p>
            <p class="dl-chart__note">{{ performance.note }}</p>
          </div>

          <figure v-if="performance.figureImage" class="dl-tether" data-reveal>
            <img :src="performance.figureImage" :alt="performance.figureTitle" loading="lazy">
            <figcaption>
              <h3>{{ performance.figureTitle }}</h3>
              <p>{{ performance.figureText }}</p>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- 6 · Engineering detail -->
    <section v-if="envelope.length" class="dl-section">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Detail</p>
          <h2>Close-up on the engineering</h2>
          <p class="dl-lede">
            The hardware decisions behind the specification — not optional extras.
          </p>
        </div>

        <div class="dl-cards">
          <article v-for="(item, index) in envelope" :key="item.title" class="dl-card" data-reveal>
            <img :src="item.image" :alt="item.title" loading="lazy">
            <div class="dl-card__body">
              <span class="dl-card__index">0{{ index + 1 }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 6b · Safety systems -->
    <section v-if="safety.length" class="dl-section dl-section--panel">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Operating envelope</p>
          <h2>Built to stop before something goes wrong</h2>
        </div>

        <div class="dl-apps">
          <article
            v-for="(item, index) in safety"
            :key="item.title"
            class="dl-app"
            data-reveal
          >
            <span class="dl-app__index">0{{ index + 1 }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 7 · Applications -->
    <section v-if="applications.length" class="dl-section">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Applications</p>
          <h2>Where it earns its keep</h2>
        </div>

        <div class="dl-apps">
          <article
            v-for="(item, index) in applications"
            :key="item.title"
            class="dl-app"
            data-reveal
          >
            <span class="dl-app__index">0{{ index + 1 }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 8 · Specifications -->
    <section v-if="specs.length" id="specs" class="dl-section dl-anchor">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Specifications</p>
          <h2><span class="dl-accent">{{ landing.code }}</span> full specification</h2>
        </div>

        <div class="dl-spec-groups">
          <div v-for="group in specs" :key="group.title" data-reveal>
            <div class="dl-spec-group__title">{{ group.title }}</div>
            <table class="dl-spec-table">
              <tbody>
                <tr v-for="item in group.items" :key="item.label">
                  <th scope="row">{{ item.label }}</th>
                  <td>{{ item.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- 9 · FAQ -->
    <section v-if="faq.length" id="faq" class="dl-section dl-section--panel dl-anchor">
      <div class="dl-inner">
        <div class="dl-section__head" data-reveal>
          <p class="dl-eyebrow">Questions</p>
          <h2>Before you commit</h2>
        </div>

        <div class="dl-faq">
          <details v-for="item in faq" :key="item.q" class="dl-faq__item" data-reveal>
            <summary>{{ item.q }}</summary>
            <div class="dl-faq__answer"><p>{{ item.a }}</p></div>
          </details>
        </div>
      </div>
    </section>

    <!-- 10 · Quote -->
    <section id="quote" class="dl-quote dl-anchor">
      <div class="dl-inner dl-quote__inner">
        <div class="dl-quote__copy" data-reveal>
          <p class="dl-eyebrow">Request a quote</p>
          <h2>Need a hand with {{ landing.code }}?</h2>
          <p class="dl-quote__lead">
            Send us your vehicle make, model, year and the part you’re considering. We’ll help you
            check the details before you buy.
          </p>

          <ul class="dl-quote__points">
            <li>Share your make, model and year</li>
            <li>Ask about product fitment and installation</li>
            <li>Get help finding the right category</li>
          </ul>
        </div>

        <div data-reveal>
          <DedicatedQuoteForm :product="`${landing.code} ${landing.name}`" :code="landing.code" />
        </div>
      </div>
    </section>

    <!-- 11 · Notes -->
    <section v-if="notes.length" class="dl-notes">
      <div class="dl-inner dl-notes__inner">
        <p v-for="line in notes" :key="line">{{ line }}</p>
      </div>
    </section>
  </div>
</template>
