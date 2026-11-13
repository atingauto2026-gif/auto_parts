<script setup lang="ts">
import type { CatalogCategory, ShopProduct } from '#shared/types'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const { data: catalog } = await useFetch<{ source: string; products: ShopProduct[] }>(
  '/api/products',
  { key: 'catalogue-products' },
)

const { data: categoryData } = await useFetch<{ categories: CatalogCategory[] }>(
  '/api/categories',
  { key: 'catalogue-categories' },
)

const products = computed(() => catalog.value?.products ?? [])
const categories = computed(() => categoryData.value?.categories ?? [])
const categoryOptions = computed(() => categories.value.map((item) => ({ label: item.label, value: item.id })))


const activeCategory = computed(() => String(route.query.category ?? ''))
const activeSearch = computed(() => String(route.query.q ?? '').trim())
const searchInput = ref(activeSearch.value)

const activeLabel = computed(() => {
  if (activeSearch.value) return `Search: ${activeSearch.value}`
  if (!activeCategory.value) return 'All products'
  return categories.value.find((item) => item.id === activeCategory.value)?.label ?? 'All products'
})

const filtered = computed(() => {
  return products.value.filter((product) => {
    const typeSlug = product.productType.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const matchesCategory = !activeCategory.value ||
      product.tags.includes(activeCategory.value) ||
      typeSlug === activeCategory.value ||
      typeSlug.includes(activeCategory.value)
    const query = activeSearch.value.toLowerCase()
    const matchesSearch = !query ||
      `${product.title} ${product.description} ${product.productType} ${product.tags.join(' ')}`
        .toLowerCase()
        .includes(query)
    return matchesCategory && matchesSearch
  })
})

function selectCategory(id: string) {
  router.push({ path: '/products', query: { ...(id ? { category: id } : {}), ...(activeSearch.value ? { q: activeSearch.value } : {}) } })
}

function searchProducts() {
  const query = searchInput.value.trim()
  router.push({ path: '/products', query: { ...(activeCategory.value ? { category: activeCategory.value } : {}), ...(query ? { q: query } : {}) } })
}

const title = computed(() =>
  activeCategory.value || activeSearch.value ? `${activeLabel.value} — Products` : 'Products',
)

useSeoMeta({
  title: () => `${title.value} | RoadReady Auto`,
  description:
    'Browse auto parts and accessories, including lighting, performance upgrades, interior essentials and tools.',
  ogTitle: () => `${title.value} | RoadReady Auto`,
  ogDescription:
    'Find parts and accessories for your next drive.',
  ogType: 'website',
})

useHead({
  link: [
    {
      rel: 'canonical',
      href: () =>
        `${config.public.siteUrl}/products${activeCategory.value ? `?category=${activeCategory.value}` : ''}`,
    },
  ],
})
</script>

<template>
  <div>
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Auto parts & accessories</span>
        <a-typography-title :level="1" class="pg-hero__title">
          {{ activeLabel }}
        </a-typography-title>
        <a-typography-paragraph class="pg-hero__description">
          Find practical upgrades and everyday essentials. Always confirm your vehicle’s make,
          model and year before ordering.
        </a-typography-paragraph>
        <div class="pg-hero__meta">
          <span>{{ filtered.length }} products</span>
          <span>Prices in AUD</span>
          <span>Vehicle fitment varies by product</span>
        </div>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container">
        <div class="catalogue-controls">
          <form class="catalogue-controls__filter" @submit.prevent="searchProducts">
            <label class="catalogue-controls__label" for="catalogue-search">Search parts</label>
            <a-input-search
              id="catalogue-search"
              v-model:value="searchInput"
              placeholder="Try “LED”, “floor mats” or “tools”"
              enter-button="Search"
              @search="searchProducts"
            />
          </form>
          <div class="catalogue-controls__filter">
            <span class="catalogue-controls__label">Filter by category</span>
            <a-select
              :value="activeCategory || undefined"
              :options="categoryOptions"
              placeholder="All categories"
              allow-clear
              show-search
              option-filter-prop="label"
              class="catalogue-controls__select"
              @change="selectCategory(String($event ?? ''))"
            />
          </div>
          <a-tag color="orange">{{ filtered.length }} {{ filtered.length === 1 ? 'item' : 'items' }}</a-tag>
        </div>


        <div v-if="filtered.length" class="p-grid">
          <ProductCard v-for="product in filtered" :key="product.id" :product="product" />
        </div>

        <div v-else class="cart-empty">
          <a-empty description="Nothing in this category yet" />
          <p>Try a different search or category, or ask our team for help finding the right fit.</p>
          <NuxtLink to="/contact" class="v-btn v-btn--primary">Talk to the team</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
