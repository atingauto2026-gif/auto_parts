<script setup lang="ts">
const config = useRuntimeConfig()
const year = new Date().getFullYear()

const productLinks = [
  { label: 'Coolant Temperature Sensor', to: '/products?category=coolant-temperature-sensor' },
  { label: 'Temperature Control Switch', to: '/products?category=temperature-control-switch' },
  { label: 'Reverse Light Switch', to: '/products?category=reverse-light-switch' },
  { label: 'Solenoid Valve', to: '/products?category=solenoid-valve' },
  { label: 'Oil Pressure Alarm', to: '/products?category=oil-pressure-alarm' },
  { label: 'Tire Pressure Sensor', to: '/products?category=tire-pressure-sensor' },
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
            Automotive sensors, switches and control components engineered for dependable performance.
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
        <span>Product enquiries and fitment support from the RoadReady team.</span>
      </div>
    </div>
  </footer>
</template>
