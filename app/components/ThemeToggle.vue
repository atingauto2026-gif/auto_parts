<script setup lang="ts">
const { scheme, toggle, sync } = useTheme()

onMounted(sync)

const label = computed(() =>
  scheme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
)
</script>

<template>
  <button
    type="button"
    class="site-icon-btn"
    :aria-label="label"
    :aria-pressed="scheme === 'dark'"
    :title="label"
    @click="toggle"
  >
    <AppIcon :name="scheme === 'dark' ? 'sun' : 'moon'" :size="15" />
  </button>
</template>
