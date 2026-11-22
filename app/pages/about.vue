<script setup lang="ts">
const config = useRuntimeConfig()
const company = config.public.company as Record<string, string>
const hasCompanyFacts = computed(() =>
  Boolean(
    company?.legalName || company?.foundedYear || company?.markets ||
    company?.addressLine || company?.factorySince,
  ),
)

const ogImage = `${config.public.siteUrl}/og/og-cover.jpg`

useSeoMeta({
  title: 'About us',
  description:
    'VAKTRA is the export and trading company behind our own Wenzhou factory — automotive sensors, switches and control components manufactured since 1999, OE-referenced and fitment-checked.',
  ogTitle: 'About VAKTRA',
  ogDescription:
    'OE-referenced automotive sensors and control components, produced in our own factory and verified against OE and application data before listing.',
  ogType: 'website',
  ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/about` }],
})

const principles = [
  {
    number: '01',
    title: 'Fitment verified first',
    text: 'Every part number is cross-checked against OE references and application data before it enters our catalogue. If fitment cannot be verified, we say so.',
  },
  {
    number: '02',
    title: 'Narrow range, deep stock',
    text: 'We deliberately focus on a compact range — sensors, switches, solenoid valves and pressure monitoring — so quality control and availability stay in our own hands.',
  },
  {
    number: '03',
    title: 'Straight answers',
    text: 'Quotations state MOQ, lead time, packing and Incoterms up front. If a part is not a good match for your programme, we tell you before you order.',
  },
]
</script>

<template>
  <div class="about-page">
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">About VAKTRA</span>
        <h1>The supplier behind<br>the part number.</h1>
        <p>VAKTRA is the export company behind a Wenzhou factory building automotive sensors, switches and control components since 1999 — supplying distributors, importers and workshop chains.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container about-intro">
        <div>
          <span class="v-eyebrow">How we work</span>
          <h2>A catalogue you can quote from with confidence.</h2>
        </div>
        <div class="about-intro__copy">
          <p>
            VAKTRA is a Wenzhou trading and export company incorporated in 2025, set up to serve
            international buyers of the products made by our own factory in Rui'an — manufacturing
            automotive sensors, switches and control components since 1999. We verify every part
            number against OE references and application data, and quote with complete commercial
            terms.
          </p>
          <p>
            Our catalogue is deliberately compact — six specialist categories instead of ten
            thousand listings — so that fitment data, stock position and packing quality are
            things we can stand behind on every order.
          </p>
        </div>
      </div>
    </section>

    <section v-if="hasCompanyFacts" class="v-section about-facts" aria-label="Company information">
      <div class="v-container">
        <span class="v-eyebrow">Company facts</span>
        <dl class="about-facts__grid">
          <div v-if="company.legalName"><dt>Registered name</dt><dd>{{ company.legalName }}</dd></div>
          <div v-if="company.foundedYear"><dt>Company incorporated</dt><dd>{{ company.foundedYear }}</dd></div>
          <div v-if="company.factorySince"><dt>Our own factory since</dt><dd>{{ company.factorySince }}</dd></div>
          <div v-if="company.markets"><dt>Export markets</dt><dd>{{ company.markets }}</dd></div>
          <div v-if="company.addressLine"><dt>Registered address</dt><dd>{{ company.addressLine }}</dd></div>
          <div v-if="company.registrationNo"><dt>Registration no.</dt><dd>{{ company.registrationNo }}</dd></div>
          <div v-if="company.vatId"><dt>VAT / EORI</dt><dd>{{ company.vatId }}</dd></div>
        </dl>
      </div>
    </section>

    <section class="about-principles">
      <div class="v-container">
        <div class="about-principles__head">
          <span class="v-eyebrow">What buyers can expect</span>
          <h2>Quoted cleanly.<br>Shipped as agreed.</h2>
        </div>
        <div class="about-principles__grid">
          <article v-for="item in principles" :key="item.number">
            <span>{{ item.number }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="v-section about-next">
      <div class="v-container about-next__inner">
        <div>
          <span class="v-eyebrow">Start a conversation</span>
          <h2>Send us your target parts.</h2>
        </div>
        <div>
          <NuxtLink to="/contact" class="v-btn v-btn--primary v-btn--lg">
            Request pricing &amp; stock <AppIcon name="arrow-right" :size="16" />
          </NuxtLink>
          <NuxtLink to="/trade-terms" class="about-next__contact">
            Read our trade terms first
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page .pg-hero { padding-block: 84px 76px; }
.about-page .pg-hero h1 { margin-top: 15px; font-size: clamp(3.2rem, 8vw, 6rem); line-height: .9; text-transform: uppercase; }
.about-page .pg-hero p { max-width: 580px; margin-top: 20px; color: var(--v-ink-soft); font-size: 17px; }
.about-intro { display: grid; grid-template-columns: .9fr 1.1fr; gap: 60px; align-items: start; }
.about-intro h2, .about-principles__head h2, .about-next h2 { margin-top: 17px; font-size: clamp(2.2rem, 4vw, 3.8rem); line-height: .98; text-transform: uppercase; }
.about-intro__copy { display: grid; gap: 18px; max-width: 620px; color: var(--v-ink-soft); font-size: 15px; }
.about-facts__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 26px; }
.about-facts__grid > div { padding: 18px 20px; border: 1px solid rgba(17,17,16,.14); border-radius: 8px; background: var(--v-bg-soft, #f7f6f3); }
.about-facts dt { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--v-ink-soft); }
.about-facts dd { margin-top: 6px; font-size: 15px; font-weight: 500; }
.about-principles { padding: clamp(64px, 8vw, 100px) 0; background: #191d1f; color: #fff; }
.about-principles__head { margin-bottom: 38px; }
.about-principles__head h2 { font-size: clamp(2.5rem, 5vw, 4.5rem); }
.about-principles__grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.about-principles article { min-height: 210px; padding: 24px; border: 1px solid rgba(255,255,255,.15); border-radius: 8px; }
.about-principles article > span { color: #f0784d; font-size: 12px; font-weight: 800; letter-spacing: .15em; }
.about-principles h3 { margin-top: 30px; font-size: 24px; text-transform: uppercase; }
.about-principles article p { margin-top: 10px; color: rgba(255,255,255,.66); font-size: 13px; }
.about-next { background: var(--v-bg-soft); }
.about-next__inner { display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.about-next__inner > div:last-child { display: grid; justify-items: start; gap: 14px; }
.about-next__contact { color: var(--v-ink-soft); font-size: 13px; }
.about-next__contact:hover { color: var(--v-green); }
@media (max-width: 720px) {
  .about-intro { grid-template-columns: 1fr; gap: 24px; }
  .about-facts__grid { grid-template-columns: 1fr; }
  .about-principles__grid { grid-template-columns: 1fr; }
  .about-principles article { min-height: 175px; }
  .about-principles h3 { margin-top: 22px; }
  .about-next__inner { align-items: flex-start; flex-direction: column; }
}
</style>
