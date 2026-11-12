<script setup lang="ts">
const config = useRuntimeConfig()

const channels = computed(() => [
  ...(config.public.email
    ? [{
        icon: 'mail',
        title: 'Email',
        value: config.public.email,
        action: `mailto:${config.public.email}`,
        label: 'Send an email',
      }]
    : []),
  ...(config.public.phone
    ? [{
        icon: 'phone',
        title: 'Phone',
        value: config.public.phone,
        action: `tel:${config.public.phone}`,
        label: 'Call us',
      }]
    : []),
  ...(config.public.whatsapp
    ? [{
        icon: 'whatsapp',
        title: 'WhatsApp',
        value: 'Chat with our team',
        action: `https://wa.me/${config.public.whatsapp}`,
        label: 'Message us',
      }]
    : []),
])

useSeoMeta({
  title: 'Help & Support | RoadReady Auto',
  description: 'Get help with auto parts, vehicle fitment, installation and product questions.',
  ogTitle: 'RoadReady Auto Support',
  ogDescription: 'Get help with parts and vehicle fitment.',
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/support` }],
})
</script>

<template>
  <div>
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Help & support</span>
        <h1>Let’s get you<br>back on the road.</h1>
        <p>Need help choosing a part, checking fitment or understanding product details? Start here.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container">
        <div v-if="channels.length" class="sp-grid">
          <a
            v-for="channel in channels"
            :key="channel.title"
            :href="channel.action"
            class="sp-card"
            :target="channel.action.startsWith('http') ? '_blank' : undefined"
            :rel="channel.action.startsWith('http') ? 'noopener' : undefined"
          >
            <span class="sp-card__icon"><AppIcon :name="channel.icon" :size="18" /></span>
            <h2>{{ channel.title }}</h2>
            <p>{{ channel.value }}</p>
            <span class="p-card__cta">{{ channel.label }} →</span>
          </a>
        </div>
        <div v-else class="cart-empty">
          <h2>Support details are being set up</h2>
          <p>Use the contact form and our team will get back to you.</p>
          <NuxtLink to="/contact" class="v-btn v-btn--primary">Contact us</NuxtLink>
        </div>
      </div>
    </section>

    <section class="v-section support-guide">
      <div class="v-container">
        <header class="lp-section-head">
          <span class="v-eyebrow">Before you order</span>
          <h2>A few details make all the difference.</h2>
          <p class="v-lead">For the quickest fitment check, include the details below when you contact us.</p>
        </header>

        <div class="lp-grid lp-grid--3">
          <article class="lp-feature">
            <span class="support-guide__number">01</span>
            <h3>Your vehicle</h3>
            <p>Make, model, year, trim and engine. A VIN can help confirm exact fitment where needed.</p>
          </article>
          <article class="lp-feature">
            <span class="support-guide__number">02</span>
            <h3>The part</h3>
            <p>Share the product name or link and tell us what you want it to do.</p>
          </article>
          <article class="lp-feature">
            <span class="support-guide__number">03</span>
            <h3>Installation</h3>
            <p>Check the manufacturer instructions. For brakes, steering, lighting and other safety-critical work, use a qualified installer.</p>
          </article>
        </div>

        <div class="ab-cta support-cta">
          <span class="v-eyebrow">Still have a question?</span>
          <h2>We’re happy to help you find your fit.</h2>
          <p>Send your vehicle details and the product you’re considering.</p>
          <div class="ab-cta__actions">
            <NuxtLink to="/contact" class="v-btn v-btn--primary v-btn--lg">
              Contact support <AppIcon name="arrow-right" :size="16" />
            </NuxtLink>
            <NuxtLink to="/products" class="v-btn v-btn--outline v-btn--lg">Browse parts</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pg-hero h1 { margin-top: 15px; font-size: clamp(3rem, 7vw, 5.5rem); line-height: .9; text-transform: uppercase; }
.pg-hero p { max-width: 600px; margin-top: 20px; color: var(--v-ink-soft); font-size: 16px; }
.support-guide { padding-top: 0; }
.support-guide__number { display: block; margin-bottom: 20px; color: var(--v-green); font-size: 12px; font-weight: 800; letter-spacing: .12em; }
.support-cta { margin-top: 55px; }
@media (max-width: 700px) { .support-cta { margin-top: 36px; } }
</style>
