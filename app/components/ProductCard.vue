<script setup lang="ts">
import type { ShopProduct } from '#shared/types'

const props = defineProps<{ product: ShopProduct }>()

const price = computed(() =>
  props.product.priceRange
    ? formatMoney(props.product.priceRange.minVariantPrice)
    : 'Request a quote',
)
const compareAt = computed(() => {
  const value = props.product.compareAtPrice
  const range = props.product.priceRange
  if (!value || !range) return null
  return Number(value.amount) > Number(range.minVariantPrice.amount)
    ? formatMoney(value)
    : null
})

const flag = computed(() => {
  if (props.product.tags.includes('New Release')) return 'New'
  if (props.product.tags.includes('Best Seller')) return 'Best seller'
  return null
})

const short = computed(() => {
  const text = props.product.description || ''
  return text.length > 118 ? `${text.slice(0, 115).trimEnd()}…` : text
})
</script>

<template>
  <NuxtLink :to="`/products/${product.handle}`" class="p-card">
    <div class="p-card__media">
      <img
        v-if="product.featuredImage"
        :src="product.featuredImage.url"
        :alt="product.featuredImage.altText || product.title"
        loading="lazy"
      >
      <span v-if="flag" class="v-badge v-badge--solid p-card__flag">{{ flag }}</span>
    </div>

    <div class="p-card__body">
      <span class="p-card__cat">{{ product.productType || 'Auto parts' }}</span>
      <h3 class="p-card__title">{{ product.title }}</h3>
      <p class="p-card__desc">{{ short }}</p>

      <div class="p-card__foot">
        <span class="p-card__price">
          {{ price }}
          <small v-if="compareAt" class="p-card__was">{{ compareAt }}</small>
        </span>
        <span class="p-card__cta">View details</span>
      </div>
    </div>
  </NuxtLink>
</template>
