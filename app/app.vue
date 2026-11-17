<script setup lang="ts">
import { theme as antdThemeTools } from 'ant-design-vue'

const { scheme, sync } = useTheme()

onMounted(sync)

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
