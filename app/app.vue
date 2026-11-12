<script setup lang="ts">
import { theme as antdThemeTools } from 'ant-design-vue'

const { refresh } = useCart()
const { scheme, sync } = useTheme()

// Cart is read once per page load so the header badge is server-rendered.
await callOnce('roadready-cart-bootstrap', () => refresh())

onMounted(sync)

const antdTheme = computed(() => {
  const dark = scheme.value === 'dark'
  const primary = dark ? '#ff8153' : '#e85d2a'

  return {
    algorithm: dark ? antdThemeTools.darkAlgorithm : antdThemeTools.defaultAlgorithm,
    token: {
      // RoadReady Auto palette, with Ant Design semantic states.
      colorPrimary: primary,
      colorPrimaryHover: dark ? '#ff9a70' : '#c9481b',
      colorPrimaryActive: dark ? '#e85d2a' : '#aa3915',
      colorInfo: primary,
      colorSuccess: dark ? '#72d4a0' : '#389e0d',
      colorWarning: dark ? '#ff9a70' : '#c85a0a',
      colorError: dark ? '#ff7875' : '#cf3f36',

      // Surfaces and text stay in sync with tokens.css.
      colorBgLayout: dark ? '#101315' : '#f5f4f0',
      colorBgContainer: dark ? '#1b2022' : '#ffffff',
      colorBgElevated: dark ? '#22282a' : '#ffffff',
      colorFillAlter: dark ? 'rgba(255,255,255,.045)' : 'rgba(17,17,16,.035)',
      colorFillSecondary: dark ? 'rgba(255,255,255,.07)' : 'rgba(17,17,16,.045)',
      colorText: dark ? '#f3f2ef' : '#171a1c',
      colorTextHeading: dark ? '#f3f2ef' : '#171a1c',
      colorTextSecondary: dark ? '#aeb4b4' : '#73797a',
      colorTextTertiary: dark ? 'rgba(243,242,239,.62)' : 'rgba(23,26,28,.55)',
      colorTextLabel: dark ? '#c6cec6' : '#50534f',
      colorBorder: dark ? 'rgba(255,255,255,.16)' : 'rgba(17,17,16,.14)',
      colorBorderSecondary: dark ? 'rgba(255,255,255,.10)' : 'rgba(17,17,16,.09)',
      colorSplit: dark ? 'rgba(255,255,255,.10)' : 'rgba(17,17,16,.08)',
      colorLink: primary,
      colorLinkHover: dark ? '#ff9a70' : '#c9481b',
      colorLinkActive: dark ? '#e85d2a' : '#aa3915',
      colorIcon: dark ? '#aeb4b4' : '#73797a',
      colorIconHover: dark ? '#f3f2ef' : '#171a1c',

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

      borderRadius: 12,
      borderRadiusSM: 8,
      borderRadiusLG: 18,
      borderRadiusOuter: 22,
      controlHeight: 44,
      controlHeightSM: 32,
      controlHeightLG: 50,
      controlOutline: dark ? 'rgba(255,129,83,.20)' : 'rgba(232,93,42,.16)',
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
