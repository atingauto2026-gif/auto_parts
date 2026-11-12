<script setup lang="ts">
const config = useRuntimeConfig()

useSeoMeta({
  title: 'About RoadReady Auto',
  description: 'Auto parts and accessories chosen to make it easier to get your vehicle ready for the road.',
  ogTitle: 'About RoadReady Auto',
  ogDescription: 'Thoughtful upgrades and dependable essentials for every drive.',
  ogType: 'website',
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/about` }],
})

const principles = [
  {
    number: '01',
    title: 'Fit comes first',
    text: 'Vehicle parts are not one-size-fits-all. We make fitment details part of the shopping conversation.',
  },
  {
    number: '02',
    title: 'Useful by design',
    text: 'From practical maintenance essentials to weekend upgrades, every category has a job to do.',
  },
  {
    number: '03',
    title: 'Help when you need it',
    text: 'Not sure what works for your vehicle? Reach out with your make, model and year.',
  },
]
</script>

<template>
  <div class="about-page">
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">About RoadReady</span>
        <h1>Better parts.<br>Better drives.</h1>
        <p>We make it easier to find the auto parts and accessories that make your vehicle feel like yours.</p>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container about-intro">
        <div>
          <span class="v-eyebrow">Our approach</span>
          <h2>For the everyday drive and the long way around.</h2>
        </div>
        <div class="about-intro__copy">
          <p>
            RoadReady Auto is an auto parts and accessories storefront built around a simple idea:
            shopping for vehicle gear should feel straightforward. Browse by category, explore
            products, and get in touch when you need help checking what fits.
          </p>
          <p>
            Whether you are refreshing the cabin, upgrading your lighting or getting ready for a
            weekend away, start with the vehicle details and choose parts with confidence.
          </p>
        </div>
      </div>
    </section>

    <section class="about-principles">
      <div class="v-container">
        <div class="about-principles__head">
          <span class="v-eyebrow">What matters</span>
          <h2>A little more confidence<br>in every choice.</h2>
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
          <span class="v-eyebrow">Ready when you are</span>
          <h2>Make the next drive yours.</h2>
        </div>
        <div>
          <NuxtLink to="/products" class="v-btn v-btn--primary v-btn--lg">
            Browse auto parts <AppIcon name="arrow-right" :size="16" />
          </NuxtLink>
          <NuxtLink to="/contact" class="about-next__contact">
            Questions? Talk to us
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
  .about-principles__grid { grid-template-columns: 1fr; }
  .about-principles article { min-height: 175px; }
  .about-principles h3 { margin-top: 22px; }
  .about-next__inner { align-items: flex-start; flex-direction: column; }
}
</style>
