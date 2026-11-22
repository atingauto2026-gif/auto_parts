<script setup lang="ts">
const config = useRuntimeConfig()
const trade = config.public.trade as Record<string, string>

const ogImage = `${config.public.siteUrl}/og/og-cover.jpg`

useSeoMeta({
  title: 'Trade terms',
  description:
    'How RoadReady Auto works with wholesale buyers: MOQ and trial orders, lead time, Incoterms, payment, packing and warranty — confirmed on every quotation.',
  ogTitle: 'RoadReady Auto — trade terms for wholesale buyers',
  ogDescription:
    'MOQ, lead time, Incoterms, payment, packing and warranty — stated up front and confirmed on every quotation.',
  ogType: 'website',
  ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/trade-terms` }],
})

// Filled values come from nuxt.config.ts runtimeConfig.public.trade;
// empty values fall back to honest, non-invented wording.
const blocks = computed(() => [
  {
    number: '01',
    title: 'Orders & MOQ',
    body: trade.moq || 'MOQs are confirmed per part number at quotation. Trial orders are welcome — tell us your target volume and we will confirm what is possible.',
  },
  {
    number: '02',
    title: 'Lead time',
    body: trade.leadTime || 'Lead time is confirmed with every order acknowledgement and depends on the part number and quantity.',
  },
  {
    number: '03',
    title: 'Incoterms & shipping',
    body: trade.incoterms || 'We quote on the Incoterms that suit your logistics — typically FOB from a major Chinese port, with CIF or EXW on request.',
  },
  {
    number: '04',
    title: 'Payment',
    body: trade.paymentTerms || 'Payment terms are confirmed at quotation. Bank transfer (T/T) is supported; other terms can be discussed for established programmes.',
  },
  {
    number: '05',
    title: 'Quality & warranty',
    body: trade.warranty || 'Warranty terms are stated on the quotation for each order and cover manufacturing defects.',
  },
  {
    number: '06',
    title: 'Samples',
    body: trade.samples || 'Samples are available for fitment verification before volume orders — mention it in your enquiry.',
  },
])

const quotationIncludes = [
  'Part number and OE references',
  'Unit price and MOQ',
  'Lead time and stock position',
  'Packing specification and carton marks',
  'Incoterms and loading port',
  'Warranty terms',
]
</script>

<template>
  <div class="tt-page">
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Trade terms</span>
        <h1>Terms, stated<br>up front.</h1>
        <p>Wholesale buyers should not have to ask for the basics. Here is how we work — and every quotation confirms the details in writing.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container">
        <div class="lp-grid lp-grid--3">
          <article v-for="block in blocks" :key="block.number" class="lp-feature">
            <span class="tt-number">{{ block.number }}</span>
            <h3>{{ block.title }}</h3>
            <p>{{ block.body }}</p>
          </article>
        </div>

        <div class="tt-quote-note">
          <div class="tt-quote-note__copy">
            <span class="v-eyebrow">Every quotation includes</span>
            <h2>Nothing hidden,<br>nothing verbal.</h2>
          </div>
          <ul class="tt-quote-note__list">
            <li v-for="item in quotationIncludes" :key="item">
              <AppIcon name="check" :size="14" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="ab-cta tt-cta">
          <span class="v-eyebrow">Next step</span>
          <h2>Send us your target parts.</h2>
          <p>We will come back with availability, pricing and these terms in writing.</p>
          <div class="ab-cta__actions">
            <NuxtLink to="/contact" class="v-btn v-btn--primary v-btn--lg">
              Request a quotation <AppIcon name="arrow-right" :size="16" />
            </NuxtLink>
            <NuxtLink to="/products" class="v-btn v-btn--outline v-btn--lg">Browse the catalogue</NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pg-hero h1 { margin-top: 15px; font-size: clamp(3rem, 7vw, 5.5rem); line-height: .9; text-transform: uppercase; }
.pg-hero p { max-width: 600px; margin-top: 20px; color: var(--v-ink-soft); font-size: 16px; }
.tt-number { display: block; margin-bottom: 20px; color: var(--v-green); font-size: 12px; font-weight: 800; letter-spacing: .12em; }
.tt-quote-note {
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
  margin-top: clamp(48px, 6vw, 80px); padding: clamp(28px, 4vw, 56px);
  background: #191d1f; color: #fff; border-radius: 12px;
}
.tt-quote-note h2 { margin-top: 14px; font-size: clamp(2rem, 4vw, 3.2rem); line-height: .98; text-transform: uppercase; }
.tt-quote-note__list { display: grid; gap: 12px; }
.tt-quote-note__list li { display: flex; align-items: center; gap: 12px; font-size: 15px; }
.tt-quote-note__list li svg { color: #f0784d; flex-shrink: 0; }
.tt-cta { margin-top: 55px; }
@media (max-width: 820px) {
  .tt-quote-note { grid-template-columns: 1fr; gap: 26px; }
  .tt-cta { margin-top: 36px; }
}
</style>
