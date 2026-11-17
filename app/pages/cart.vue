<script setup lang="ts">
await navigateTo('/products', { redirectCode: 301 })
</script>

<template>
  <div class="v-container" style="padding-block: 72px">
    <h1>Shopping cart is no longer available</h1>
    <p>RoadReady Auto now handles product enquiries directly. Browse the catalogue or request a quote.</p>
    <NuxtLink to="/products" class="v-btn v-btn--primary">Browse products</NuxtLink>
  </div>
</template>
