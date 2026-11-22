<script setup lang="ts">
import { theme as antdThemeTools } from 'ant-design-vue'

const { scheme, sync } = useTheme()

onMounted(sync)

// Organization structured data for search engines and AI answer engines.
// Fields stay empty until real company data is configured — JSON-LD only
// includes keys that exist, so we never publish invented identity data.
const config = useRuntimeConfig()
const company = (config.public as Record<string, unknown>).company as Record<string, string> | undefined
const orgJsonLd = computed(() => {
  const c = company ?? {}
  const org: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RoadReady Auto',
    description: 'Automotive sensors, switches and control components for wholesale buyers.',
    url: config.public.siteUrl,
    logo: `${config.public.siteUrl}/og/og-cover.jpg`,
  }
  if (c.legalName) org.legalName = c.legalName
  if (c.foundedYear) org.foundingDate = c.foundedYear
  if (c.markets) org.knowsAbout = c.markets
  if (c.addressLine) org.address = { '@type': 'PostalAddress', streetAddress: c.addressLine }
  if (config.public.email) org.email = config.public.email
  if (config.public.phone) org.telephone = config.public.phone
  if (config.public.whatsapp) org.contactPoint = {
    '@type': 'ContactPoint',
    contactType: 'sales',
    availableLanguage: ['en'],
  }
  return JSON.stringify(org)
})

useHead({
  script: [{ type: 'application/ld+json', innerHTML: orgJsonLd }],
})

onMounted(async () => {
  const hash = window.location.hash
  if (!hash.includes('access_token=') || !hash.includes('refresh_token=')) return
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const access_token = params.get('access_token') || ''
  const refresh_token = params.get('refresh_token') || ''
  const expires_in = Number(params.get('expires_in') || 3600)
  window.history.replaceState(null, '', window.location.pathname + window.location.search)
  try {
    await $fetch('/api/admin/auth/session', {
      method: 'POST',
      body: { access_token, refresh_token, expires_in },
    })
    await navigateTo('/admin/import')
  } catch {
    await navigateTo('/admin/login?error=link-invalid')
  }
})


const antdTheme = computed(() => {
  const dark = scheme.value === 'dark'
  const primary = dark ? '#e58a4c' : '#d97732'

  return {
    algorithm: dark ? antdThemeTools.darkAlgorithm : antdThemeTools.defaultAlgorithm,
    token: {
      // RoadReady Auto palette, with Ant Design semantic states.
      colorPrimary: primary,
      colorPrimaryHover: dark ? '#f0a36c' : '#b85d25',
      colorPrimaryActive: dark ? '#d97732' : '#8f461d',
      colorInfo: primary,
      colorSuccess: dark ? '#72d4a0' : '#389e0d',
      colorWarning: dark ? '#ff9a70' : '#c85a0a',
      colorError: dark ? '#ff7875' : '#cf3f36',

      // Surfaces and text stay in sync with tokens.css.
      colorBgLayout: dark ? '#10171c' : '#f1f3f4',
      colorBgContainer: dark ? '#1c272e' : '#ffffff',
      colorBgElevated: dark ? '#24313a' : '#ffffff',
      colorFillAlter: dark ? 'rgba(255,255,255,.045)' : 'rgba(17,17,16,.035)',
      colorFillSecondary: dark ? 'rgba(255,255,255,.07)' : 'rgba(17,17,16,.045)',
      colorText: dark ? '#f0f3f4' : '#17212a',
      colorTextHeading: dark ? '#f0f3f4' : '#17212a',
      colorTextSecondary: dark ? '#aab6bd' : '#66737d',
      colorTextTertiary: dark ? 'rgba(243,242,239,.62)' : 'rgba(23,26,28,.55)',
      colorTextLabel: dark ? '#c6cec6' : '#50534f',
      colorBorder: dark ? 'rgba(255,255,255,.16)' : 'rgba(17,17,16,.14)',
      colorBorderSecondary: dark ? 'rgba(255,255,255,.10)' : 'rgba(17,17,16,.09)',
      colorSplit: dark ? 'rgba(255,255,255,.10)' : 'rgba(17,17,16,.08)',
      colorLink: primary,
      colorLinkHover: dark ? '#f0a36c' : '#b85d25',
      colorLinkActive: dark ? '#d97732' : '#8f461d',
      colorIcon: dark ? '#aab6bd' : '#66737d',
      colorIconHover: dark ? '#f0f3f4' : '#17212a',

      // Barlow is the shared interface and display face.
      fontFamily: '"Barlow", system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
      fontFamilyCode: 'ui-monospace, SFMono-Regular, Consolas, monospace',
      fontSize: 14,
      fontSizeSM: 12,
      fontSizeLG: 16,
      fontSizeXL: 20,
      fontSizeHeading1: 44,
      fontSizeHeading2: 34,
      fontSizeHeading3: 27,
      fontSizeHeading4: 21,
      fontSizeHeading5: 17,
      fontWeightStrong: 700,
      lineHeight: 1.6,
      lineHeightHeading1: 1.02,
      lineHeightHeading2: 1.08,
      lineHeightHeading3: 1.12,
      lineHeightHeading4: 1.18,
      lineHeightHeading5: 1.25,

      borderRadius: 8,
      borderRadiusSM: 4,
      borderRadiusLG: 12,
      borderRadiusOuter: 12,
      controlHeight: 44,
      controlHeightSM: 32,
      controlHeightLG: 50,
      controlOutline: dark ? 'rgba(229,138,76,.20)' : 'rgba(217,119,50,.16)',
      controlOutlineWidth: 3,
    },
  }
})
</script>

<template>
  <a-config-provider :theme="antdTheme">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>
