<script setup lang="ts">
const config = useRuntimeConfig()
const year = new Date().getFullYear()
const company = config.public.company as Record<string, string>

const productLinks = [
  { label: 'Coolant Temperature Sensor', to: '/products?category=coolant-temperature-sensor' },
  { label: 'Thermostatic Switch', to: '/products?category=temperature-control-switch' },
  { label: 'Reverse Light Switch', to: '/products?category=reverse-light-switch' },
  { label: 'Solenoid Valve', to: '/products?category=solenoid-valve' },
  { label: 'Oil Pressure Sensor', to: '/products?category=oil-pressure-alarm' },
  { label: 'Tire Pressure Sensor', to: '/products?category=tire-pressure-sensor' },
]

const companyLinks = [
  { label: 'About VAKTRA', to: '/about' },
  { label: 'Trade terms', to: '/trade-terms' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
  { label: 'All products', to: '/products' },
]

const legalLinks = [
  { label: 'Privacy policy', to: '/legal/privacy' },
  { label: 'Terms of sale', to: '/legal/terms' },
  { label: 'Imprint', to: '/legal/imprint' },
]
</script>

<template>
  <footer class="site-footer">
    <div class="v-container">
      <div class="site-footer__grid">
        <div class="site-footer__brand">
          <div class="site-footer__wordmark">VAKTRA<span>AUTO PARTS &amp; ACCESSORIES</span></div>
          <p class="site-footer__tagline">
            OE-referenced automotive sensors, switches and control components for distributors, importers and workshop chains.
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
          <a v-if="config.public.email" class="site-footer__link" :href="`mailto:${config.public.email}`">
            {{ config.public.email }}
          </a>
          <a v-if="config.public.phone" class="site-footer__link" :href="`tel:${config.public.phone}`">
            {{ config.public.phone }}
          </a>
          <a
            v-if="config.public.whatsapp"
            class="site-footer__link"
            :href="`https://wa.me/${config.public.whatsapp}`"
            target="_blank"
            rel="noopener"
          >
            WhatsApp: {{ config.public.whatsapp }}
          </a>
          <span v-if="company?.addressLine" class="site-footer__link">{{ company.addressLine }}</span>
          <NuxtLink to="/contact" class="site-footer__link">Send an enquiry →</NuxtLink>
        </div>
      </div>

      <div class="site-footer__bottom">
        <span>© {{ year }} {{ company?.legalName || 'VAKTRA' }}. All rights reserved.</span>
        <span class="site-footer__legal">
          <NuxtLink v-for="link in legalLinks" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
        </span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer__legal { display: inline-flex; flex-wrap: wrap; gap: 14px; }
.site-footer__legal a { color: inherit; text-decoration: none; opacity: .72; }
.site-footer__legal a:hover { opacity: 1; text-decoration: underline; }
</style>
