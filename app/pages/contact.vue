<script setup lang="ts">
const config = useRuntimeConfig()

const whatsappHref = computed(
  () =>
    `https://wa.me/${config.public.whatsapp}?text=${encodeURIComponent(
      'Hello RoadReady team — I would like to enquire about part availability and pricing.',
    )}`,
)

const ogImage = `${config.public.siteUrl}/og/og-cover.jpg`

useSeoMeta({
  title: 'Contact',
  description:
    'Contact RoadReady Auto for wholesale pricing, stock availability, OE cross-references and samples. Every enquiry gets a personal reply.',
  ogTitle: 'Contact RoadReady Auto',
  ogDescription:
    'Wholesale enquiries, OE cross-references and sample requests — answered by our export team.',
  ogType: 'website',
  ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/contact` }],
})
</script>

<template>
  <div>
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Get in touch</span>
        <h1>Talk to the<br>export team.</h1>
        <p>Wholesale pricing, stock availability, OE cross-references or samples — send us your part numbers and target volumes. Every enquiry gets a personal reply, not an auto-responder.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container ct-layout">
        <aside class="ct-aside" data-reveal="left">
          <span class="v-eyebrow">Direct lines</span>
          <h2 style="margin-top: 12px; font-size: clamp(1.6rem, 3vw, 2.3rem)">
            Reach us the way you work
          </h2>
          <p class="ct-aside__sub">
            Business hours and full contact details are confirmed on every quotation. WhatsApp is the fastest channel for stock checks.
          </p>

          <ul class="ct-list">
            <li v-if="config.public.phone" class="ct-item">
              <span class="ct-item__icon"><AppIcon name="phone" :size="17" /></span>
              <div>
                <div class="ct-item__label">Phone</div>
                <div class="ct-item__value">
                  <a :href="`tel:${config.public.phone}`">{{ config.public.phone }}</a>
                </div>
              </div>
              <AppIcon name="arrow-right" :size="15" />
            </li>

            <li v-if="config.public.whatsapp" class="ct-item">
              <span class="ct-item__icon"><AppIcon name="whatsapp" :size="17" /></span>
              <div>
                <div class="ct-item__label">WhatsApp</div>
                <div class="ct-item__value">
                  <a :href="whatsappHref" target="_blank" rel="noopener">{{ config.public.whatsapp }}</a>
                </div>
                <div class="ct-item__note">Fastest for stock and price checks.</div>
              </div>
              <AppIcon name="arrow-right" :size="15" />
            </li>

            <li v-if="config.public.email" class="ct-item">
              <span class="ct-item__icon"><AppIcon name="mail" :size="17" /></span>
              <div>
                <div class="ct-item__label">Email</div>
                <div class="ct-item__value">
                  <a :href="`mailto:${config.public.email}`">{{ config.public.email }}</a>
                </div>
                <div class="ct-item__note">Best for quotations and order documents.</div>
              </div>
              <AppIcon name="arrow-right" :size="15" />
            </li>

          </ul>

          <p v-if="!config.public.phone && !config.public.whatsapp && !config.public.email" class="ct-aside__sub">
            Our direct lines are being finalised — the enquiry form below reaches the same team.
          </p>
        </aside>

        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  </div>
</template>
