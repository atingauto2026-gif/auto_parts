<script setup lang="ts">
// Legal pages: privacy / terms / imprint.
//
// IMPORTANT: the texts below are honest, neutral frameworks — they describe
// how the site behaves and defer binding terms to the order confirmation.
// They deliberately do NOT invent company details, certifications or legal
// promises. Fill nuxt.config.ts runtimeConfig.public.company with real data
// and the Imprint renders it automatically. Have a compliance template review
// the privacy/terms wording before you treat them as final legal documents.

const config = useRuntimeConfig()
const route = useRoute()
const company = config.public.company as Record<string, string>
const ogImage = `${config.public.siteUrl}/og/og-cover.jpg`

const imprintFacts = computed(() => [
  { label: 'Registered name', value: company?.legalName },
  { label: 'Registered address', value: company?.addressLine },
  { label: 'Registration no.', value: company?.registrationNo },
  { label: 'VAT / EORI', value: company?.vatId },
  { label: 'Established', value: company?.foundedYear },
  { label: 'Manufacturing partner since', value: company?.factorySince },
  { label: 'Email', value: config.public.email },
  { label: 'Telephone / WhatsApp', value: config.public.phone },
].filter(item => Boolean(item.value)))

const docs: Record<string, {
  navLabel: string
  title: string
  description: string
  sections: Array<{ heading: string; paras: string[] }>
}> = {
  privacy: {
    navLabel: 'Privacy policy',
    title: 'Privacy policy',
    description: 'How RoadReady Auto handles enquiry and business contact data.',
    sections: [
      {
        heading: 'What we collect',
        paras: [
          'When you send an enquiry through this site, we receive the details you choose to share: your name, business email, company name, country or target market, phone or WhatsApp number, the part numbers you are interested in, and the content of your message.',
          'We do not run advertising trackers on this site. Server logs are kept only for security and availability purposes.',
        ],
      },
      {
        heading: 'How we use it',
        paras: [
          'We use enquiry details for one purpose: to answer your enquiry — checking stock, preparing quotations and corresponding with you about your requirement.',
          'We do not sell or rent your data, and we do not add you to marketing lists without your consent.',
        ],
      },
      {
        heading: 'Retention and sharing',
        paras: [
          'Enquiry details are kept only as long as needed to handle your enquiry and any resulting business. We share data only with the service providers required to operate this site and our order process, and only to the extent necessary.',
        ],
      },
      {
        heading: 'Your choices',
        paras: [
          'You can ask us at any time to confirm, correct or delete the details you have sent us. Use the contact page and we will handle it directly.',
        ],
      },
    ],
  },
  terms: {
    navLabel: 'Terms of sale',
    title: 'Terms of sale',
    description: 'The commercial framework for orders placed with RoadReady Auto.',
    sections: [
      {
        heading: 'Scope',
        paras: [
          'These terms describe the general framework for wholesale orders. The quotation and order confirmation for each transaction state the binding details — prices, MOQ, lead time, Incoterms, payment and warranty — and take precedence where they differ.',
        ],
      },
      {
        heading: 'Quotations and orders',
        paras: [
          'Quotations are valid for the period stated on the quotation. An order becomes binding when we issue the order confirmation, which restates the agreed specifications and terms.',
        ],
      },
      {
        heading: 'Prices, payment and delivery',
        paras: [
          'Prices are quoted in the currency and Incoterms stated on the quotation. Payment terms are confirmed at quotation and on the order confirmation. Lead times are confirmed with the order acknowledgement.',
        ],
      },
      {
        heading: 'Warranty and claims',
        paras: [
          'Warranty terms for each order are stated on the order confirmation and cover manufacturing defects. If a quality issue arises, notify us promptly after receipt so we can review it and agree on a remedy.',
        ],
      },
      {
        heading: 'Governing terms',
        paras: [
          'The governing law and dispute-resolution venue for a transaction are stated on the order confirmation for that transaction.',
        ],
      },
    ],
  },
  imprint: {
    navLabel: 'Imprint',
    title: 'Imprint',
    description: company?.legalName
      ? `Company registration and contact information for ${company.legalName}.`
      : 'Company registration and contact information.',
    sections: [
      {
        heading: 'Company information',
        paras: [
          company?.legalName
            ? `This website is operated by ${company.legalName}. The details below identify the business behind it and how to reach us.`
            : 'The details below identify the business operating this website.',
        ],
      },
    ],
  },
}

