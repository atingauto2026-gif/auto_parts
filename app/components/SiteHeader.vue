<script setup lang="ts">
import type { CatalogCategory } from '#shared/types'

const route = useRoute()
const { count, openDrawer } = useCart()
const config = useRuntimeConfig()

const { data: catalog } = await useFetch<{
  categories: CatalogCategory[]
  storefrontConfigured: boolean
}>('/api/categories', { key: 'catalog-categories' })

const categories = computed(() => catalog.value?.categories ?? [])

const mobileOpen = ref(false)
const productsOpen = ref(false)
const dropdown = ref<HTMLElement | null>(null)

const navLinks = [
  { label: 'About', to: '/about' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
]

function isActive(path: string) {
  return route.path === path
}

function closeAll() {
  mobileOpen.value = false
  productsOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!productsOpen.value) return
  const target = event.target as Node
  if (dropdown.value && !dropdown.value.contains(target)) productsOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
watch(() => route.fullPath, closeAll)

const accountUrl = computed(() => config.public.storeDomain ? `https://${config.public.storeDomain}/account` : '')
</script>

<template>
  <header class="site-header">
    <div class="v-container site-header__inner">
      <NuxtLink to="/" class="site-header__logo" aria-label="RoadReady Auto home" @click="closeAll">
        <span class="site-logo-mark">R</span>
        <span class="site-logo-wordmark">ROADREADY<span>AUTO PARTS & ACCESSORIES</span></span>
      </NuxtLink>

      <nav class="site-header__nav" aria-label="Primary">
        <div ref="dropdown" class="site-dropdown">
          <button
            type="button"
            class="site-link"
            :class="{ 'is-active': route.path.startsWith('/products') }"
            :aria-expanded="productsOpen"
            @click="productsOpen = !productsOpen"
          >
            Products
            <AppIcon
              name="chevron-down"
              :size="12"
              style="display: inline-block; vertical-align: -1px; margin-left: 3px"
            />
          </button>

          <div v-if="productsOpen" class="site-dropdown__menu">
            <NuxtLink to="/products" class="site-dropdown__link" @click="productsOpen = false">
              <span>All products</span>
              <AppIcon name="arrow-right" :size="14" />
            </NuxtLink>
            <NuxtLink
              v-for="category in categories"
              :key="category.id"
              :to="`/products?category=${category.id}`"
              class="site-dropdown__link"
              @click="productsOpen = false"
            >
              <span>{{ category.label }}</span>
              <AppIcon name="chevron-right" :size="13" />
            </NuxtLink>
          </div>
        </div>

        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="site-link"
          :class="{ 'is-active': isActive(link.to) }"
        >
          {{ link.label }}
        </NuxtLink>

        <a v-if="accountUrl" :href="accountUrl" class="site-link">Account</a>
      </nav>

      <div class="site-header__actions">
        <ThemeToggle />

        <button type="button" class="site-icon-btn" aria-label="Open cart" style="position: relative" @click="openDrawer">
          <AppIcon name="cart" :size="16" />
          <span v-if="count > 0" class="site-cart-count">{{ count }}</span>
        </button>

        <button
          type="button"
          class="site-icon-btn site-header__toggle"
          :aria-expanded="mobileOpen"
          aria-label="Menu"
          @click="mobileOpen = !mobileOpen"
        >
          <AppIcon :name="mobileOpen ? 'close' : 'menu'" :size="17" />
        </button>
      </div>
    </div>
  </header>

  <Transition name="site-mobile">
    <div v-if="mobileOpen" class="site-mobile">
      <NuxtLink to="/products" @click="closeAll">All products</NuxtLink>
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/products?category=${category.id}`"
        @click="closeAll"
      >
        {{ category.label }}
      </NuxtLink>
      <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to" @click="closeAll">
        {{ link.label }}
      </NuxtLink>
      <a v-if="accountUrl" :href="accountUrl">Account</a>
    </div>
  </Transition>
</template>
