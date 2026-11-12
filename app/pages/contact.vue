<script setup lang="ts">
const config = useRuntimeConfig()

const whatsappHref = computed(
  () =>
    `https://wa.me/${config.public.whatsapp}?text=${encodeURIComponent(
      'Hello! I have a question about auto parts or vehicle fitment.',
    )}`,
)

useSeoMeta({
  title: 'Contact | RoadReady Auto',
  description:
    'Contact RoadReady Auto for help finding auto parts and checking vehicle fitment.',
  ogTitle: 'Contact RoadReady Auto',
  ogDescription:
    'Get help finding auto parts and checking vehicle fitment.',
  ogType: 'website',
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
        <h1>We’re here to help.</h1>
        <p>Questions about a part or fitment? Send us your vehicle details and we’ll point you in the right direction.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container ct-layout">
        <aside class="ct-aside" data-reveal="left">
          <span class="v-eyebrow">Talk to a person</span>
          <h2 style="margin-top: 12px; font-size: clamp(1.6rem, 3vw, 2.3rem)">
            Let’s find the right fit
          </h2>
          <p class="ct-aside__sub">
            Make, model, year and trim can change what fits. Share what you drive and what you need.
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

            <li v-if="config.public.email" class="ct-item">
              <span class="ct-item__icon"><AppIcon name="mail" :size="17" /></span>
              <div>
                <div class="ct-item__label">Email</div>
                <div class="ct-item__value">
                  <a :href="`mailto:${config.public.email}`">{{ config.public.email }}</a>
                </div>
              </div>
              <AppIcon name="arrow-right" :size="15" />
            </li>

            <li v-if="config.public.whatsapp" class="ct-item">
              <span class="ct-item__icon"><AppIcon name="whatsapp" :size="17" /></span>
              <div>
                <div class="ct-item__label">WhatsApp</div>
                <div class="ct-item__value">
                  <a :href="whatsappHref" target="_blank" rel="noopener">{{ config.public.phone }}</a>
                </div>
                <div class="ct-item__note">Prefer WhatsApp? Chat with us.</div>
              </div>
              <AppIcon name="arrow-right" :size="15" />
            </li>

          </ul>
        </aside>

        <div data-reveal>
          <ContactForm />
        </div>
      </div>
    </section>
  </div>
</template>
