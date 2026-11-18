<script setup lang="ts">
import type { ShopProduct } from '#shared/types'

const config = useRuntimeConfig()
const router = useRouter()
const search = ref('')

const { data: catalog } = await useFetch<{
  source: string
  products: ShopProduct[]
}>('/api/products', { key: 'home-products' })

const products = computed(() => catalog.value?.products ?? [])
const featured = computed(() =>
  products.value.filter((product) => product.tags.includes('Best Seller')).slice(0, 4),
)

const sensorExamples = [
  {
    name: 'Coolant Temperature Sensor',
    category: 'Engine management',
    description: 'Monitors engine coolant temperature to support accurate engine management.',
    image: 'https://padminivna.com/uploads/product/709c5ec8b29349c57d3c90127c18611b.png',
    alt: 'Automotive coolant temperature sensors with threaded metal probes and electrical connectors',
  },
  {
    name: 'MAP Pressure Sensor',
    category: 'Air intake system',
    description: 'Measures intake manifold pressure for engine load calculation.',
    image: 'https://www.ecerimg.com/nimg/b7/1c/ec36c9554c6b95b405aa40bae2eb.jpg',
    alt: 'Automotive manifold absolute pressure sensors displayed on a white background',
  },
  {
    name: 'Oxygen Sensor',
    category: 'Exhaust system',
    description: 'Monitors oxygen content in exhaust gases for emissions and fuel control.',
    image: 'https://auto724.co.uk/media/catalog/category/exhaust.jpg',
    alt: 'Automotive oxygen sensors and exhaust monitoring components',
  },
  {
    name: 'Mass Air Flow Sensor',
    category: 'Air intake system',
    description: 'Measures the volume of air entering the engine for fuel management.',
    image: 'https://www.bosch-ibusiness.com/media/images/products/sensors/sensors_3200x1800.jpg',
    alt: 'Automotive mass air flow and engine sensors from a sensor product range',
  },
]

function findParts() {
  const query = search.value.trim()
  router.push({ path: '/products', query: query ? { q: query } : {} })
}