const doc = computed(() => docs[String(route.params.slug)] ?? null)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const otherDocs = computed(() =>
  Object.entries(docs)
    .filter(([slug]) => slug !== route.params.slug)
    .map(([slug, d]) => ({ slug, navLabel: d.navLabel })),
)

useSeoMeta({
  title: () => doc.value?.title,
  description: () => doc.value?.description,
  ogTitle: () => doc.value?.title,
  ogDescription: () => doc.value?.description,
  ogType: 'website',
  ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/legal/${route.params.slug}` }],
})
</script>

<template>
  <div v-if="doc">
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Legal</span>
        <h1 class="legal-title">{{ doc.title }}</h1>
        <p v-if="doc.title === 'Imprint'">Registration and contact details of the business operating this website.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container legal-layout">
        <aside class="legal-nav">
          <span class="v-eyebrow">Documents</span>
          <NuxtLink
            v-for="item in otherDocs"
            :key="item.slug"
            :to="`/legal/${item.slug}`"
            class="legal-nav__link"
          >
            {{ item.navLabel }}
            <AppIcon name="arrow-right" :size="14" />
          </NuxtLink>
        </aside>

        <div class="legal-body">
          <!-- Imprint: company facts render from config when available -->
          <dl v-if="route.params.slug === 'imprint' && imprintFacts.length" class="legal-facts">
            <div v-for="fact in imprintFacts" :key="fact.label">
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>
          <p
            v-if="route.params.slug === 'imprint' && !imprintFacts.length"
            class="legal-note"
          >
            Company registration details are being finalised. Use the
            <NuxtLink to="/contact">contact page</NuxtLink> and we will provide full company details with our quotation.
          </p>

          <section v-for="section in doc.sections" :key="section.heading" class="legal-section">
            <h2>{{ section.heading }}</h2>
            <p v-for="(para, index) in section.paras" :key="index">{{ para }}</p>
          </section>

          <p class="legal-footer-note">
            Last reviewed: {{ new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' }) }}.
            Questions about this document? <NuxtLink to="/contact">Contact us</NuxtLink>.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pg-hero { padding-block: 84px 66px; }
.legal-title { margin-top: 15px; font-size: clamp(3rem, 7vw, 5rem); line-height: .9; text-transform: uppercase; }
.legal-layout { display: grid; grid-template-columns: 240px 1fr; gap: 56px; align-items: start; }
.legal-nav { display: grid; gap: 10px; position: sticky; top: 96px; }
.legal-nav__link { display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 14px; border: 1px solid rgba(17,17,16,.14); border-radius: 8px; font-size: 13px; color: var(--v-ink-soft); }
.legal-nav__link:hover { color: var(--v-ink); border-color: rgba(17,17,16,.3); }
.legal-body { max-width: 680px; display: grid; gap: 34px; }
.legal-facts { display: grid; gap: 12px; padding: 22px 24px; border: 1px solid rgba(17,17,16,.14); border-radius: 8px; background: var(--v-bg-soft, #f7f6f3); }
.legal-facts dt { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--v-ink-soft); }
.legal-facts dd { margin-top: 3px; font-size: 15px; font-weight: 500; }
.legal-note { padding: 18px 20px; border: 1px solid rgba(17,17,16,.14); border-radius: 8px; color: var(--v-ink-soft); font-size: 14px; }
.legal-section h2 { font-size: 21px; }
.legal-section p { margin-top: 10px; color: var(--v-ink-soft); font-size: 15px; line-height: 1.7; }
.legal-footer-note { border-top: 1px solid rgba(17,17,16,.12); padding-top: 20px; color: var(--v-ink-soft); font-size: 13px; }
.legal-footer-note a, .legal-note a { color: inherit; text-decoration: underline; }
@media (max-width: 860px) {
  .legal-layout { grid-template-columns: 1fr; gap: 28px; }
  .legal-nav { position: static; grid-template-columns: 1fr; }
}
</style>
