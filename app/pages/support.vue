<script setup lang="ts">
const config = useRuntimeConfig()

const ogImage = `${config.public.siteUrl}/og/og-cover.jpg`

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
        value: 'Chat with our export team',
        action: `https://wa.me/${config.public.whatsapp}`,
        label: 'Message us',
      }]
    : []),
])

useSeoMeta({
  title: 'Help & support',
  description:
    'OE cross-reference checks, quotations with full trade terms, shipping documents and after-shipment support for wholesale buyers.',
  ogTitle: 'VAKTRA Support',
  ogDescription: 'Procurement support for wholesale buyers — from enquiry to shipment.',
  ogType: 'website',
  ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/support` }],
})
</script>

<template>
  <div>
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Help &amp; support</span>
        <h1>Procurement support,<br>enquiry to shipment.</h1>
        <p>Need a cross-reference checked, a quotation with full terms, or shipping documents prepared? Start here.</p>
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
          <h2>Direct contact details are being finalised</h2>
          <p>Use the enquiry form — it reaches the same export team.</p>
          <NuxtLink to="/contact" class="v-btn v-btn--primary">Contact us</NuxtLink>
        </div>
      </div>
    </section>

    <section class="v-section support-guide">
      <div class="v-container">
        <header class="lp-section-head">
          <span class="v-eyebrow">Before you enquire</span>
          <h2>A few details make quoting faster.</h2>
          <p class="v-lead">Include the details below and your first quotation will arrive with complete terms — not a round of follow-up questions.</p>
        </header>

        <div class="lp-grid lp-grid--3">
          <article class="lp-feature">
            <span class="support-guide__number">01</span>
            <h3>The part number</h3>
            <p>Send the OE number, factory number or cross reference — or a photo of the part and its connector. We verify fitment and alternatives before quoting.</p>
          </article>
          <article class="lp-feature">
            <span class="support-guide__number">02</span>
            <h3>Your programme</h3>
            <p>Tell us your target volumes, order frequency and destination market so we can quote MOQ, lead time and packing that actually fit.</p>
          </article>
          <article class="lp-feature">
            <span class="support-guide__number">03</span>
            <h3>Shipping &amp; documents</h3>
            <p>Incoterms, packing specification and export documents (commercial invoice, packing list, certificate of origin) are confirmed with every order.</p>
          </article>
        </div>

        <div class="ab-cta support-cta">
          <span class="v-eyebrow">Ready to start?</span>
          <h2>Send your part numbers.</h2>
          <p>We will come back with availability, pricing and full trade terms.</p>
          <div class="ab-cta__actions">
            <NuxtLink to="/contact" class="v-btn v-btn--primary v-btn--lg">
              Send an enquiry <AppIcon name="arrow-right" :size="16" />
            </NuxtLink>
            <NuxtLink to="/trade-terms" class="v-btn v-btn--outline v-btn--lg">Read trade terms</NuxtLink>
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