useSeoMeta({
  title: 'Automotive sensors & control components | RoadReady Auto',
  description:
    'Explore automotive sensors, switches, solenoid valves and pressure monitoring components. Request wholesale pricing and fitment support.',
  ogTitle: 'RoadReady Auto | Automotive components',
  ogDescription:
    'Specialist automotive sensors, switches and control components. Enquire for wholesale pricing and fitment support.',
  ogType: 'website',
  ogImage: 'https://di-uploads-pod47.dealerinspire.com/beamantoyota1/uploads/2025/05/2025_Toyota_RAV4_blue_SUV_exterior.png',
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
        src="https://di-uploads-pod47.dealerinspire.com/beamantoyota1/uploads/2025/05/2025_Toyota_RAV4_blue_SUV_exterior.png"
        alt="2025 Toyota RAV4, a representative vehicle for RoadReady automotive components"
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

    <section class="home-assurance" aria-label="Why shop with us">
      <div class="home-container home-assurance__grid">
        <div><span class="home-assurance__mark">01</span><p><strong>Precision components</strong><small>Consistent quality standards</small></p></div>
        <div><span class="home-assurance__mark">02</span><p><strong>Application support</strong><small>Find the correct part number</small></p></div>
        <div><span class="home-assurance__mark">03</span><p><strong>Built for reliability</strong><small>Responsive technical assistance</small></p></div>
      </div>
    </section>

    <section class="home-stats" aria-label="RoadReady company facts">
      <div class="home-stats__grid">
        <div class="home-stat"><AppIcon name="globe" :size="48" /><strong>80+</strong><span>Countries Served</span></div>
        <div class="home-stat"><AppIcon name="flask-conical" :size="48" /><strong>25+</strong><span>Years Experience</span></div>
        <div class="home-stat"><AppIcon name="shield-check" :size="48" /><strong>10+</strong><span>Patents</span></div>
        <div class="home-stat"><AppIcon name="users-round" :size="48" /><strong>100+</strong><span>Team Members</span></div>
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

    <section class="home-section home-sensor-showcase">
      <div class="home-container">
        <div class="home-section__head">
          <div>
            <p class="home-kicker home-kicker--dark"><span></span>Product showcase</p>
            <h2>Automotive sensor range</h2>
            <p class="home-sensor-intro">A closer look at the components we specialise in. These are visual examples; confirm the exact part number and OE reference for your vehicle.</p>
          </div>
          <NuxtLink to="/products" class="home-text-link">Explore all products <AppIcon name="arrow-right" :size="15" /></NuxtLink>
        </div>
        <div class="home-sensor-grid">
          <article v-for="sensor in sensorExamples" :key="sensor.name" class="home-sensor-card">
            <div class="home-sensor-card__image">
              <img :src="sensor.image" :alt="sensor.alt" loading="lazy">
              <span class="home-sensor-card__tag">Example</span>
            </div>
            <div class="home-sensor-card__body">
              <span class="home-sensor-card__category">{{ sensor.category }}</span>
              <h3>{{ sensor.name }}</h3>
              <p>{{ sensor.description }}</p>
              <dl>
                <div><dt>Part number</dt><dd>To be confirmed</dd></div>
                <div><dt>OE reference</dt><dd>To be confirmed</dd></div>
              </dl>
              <NuxtLink to="/contact" class="home-sensor-card__link">Enquire about this part <AppIcon name="arrow-right" :size="14" /></NuxtLink>
            </div>
          </article>
        </div>
        <p class="home-sensor-note">Illustrative product images only. Product identifiers, specifications and vehicle fitment will be added from verified catalogue records.</p>
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
        <h2>Let’s confirm<br><em>the right fit.</em></h2>
        <p>Send us the vehicle make, model, year or OE reference. Our team will help identify the correct component and application.</p>
        <NuxtLink to="/contact" class="home-button">Request product support <AppIcon name="arrow-right" :size="16" /></NuxtLink>
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
  --home-ink: #18242d;
  --home-muted: #687781;
  --home-accent: #e16d35;
  --home-paper: #f4f6f7;
  color: var(--home-ink);
  background: #fff;
}
.home-container { width: min(1280px, calc(100% - 64px)); margin-inline: auto; }
.home-announcement {
  display:flex; justify-content:center; align-items:center; gap:12px; padding:11px 20px;
  background:#17232c; color:#e8edf0; font-size:10px; font-weight:700;
  letter-spacing:.13em; text-transform:uppercase;
}
.home-announcement__dot { color:var(--home-accent); }
.home-hero {
  position:relative; display:flex; align-items:center; min-height:650px;
  overflow:hidden; isolation:isolate; background:#f1f4f5; color:var(--home-ink);
}
.home-hero__image { position:absolute; z-index:-2; inset:0 0 0 auto; width:59%; height:100%; object-fit:cover; object-position:center 55%; }
.home-hero__shade {
  position:absolute; z-index:-1; inset:0;
  background:linear-gradient(90deg,#f1f4f5 0%,#f1f4f5 36%,rgba(241,244,245,.92) 45%,rgba(241,244,245,.12) 73%,rgba(241,244,245,0) 100%);
}
.home-hero__content { padding-block:94px 104px; }
.home-kicker { display:flex; align-items:center; gap:10px; color:var(--home-accent); font-size:10px; font-weight:800; letter-spacing:.17em; text-transform:uppercase; }
.home-kicker > span { width:25px; height:2px; background:currentColor; }
.home-hero h1 {
  max-width:650px; margin-top:24px; font-family:var(--v-font-display);
  font-size:clamp(4.4rem,8.4vw,7.8rem); font-weight:800; line-height:.84;
  letter-spacing:-.065em; text-transform:uppercase;
}
.home-hero h1 em,.home-callout h2 em { color:var(--home-accent); font-style:normal; }
.home-hero__text { max-width:445px; margin-top:26px; color:#5c6972; font-size:16px; line-height:1.75; }
.home-search {
  display:flex; width:min(570px,100%); margin-top:31px; padding:5px;
  border:1px solid #d8dfe3; border-radius:5px; background:#fff;
  box-shadow:0 12px 34px rgba(23,35,44,.07);
}
.home-search input { min-width:0; flex:1; padding:0 15px; border:0; outline:0; background:transparent; color:#18242d; font-size:13px; }
.home-search button,.home-button {
  display:inline-flex; align-items:center; justify-content:center; gap:12px; padding:14px 18px;
  border:0; border-radius:3px; background:var(--home-accent); color:#fff;
  font-size:11px; font-weight:800; white-space:nowrap; cursor:pointer; transition:background .2s,transform .2s;
}
.home-search button:hover,.home-button:hover { background:#bd5426; color:#fff; transform:translateY(-1px); }
.home-hero__links { display:flex; flex-wrap:wrap; align-items:center; gap:20px; margin-top:19px; color:#7b878e; font-size:11px; }
.home-hero__links a { display:inline-flex; align-items:center; gap:8px; color:#1c2b35; font-weight:800; }
.home-hero__index { position:absolute; right:28px; bottom:24px; color:#fff; font-size:10px; font-weight:800; letter-spacing:.16em; text-shadow:0 1px 8px #17232c; }
.home-assurance { background:#17232c; color:#fff; }
.home-assurance__grid { display:grid; grid-template-columns:repeat(3,1fr); }
.home-assurance__grid>div { display:flex; align-items:center; gap:17px; padding:25px 30px; border-right:1px solid rgba(255,255,255,.13); }
.home-assurance__grid>div:first-child { padding-left:0; }
.home-assurance__grid>div:last-child { border:0; }
.home-assurance__mark { color:#f18a58; font-family:var(--v-font-display); font-size:25px; font-weight:800; }
.home-assurance strong,.home-assurance small { display:block; }
.home-assurance strong { font-size:12px; letter-spacing:.01em; }
.home-assurance small { margin-top:3px; color:rgba(255,255,255,.58); font-size:11px; }
.home-stats { background:#090b0d; color:#fff; }
.home-stats__grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); max-width:1500px; margin:0 auto; }
.home-stat { display:flex; min-height:300px; flex-direction:column; align-items:center; justify-content:center; border-right:1px solid rgba(255,255,255,.14); }
.home-stat:last-child { border-right:0; }
.home-stat :deep(svg) { margin-bottom:62px; color:#35c8f2; stroke-width:1.8; }
.home-stat strong { color:#fff; font-family:var(--v-font-display); font-size:clamp(3.5rem,5vw,5.2rem); font-weight:800; line-height:1; letter-spacing:-.055em; }
.home-stat span { margin-top:40px; color:#9a9da0; font-size:14px; font-weight:600; letter-spacing:.02em; }
.home-section { padding:clamp(68px,8vw,108px) 0; }
.home-section__head { display:flex; align-items:end; justify-content:space-between; gap:24px; margin-bottom:32px; }
.home-kicker--dark { color:var(--home-accent); }
.home-section__head h2 { margin-top:12px; font-size:clamp(2.1rem,4vw,3.65rem); line-height:.98; letter-spacing:-.045em; text-transform:uppercase; }
.home-text-link { display:inline-flex; align-items:center; gap:9px; color:#34434d; font-size:12px; font-weight:800; }
.home-text-link:hover { color:var(--home-accent); }
.home-category-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.home-category { position:relative; display:block; min-height:238px; overflow:hidden; border-radius:5px; background:#26323a; color:#fff; box-shadow:0 8px 22px rgba(21,34,43,.06); }
.home-category::after { position:absolute; inset:0; content:""; background:linear-gradient(0deg,rgba(10,18,23,.82),rgba(10,18,23,.03) 72%); }
.home-category img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .5s; }
.home-category:hover img { transform:scale(1.055); }
.home-category__number,.home-category__label,.home-category__arrow { position:absolute; z-index:1; }
.home-category__number { top:17px; left:18px; color:rgba(255,255,255,.8); font-size:10px; letter-spacing:.12em; }
.home-category__label { bottom:21px; left:20px; max-width:calc(100% - 75px); font-size:17px; font-weight:800; letter-spacing:-.02em; text-transform:uppercase; }
.home-category__arrow { right:18px; bottom:17px; display:grid; width:34px; height:34px; place-items:center; border:1px solid rgba(255,255,255,.65); border-radius:50%; transition:background .2s,border .2s; }
.home-category:hover .home-category__arrow { border-color:var(--home-accent); background:var(--home-accent); }
.home-featured { background:#fff; }
.home-product-grid { margin-top:8px; }
.home-empty { display:flex; justify-content:space-between; gap:24px; padding:35px; border:1px solid #e0e5e8; border-radius:5px; background:#f8f9fa; }
.home-sensor-showcase { background:#f4f6f7; }
.home-sensor-intro { max-width:620px; margin-top:14px; color:#687781; font-size:14px; line-height:1.7; }
.home-sensor-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.home-sensor-card { min-width:0; overflow:hidden; border:1px solid #e1e6e9; border-radius:5px; background:#fff; box-shadow:0 8px 24px rgba(21,34,43,.045); }
.home-sensor-card__image { position:relative; display:grid; height:220px; place-items:center; overflow:hidden; background:#fff; }
.home-sensor-card__image img { width:100%; height:100%; object-fit:contain; transition:transform .35s; }
.home-sensor-card:hover .home-sensor-card__image img { transform:scale(1.045); }
.home-sensor-card__tag { position:absolute; top:12px; left:12px; padding:5px 8px; border-radius:2px; background:#e16d35; color:#fff; font-size:9px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
.home-sensor-card__body { padding:19px 18px 18px; }
.home-sensor-card__category { color:#e16d35; font-size:9px; font-weight:800; letter-spacing:.13em; text-transform:uppercase; }
.home-sensor-card h3 { min-height:44px; margin-top:8px; color:#18242d; font-size:17px; font-weight:800; line-height:1.25; }
.home-sensor-card__body>p { min-height:66px; margin-top:9px; color:#687781; font-size:12px; line-height:1.65; }
.home-sensor-card dl { margin-top:15px; border-top:1px solid #edf0f2; }
.home-sensor-card dl>div { display:flex; justify-content:space-between; gap:8px; padding-top:10px; }
.home-sensor-card dt { color:#849099; font-size:10px; }
.home-sensor-card dd { color:#34434d; font-size:10px; font-weight:800; text-align:right; }
.home-sensor-card__link { display:inline-flex; align-items:center; gap:7px; margin-top:17px; color:#18242d; font-size:11px; font-weight:800; }
.home-sensor-card__link:hover { color:#e16d35; }
.home-sensor-note { margin-top:18px; color:#87929a; font-size:10px; line-height:1.6; }
.home-callout { display:grid; min-height:490px; grid-template-columns:1.05fr .95fr; background:#17232c; color:#fff; }
.home-callout__image { min-height:390px; overflow:hidden; }
.home-callout__image img { width:100%; height:100%; object-fit:cover; }
.home-callout__copy { display:flex; flex-direction:column; align-items:flex-start; justify-content:center; padding:clamp(40px,7vw,100px); }
.home-callout h2 { margin-top:20px; font-size:clamp(3.1rem,5.2vw,5.6rem); line-height:.88; letter-spacing:-.055em; text-transform:uppercase; }
.home-callout__copy>p:not(.home-kicker) { max-width:430px; margin-top:21px; color:rgba(255,255,255,.68); font-size:14px; line-height:1.8; }
.home-button { margin-top:27px; }
.home-bottom { background:var(--home-accent); color:#fff; }
.home-bottom__inner { display:flex; align-items:center; justify-content:space-between; gap:24px; padding-block:42px; }
.home-bottom__inner>div { display:flex; flex-direction:column; font-family:var(--v-font-display); font-size:clamp(2rem,4.5vw,4rem); font-weight:800; line-height:.88; letter-spacing:-.045em; }
.home-bottom__link { display:inline-flex; align-items:center; gap:12px; padding:14px 17px; border:1px solid rgba(255,255,255,.65); border-radius:4px; font-size:12px; font-weight:800; }
.home-bottom__link:hover { background:#fff; color:#bd5426; }
@media(max-width:760px) {
  .home-container { width:min(100% - 36px,620px); }
  .home-announcement { flex-wrap:wrap; gap:6px 9px; padding:10px 12px; font-size:8px; letter-spacing:.08em; text-align:center; }
  .home-hero { min-height:690px; align-items:flex-start; }
  .home-hero__image { inset:auto 0 0 auto; width:100%; height:54%; object-position:center 55%; }
  .home-hero__shade { background:linear-gradient(180deg,#f1f4f5 0%,#f1f4f5 39%,rgba(241,244,245,.9) 52%,rgba(241,244,245,.04) 83%); }
  .home-hero__content { padding-block:62px 300px; }
  .home-hero h1 { font-size:clamp(3.8rem,16vw,5.7rem); }
  .home-hero__text { max-width:360px; font-size:14px; }
  .home-search { margin-top:23px; }
  .home-search input { padding-inline:9px; font-size:11px; }
  .home-search button { gap:7px; padding-inline:11px; font-size:10px; }
  .home-hero__links { gap:11px; }
  .home-hero__links span { max-width:185px; }
  .home-hero__index { right:16px; bottom:16px; }
  .home-assurance__grid { grid-template-columns:1fr; padding-block:8px; }
  .home-assurance__grid>div,.home-assurance__grid>div:first-child { padding:14px 0; border-right:0; border-bottom:1px solid rgba(255,255,255,.12); }
  .home-assurance__grid>div:last-child { border-bottom:0; }
  .home-stats__grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .home-stat { min-height:210px; border-bottom:1px solid rgba(255,255,255,.14); }
  .home-stat:nth-child(2) { border-right:0; }
  .home-stat:nth-child(3),.home-stat:nth-child(4) { border-bottom:0; }
  .home-stat :deep(svg) { margin-bottom:25px; }
  .home-stat strong { font-size:3.2rem; }
  .home-stat span { margin-top:19px; font-size:11px; }
  .home-section__head { align-items:flex-start; flex-direction:column; gap:14px; }
  .home-section__head h2 { font-size:2.45rem; }
  .home-category-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
  .home-category { min-height:170px; }
  .home-category__label { bottom:15px; left:13px; font-size:13px; }
  .home-category__number { top:12px; left:13px; }
  .home-category__arrow { right:10px; bottom:10px; width:28px; height:28px; }
  .home-empty { flex-direction:column; padding:23px; }
  .home-sensor-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; }
  .home-sensor-card__image { height:170px; }
  .home-sensor-card__body { padding:15px 13px; }
  .home-sensor-card h3 { min-height:0; font-size:15px; }
  .home-sensor-card__body>p { min-height:0; }
  .home-callout { grid-template-columns:1fr; }
  .home-callout__image { min-height:250px; max-height:310px; }
  .home-callout__copy { padding:43px 24px 50px; }
  .home-callout h2 { font-size:3.7rem; }
  .home-bottom__inner { align-items:flex-start; flex-direction:column; }
}
</style>