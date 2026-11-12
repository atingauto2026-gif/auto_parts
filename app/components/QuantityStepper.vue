<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  min?: number
  max?: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const min = computed(() => props.min ?? 1)
const max = computed(() => props.max ?? 99)

function onChange(value: number | string | null) {
  if (value === null || value === '') return
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return
  emit('update:modelValue', Math.min(max.value, Math.max(min.value, Math.round(numeric))))
}
</script>

<template>
  <div class="v-qty">
    <a-input-number
      :value="modelValue"
      :min="min"
      :max="max"
      :step="1"
      :precision="0"
      :controls="true"
      size="middle"
      class="v-qty__control"
      aria-label="Quantity"
      @change="onChange"
    />
  </div>
</template>
