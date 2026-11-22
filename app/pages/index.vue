<script setup lang="ts">
import type { CatalogCategory, ShopProduct } from '#shared/types'

const config = useRuntimeConfig()
const router = useRouter()
const search = ref('')

const { data: catalog } = await useFetch<{
  source: string
  products: ShopProduct[]
}>('/api/products', { key: 'home-products' })

const { data: categoryData } = await useFetch<{ categories: CatalogCategory[] }>(
  '/api/categories',
  { key: 'home-categories' },
)

const products = computed(() => catalog.value?.products ?? [])
const categories = computed(() => categoryData.value?.categories ?? [])
const featured = computed(() =>
  products.value.filter((product) => product.tags.includes('Best Seller')).slice(0, 4),
)

function findParts() {
  const query = search.value.trim()
  router.push({ path: '/products', query: query ? { q: query } : {} })
}

useSeoMeta({
  title: 'Automotive sensors & control components',
  description:
    'OE-referenced automotive sensors, switches, solenoid valves and pressure monitoring components for wholesale buyers. Request pricing, MOQ and fitment support.',
  ogTitle: 'RoadReady Auto — automotive sensors & control components',
  ogDescription:
    'OE-referenced sensors, switches and control components for distributors, importers and workshop chains. Wholesale enquiries welcome.',
  ogType: 'website',
  ogImage: `${config.public.siteUrl}/og/og-cover.jpg`,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/` }],
})
</script>

<template>
  <div class="store-home">
    <div class="home-announcement">
      <span>Automotive components for global applications</span>
      <span class="home-announcement__dot">·</span>
      <span>OE references · Technical support · Wholesale enquiries</span>
    </div>

    <section class="home-hero">
      <img
        class="home-hero__image"
        src="/og/hero-components.jpg"
        alt="Automotive sensors, switches and solenoid valves on a workbench"
        fetchpriority="high"
      >
      <div class="home-hero__shade"></div>
      <div class="home-container home-hero__content">
        <p class="home-kicker"><span></span>Precision automotive components</p>
        <h1>Precision<br><em>in motion.</em></h1>
        <p class="home-hero__text">
          Sensors, switches and control components built for dependable vehicle performance. Find the right part with support from our team.
        </p>
        <form class="home-search" role="search" @submit.prevent="findParts">
          <label class="v-sr-only" for="part-search">Search auto parts and accessories</label>
          <input
            id="part-search"
            v-model="search"
            type="search"
            placeholder="Search by product name, OE number or part number"
          >
          <button type="submit" aria-label="Search">
            <span>Search catalogue</span>
            <AppIcon name="arrow-right" :size="17" />
          </button>
        </form>
        <div class="home-hero__links">
          <NuxtLink to="/products">Explore components <AppIcon name="arrow-right" :size="14" /></NuxtLink>
          <span>Popular: Coolant sensors · Solenoid valves · TPMS</span>
        </div>
      </div>
      <div class="home-hero__index">01 / ENGINEERED FOR PERFORMANCE</div>
    </section>

    <section class="home-assurance" aria-label="Why buyers work with us">
      <div class="home-container home-assurance__grid">
        <div><span class="home-assurance__mark">01</span><p><strong>OE-referenced catalogue</strong><small>Fitment checked before listing</small></p></div>
        <div><span class="home-assurance__mark">02</span><p><strong>Wholesale-ready supply</strong><small>MOQ, lead time and packing confirmed at quotation</small></p></div>
        <div><span class="home-assurance__mark">03</span><p><strong>Technical support</strong><small>Application and cross-reference help from our team</small></p></div>
      </div>
    </section>

    <section class="home-section home-categories">
      <div class="home-container">
        <div class="home-section__head">
          <div>
            <p class="home-kicker home-kicker--dark"><span></span>Our product range</p>
            <h2>Explore product categories</h2>
          </div>
          <NuxtLink to="/products" class="home-text-link">Browse categories <AppIcon name="arrow-right" :size="15" /></NuxtLink>
        </div>
        <div class="home-category-grid">
          <NuxtLink
            v-for="(category, index) in categories"
            :key="category.id"
            :to="`/products?category=${category.id}`"
            class="home-category"
          >
            <img :src="category.image" :alt="category.label" loading="lazy">
            <span class="home-category__number">0{{ index + 1 }}</span>
            <span class="home-category__label">{{ category.label }}</span>
            <span class="home-category__arrow"><AppIcon name="arrow-right" :size="17" /></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="home-section home-featured">
      <div class="home-container">
        <div class="home-section__head">
          <div>
            <p class="home-kicker home-kicker--dark"><span></span>RoadReady catalogue</p>
            <h2>Featured components</h2>
          </div>
          <NuxtLink to="/products" class="home-text-link">Browse catalogue <AppIcon name="arrow-right" :size="15" /></NuxtLink>
        </div>
        <div v-if="featured.length" class="p-grid home-product-grid">
          <ProductCard v-for="product in featured" :key="product.id" :product="product" />
        </div>
        <div v-else class="home-empty">
          <p>Our specialist catalogue is being prepared. Contact our team for availability, MOQ and OE reference support.</p>
          <NuxtLink to="/products" class="home-text-link">Browse all parts <AppIcon name="arrow-right" :size="15" /></NuxtLink>
        </div>
      </div>
    </section>

    <section class="home-callout">
      <div class="home-callout__image">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1400&q=85"
          alt="A well-equipped auto workshop"
          loading="lazy"
        >
      </div>
      <div class="home-callout__copy">
        <p class="home-kicker"><span></span>Need help identifying a part?</p>
        <h2>Let’s confirm<br><em>the right part.</em></h2>
        <p>Send us the OE number, factory number or an application photo. Our team will cross-reference the correct component and confirm availability.</p>
        <NuxtLink to="/contact" class="home-button">Request a quotation <AppIcon name="arrow-right" :size="16" /></NuxtLink>
      </div>
    </section>

    <section class="home-bottom">
      <div class="home-container home-bottom__inner">
        <div><span>PRECISION PARTS.</span><span>BUILT TO PERFORM.</span></div>
        <NuxtLink to="/products" class="home-bottom__link">Request a product quote <AppIcon name="arrow-right" :size="16" /></NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.store-home {
  --home-ink: #17212a;
  --home-muted: #66737d;
  --home-accent: #d97732;
  --home-paper: #f1f3f4;
  color: var(--home-ink);
}

.home-container { width: min(1240px, calc(100% - 48px)); margin-inline: auto; }
.home-announcement {
  display: flex; justify-content: center; gap: 10px; padding: 10px 20px;
  background: #d97732; color: #fff; font-size: 11px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
}
.home-announcement__dot { opacity: .7; }
.home-hero {
  position: relative; display: flex; align-items: center; min-height: min(690px, 76vw);
  overflow: hidden; background: #10171c; color: #fff;
}
.home-hero__image, .home-hero__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.home-hero__image { object-fit: cover; object-position: center 54%; }
.home-hero__shade {
  background: linear-gradient(90deg, rgba(13,19,24,.94) 0%, rgba(13,19,24,.76) 39%, rgba(13,17,19,.08) 100%),
    linear-gradient(0deg, rgba(13,17,19,.30), transparent 36%);
}
.home-hero__content { position: relative; z-index: 1; padding-block: 92px 100px; }
.home-kicker {
  display: flex; align-items: center; gap: 10px; color: #e79a63;
  font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
}
.home-kicker > span { width: 24px; height: 2px; background: currentColor; }
.home-hero h1 {
  margin-top: 23px; max-width: 700px; font-family: var(--v-font-display);
  font-size: clamp(4.1rem, 9.4vw, 8.3rem); font-weight: 800; line-height: .84;
  letter-spacing: -.055em; text-transform: uppercase;
}
.home-hero h1 em, .home-callout h2 em { color: #e79a63; font-style: normal; }
.home-hero__text { max-width: 440px; margin-top: 25px; color: rgba(255,255,255,.77); font-size: 16px; }
.home-search {
  display: flex; width: min(560px, 100%); margin-top: 31px; padding: 5px;
  border: 1px solid rgba(255,255,255,.25); border-radius: 3px; background: rgba(255,255,255,.97);
}
.home-search input { min-width: 0; flex: 1; padding: 0 15px; border: 0; outline: 0; background: transparent; color: #17212a; font-size: 14px; }
.home-search button, .home-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  padding: 13px 17px; border: 0; border-radius: 3px; background: #d97732;
  color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer;
  transition: background .2s, transform .2s;
}
.home-search button:hover, .home-button:hover { background: #ad5620; color: #fff; transform: translateY(-1px); }
.home-hero__links { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin-top: 19px; color: rgba(255,255,255,.6); font-size: 11px; }
.home-hero__links a { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-weight: 700; }
.home-hero__index { position: absolute; right: 30px; bottom: 28px; color: rgba(255,255,255,.7); font-size: 10px; font-weight: 700; letter-spacing: .16em; }
.home-assurance { background: #151d23; color: #fff; }
.home-assurance__grid { display: grid; grid-template-columns: repeat(3, 1fr); }
.home-assurance__grid > div { display: flex; align-items: center; gap: 16px; padding: 25px 28px; border-right: 1px solid rgba(255,255,255,.12); }
.home-assurance__grid > div:first-child { padding-left: 0; }
.home-assurance__grid > div:last-child { border: 0; }
.home-assurance__mark { color: #f0784d; font-family: var(--v-font-display); font-size: 23px; font-weight: 800; }
.home-assurance strong, .home-assurance small { display: block; }
.home-assurance strong { font-size: 12px; }
.home-assurance small { margin-top: 2px; color: rgba(255,255,255,.56); font-size: 11px; }
.home-section { padding: clamp(64px, 8vw, 102px) 0; }
.home-categories { background: var(--home-paper); }
.home-section__head { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 30px; }
.home-kicker--dark { color: #d97732; }
.home-section__head h2 { margin-top: 11px; font-size: clamp(2.2rem, 4vw, 3.8rem); line-height: .96; letter-spacing: -.04em; text-transform: uppercase; }
.home-text-link { display: inline-flex; align-items: center; gap: 9px; color: #34414a; font-size: 12px; font-weight: 700; }
.home-text-link:hover { color: var(--home-accent); }
.home-category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.home-category { position: relative; display: block; min-height: 225px; overflow: hidden; border-radius: 3px; background: #292f32; color: #fff; }
.home-category::after { position: absolute; inset: 0; content: ""; background: linear-gradient(0deg, rgba(11,14,15,.8), transparent 65%); }
.home-category img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .45s; }
.home-category:hover img { transform: scale(1.05); }
.home-category__number, .home-category__label, .home-category__arrow { position: absolute; z-index: 1; }
.home-category__number { top: 16px; left: 17px; color: rgba(255,255,255,.75); font-size: 10px; letter-spacing: .1em; }
.home-category__label { bottom: 19px; left: 18px; font-size: 18px; font-weight: 800; letter-spacing: -.02em; text-transform: uppercase; }
.home-category__arrow { right: 16px; bottom: 17px; display: grid; width: 31px; height: 31px; place-items: center; border: 1px solid rgba(255,255,255,.55); border-radius: 50%; transition: background .2s, border .2s; }
.home-category:hover .home-category__arrow { border-color: var(--home-accent); background: var(--home-accent); }
.home-featured { background: #fff; }
.home-product-grid { margin-top: 8px; }
.home-empty { display: flex; justify-content: space-between; padding: 35px; border: 1px solid #dce2e5; border-radius: 3px; }
.home-callout { display: grid; min-height: 480px; grid-template-columns: 1fr 1fr; background: #151d23; color: #fff; }
.home-callout__image { min-height: 380px; }
.home-callout__image img { width: 100%; height: 100%; object-fit: cover; }
.home-callout__copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(38px, 7vw, 96px); }
.home-callout h2 { margin-top: 19px; font-size: clamp(3rem, 5.2vw, 5.7rem); line-height: .88; letter-spacing: -.05em; text-transform: uppercase; }
.home-callout__copy > p:not(.home-kicker) { max-width: 420px; margin-top: 19px; color: rgba(255,255,255,.67); font-size: 14px; }
.home-button { margin-top: 25px; }
.home-bottom { background: #d97732; color: #fff; }
.home-bottom__inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-block: 40px; }
.home-bottom__inner > div { display: flex; flex-direction: column; font-family: var(--v-font-display); font-size: clamp(2rem, 4.5vw, 4rem); font-weight: 800; line-height: .88; letter-spacing: -.04em; }
.home-bottom__link { display: inline-flex; align-items: center; gap: 12px; padding: 13px 16px; border: 1px solid rgba(255,255,255,.55); border-radius: 5px; font-size: 12px; font-weight: 700; }
.home-bottom__link:hover { background: #fff; color: #b85d25; }

@media (max-width: 760px) {
  .home-container { width: min(100% - 36px, 600px); }
  .home-announcement { gap: 7px; font-size: 9px; letter-spacing: .08em; }
  .home-hero { min-height: 650px; }
  .home-hero__image { object-position: 58% center; }
  .home-hero__shade { background: linear-gradient(90deg, rgba(13,17,19,.87), rgba(13,17,19,.28)), linear-gradient(0deg, rgba(13,17,19,.55), transparent 60%); }
  .home-hero__content { padding-block: 75px 92px; }
  .home-hero h1 { font-size: clamp(4rem, 17vw, 6rem); }
  .home-hero__text { max-width: 330px; font-size: 14px; }
  .home-search { margin-top: 24px; }
  .home-search input { padding-inline: 10px; font-size: 12px; }
  .home-search button { gap: 7px; padding-inline: 11px; font-size: 11px; }
  .home-hero__links { gap: 12px; }
  .home-hero__links span { max-width: 190px; }
  .home-hero__index { right: 18px; bottom: 18px; }
  .home-assurance__grid { grid-template-columns: 1fr; padding-block: 8px; }
  .home-assurance__grid > div, .home-assurance__grid > div:first-child { padding: 14px 0; border-right: 0; border-bottom: 1px solid rgba(255,255,255,.12); }
  .home-assurance__grid > div:last-child { border-bottom: 0; }
  .home-section__head { align-items: flex-start; flex-direction: column; gap: 14px; }
  .home-section__head h2 { font-size: 2.5rem; }
  .home-category-grid { grid-template-columns: repeat(2, 1fr); gap: 9px; }
  .home-category { min-height: 165px; }
  .home-category__label { right: 42px; bottom: 14px; left: 13px; font-size: 14px; }
  .home-category__number { top: 12px; left: 13px; }
  .home-category__arrow { right: 10px; bottom: 10px; width: 27px; height: 27px; }
  .home-callout { grid-template-columns: 1fr; }
  .home-callout__image { min-height: 250px; max-height: 300px; }
  .home-callout__copy { padding: 42px 24px 48px; }
  .home-callout h2 { font-size: 3.8rem; }
  .home-bottom__inner { align-items: flex-start; flex-direction: column; }
}
</style>
