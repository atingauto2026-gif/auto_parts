<script setup lang="ts">
const config = useRuntimeConfig()
const year = new Date().getFullYear()

const productLinks = [
  { label: 'Lighting', to: '/products?category=lighting' },
  { label: 'Performance', to: '/products?category=performance' },
  { label: 'Interior', to: '/products?category=interior' },
  { label: 'Exterior', to: '/products?category=exterior' },
  { label: 'Tools & Recovery', to: '/products?category=tools' },
  { label: 'Maintenance', to: '/products?category=maintenance' },
]

const companyLinks = [
  { label: 'About RoadReady', to: '/about' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
  { label: 'All products', to: '/products' },
]
</script>

<template>
  <footer class="site-footer">
    <div class="v-container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <div class="site-footer__wordmark">ROADREADY<span>AUTO PARTS & ACCESSORIES</span></div>
          <p class="site-footer__tagline">
            Thoughtful upgrades and dependable essentials for every drive.
          </p>
        </div>

        <div>
          <div class="site-footer__heading">Products</div>
          <NuxtLink v-for="link in productLinks" :key="link.to" :to="link.to" class="site-footer__link">
            {{ link.label }}
          </NuxtLink>
        </div>

        <div>
          <div class="site-footer__heading">Company</div>
          <NuxtLink v-for="link in companyLinks" :key="link.to" :to="link.to" class="site-footer__link">
            {{ link.label }}
          </NuxtLink>
        </div>

        <div>
          <div class="site-footer__heading">Contact</div>
          <a class="site-footer__link" :href="`mailto:${config.public.email}`">
            {{ config.public.email }}
          </a>
          <a class="site-footer__link" :href="`tel:${config.public.phone}`">
            {{ config.public.phone }}
          </a>
          <span class="site-footer__link">Online auto parts & accessories</span>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© {{ year }} RoadReady Auto. All rights reserved.</span>
        <span>Payments and orders are processed securely by Shopify.</span>
      </div>
    </div>
  </footer>
</template>
