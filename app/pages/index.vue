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
  title: 'Auto parts for every road',
  description:
    'Shop carefully selected auto parts and accessories for your next drive. Find lighting, performance upgrades, interior essentials and more.',
  ogTitle: 'RoadReady Auto | Parts for every road',
  ogDescription:
    'Thoughtful upgrades, dependable essentials and a better way to shop auto parts.',
  ogType: 'website',
  ogImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=85',
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/` }],
})
</script>

<template>
  <div class="store-home">
    <div class="home-announcement">
      <span>Built for the road ahead</span>
      <span class="home-announcement__dot">·</span>
      <span>Find the right part for your next drive</span>
    </div>

    <section class="home-hero">
      <img
        class="home-hero__image"
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2200&q=90"
        alt="Sport sedan ready for the open road"
        fetchpriority="high"
      >
      <div class="home-hero__shade"></div>
      <div class="home-container home-hero__content">
        <p class="home-kicker"><span></span>Parts for every road</p>
        <h1>Make every<br><em>mile count.</em></h1>
        <p class="home-hero__text">
          The upgrades you want. The essentials you need. Find your next favorite thing for the drive.
        </p>
        <form class="home-search" role="search" @submit.prevent="findParts">
          <label class="v-sr-only" for="part-search">Search auto parts and accessories</label>
          <input
            id="part-search"
            v-model="search"
            type="search"
            placeholder="Search parts, accessories, or brands"
          >
          <button type="submit" aria-label="Search">
            <span>Find parts</span>
            <AppIcon name="arrow-right" :size="17" />
          </button>
        </form>
        <div class="home-hero__links">
          <NuxtLink to="/products">Shop all parts <AppIcon name="arrow-right" :size="14" /></NuxtLink>
          <span>Popular: LED lighting · floor mats · dash cams</span>
        </div>
      </div>
      <div class="home-hero__index">01 / DRIVE BETTER</div>
    </section>

    <section class="home-assurance" aria-label="Why shop with us">
      <div class="home-container home-assurance__grid">
        <div><span class="home-assurance__mark">01</span><p><strong>Picked with purpose</strong><small>Quality gear, no guesswork</small></p></div>
        <div><span class="home-assurance__mark">02</span><p><strong>Fitment-first help</strong><small>Get the right part for your ride</small></p></div>
        <div><span class="home-assurance__mark">03</span><p><strong>Ready for the road</strong><small>Support from real people</small></p></div>
      </div>
    </section>

    <section class="home-section home-categories">
      <div class="home-container">
        <div class="home-section__head">
          <div>
            <p class="home-kicker home-kicker--dark"><span></span>Find your fit</p>
            <h2>Shop by category</h2>
          </div>
          <NuxtLink to="/products" class="home-text-link">Explore all parts <AppIcon name="arrow-right" :size="15" /></NuxtLink>
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
            <p class="home-kicker home-kicker--dark"><span></span>Good gear, great drives</p>
            <h2>Shop the favorites</h2>
          </div>
          <NuxtLink to="/products" class="home-text-link">View the collection <AppIcon name="arrow-right" :size="15" /></NuxtLink>
        </div>
        <div v-if="featured.length" class="p-grid home-product-grid">
          <ProductCard v-for="product in featured" :key="product.id" :product="product" />
        </div>
        <div v-else class="home-empty">
          <p>Our next collection is on its way.</p>
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
        <p class="home-kicker"><span></span>Not sure what fits?</p>
        <h2>Let’s get your<br><em>fitment right.</em></h2>
        <p>Vehicle fitment can get complicated. Tell us what you drive and what you’re looking for — we’ll help you narrow it down.</p>
        <NuxtLink to="/contact" class="home-button">Talk to our team <AppIcon name="arrow-right" :size="16" /></NuxtLink>
      </div>
    </section>

    <section class="home-bottom">
      <div class="home-container home-bottom__inner">
        <div><span>GOOD PARTS.</span><span>BETTER MILES.</span></div>
        <NuxtLink to="/products" class="home-bottom__link">Find your next upgrade <AppIcon name="arrow-right" :size="16" /></NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.store-home {
  --home-ink: #171a1c;
  --home-muted: #73797a;
  --home-accent: #e85d2a;
  --home-paper: #f5f4f0;
  color: var(--home-ink);
}

.home-container { width: min(1240px, calc(100% - 48px)); margin-inline: auto; }
.home-announcement {
  display: flex; justify-content: center; gap: 10px; padding: 10px 20px;
  background: #e85d2a; color: #fff; font-size: 11px; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase;
}
.home-announcement__dot { opacity: .7; }
.home-hero {
  position: relative; display: flex; align-items: center; min-height: min(690px, 76vw);
  overflow: hidden; background: #171a1c; color: #fff;
}
.home-hero__image, .home-hero__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.home-hero__image { object-fit: cover; object-position: center 54%; }
.home-hero__shade {
  background: linear-gradient(90deg, rgba(13,17,19,.91) 0%, rgba(13,17,19,.72) 39%, rgba(13,17,19,.08) 100%),
    linear-gradient(0deg, rgba(13,17,19,.30), transparent 36%);
}
.home-hero__content { position: relative; z-index: 1; padding-block: 92px 100px; }
.home-kicker {
  display: flex; align-items: center; gap: 10px; color: #f78a5f;
  font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase;
}
.home-kicker > span { width: 24px; height: 2px; background: currentColor; }
.home-hero h1 {
  margin-top: 23px; max-width: 700px; font-family: var(--v-font-display);
  font-size: clamp(4.1rem, 9.4vw, 8.3rem); font-weight: 800; line-height: .84;
  letter-spacing: -.055em; text-transform: uppercase;
}
.home-hero h1 em, .home-callout h2 em { color: #f0784d; font-style: normal; }
.home-hero__text { max-width: 440px; margin-top: 25px; color: rgba(255,255,255,.77); font-size: 16px; }
.home-search {
  display: flex; width: min(560px, 100%); margin-top: 31px; padding: 5px;
  border: 1px solid rgba(255,255,255,.25); border-radius: 8px; background: rgba(255,255,255,.96);
}
.home-search input { min-width: 0; flex: 1; padding: 0 15px; border: 0; outline: 0; background: transparent; color: #171a1c; font-size: 14px; }
.home-search button, .home-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 12px;
  padding: 13px 17px; border: 0; border-radius: 5px; background: #e85d2a;
  color: #fff; font-size: 12px; font-weight: 800; white-space: nowrap; cursor: pointer;
  transition: background .2s, transform .2s;
}
.home-search button:hover, .home-button:hover { background: #c9481b; color: #fff; transform: translateY(-1px); }
.home-hero__links { display: flex; flex-wrap: wrap; align-items: center; gap: 20px; margin-top: 19px; color: rgba(255,255,255,.6); font-size: 11px; }
.home-hero__links a { display: inline-flex; align-items: center; gap: 8px; color: #fff; font-weight: 700; }
.home-hero__index { position: absolute; right: 30px; bottom: 28px; color: rgba(255,255,255,.7); font-size: 10px; font-weight: 700; letter-spacing: .16em; }
.home-assurance { background: #191d1f; color: #fff; }
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
.home-kicker--dark { color: #d95428; }
.home-section__head h2 { margin-top: 11px; font-size: clamp(2.2rem, 4vw, 3.8rem); line-height: .96; letter-spacing: -.04em; text-transform: uppercase; }
.home-text-link { display: inline-flex; align-items: center; gap: 9px; color: #33393b; font-size: 12px; font-weight: 700; }
.home-text-link:hover { color: var(--home-accent); }
.home-category-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.home-category { position: relative; display: block; min-height: 225px; overflow: hidden; border-radius: 8px; background: #292f32; color: #fff; }
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
.home-empty { display: flex; justify-content: space-between; padding: 35px; border: 1px solid #e8e7e2; border-radius: 8px; }
.home-callout { display: grid; min-height: 480px; grid-template-columns: 1fr 1fr; background: #191d1f; color: #fff; }
.home-callout__image { min-height: 380px; }
.home-callout__image img { width: 100%; height: 100%; object-fit: cover; }
.home-callout__copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(38px, 7vw, 96px); }
.home-callout h2 { margin-top: 19px; font-size: clamp(3rem, 5.2vw, 5.7rem); line-height: .88; letter-spacing: -.05em; text-transform: uppercase; }
.home-callout__copy > p:not(.home-kicker) { max-width: 420px; margin-top: 19px; color: rgba(255,255,255,.67); font-size: 14px; }
.home-button { margin-top: 25px; }
.home-bottom { background: #e85d2a; color: #fff; }
.home-bottom__inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding-block: 40px; }
.home-bottom__inner > div { display: flex; flex-direction: column; font-family: var(--v-font-display); font-size: clamp(2rem, 4.5vw, 4rem); font-weight: 800; line-height: .88; letter-spacing: -.04em; }
.home-bottom__link { display: inline-flex; align-items: center; gap: 12px; padding: 13px 16px; border: 1px solid rgba(255,255,255,.55); border-radius: 5px; font-size: 12px; font-weight: 700; }
.home-bottom__link:hover { background: #fff; color: #c9481b; }

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
