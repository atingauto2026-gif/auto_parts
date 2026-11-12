<script setup lang="ts">
import type { Component } from 'vue'
import {
  AppstoreOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  DownOutlined,
  EnvironmentOutlined,
  LeftOutlined,
  LinkedinOutlined,
  MailOutlined,
  MenuOutlined,
  MinusOutlined,
  PhoneOutlined,
  PlusOutlined,
  RocketOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons-vue'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    strokeWidth?: number | string
  }>(),
  { size: 16, strokeWidth: 1.5 },
)

const ANTD_ICONS: Record<string, Component> = {
  menu: MenuOutlined,
  close: CloseOutlined,
  'chevron-down': DownOutlined,
  'chevron-right': RightOutlined,
  'chevron-left': LeftOutlined,
  'arrow-right': ArrowRightOutlined,
  cart: ShoppingCartOutlined,
  user: UserOutlined,
  plus: PlusOutlined,
  minus: MinusOutlined,
  check: CheckOutlined,
  trash: DeleteOutlined,
  phone: PhoneOutlined,
  mail: MailOutlined,
  'map-pin': EnvironmentOutlined,
  whatsapp: WhatsAppOutlined,
  shield: SafetyCertificateOutlined,
  headset: CustomerServiceOutlined,
  wrench: ToolOutlined,
  rocket: RocketOutlined,
  grid: AppstoreOutlined,
  users: TeamOutlined,
  search: SearchOutlined,
  star: StarOutlined,
  linkedin: LinkedinOutlined,
}

const CUSTOM_ICONS: Record<string, string> = {
  sun:
    '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  truck:
    '<path d="M3 7h11v9H3zM14 11h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  'precision-agriculture':
    '<path d="M12 21V9M12 9c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6zM12 13c-2.8 0-5-2.2-5-5 2.8 0 5 2.2 5 5z"/><path d="M4 21h16"/>',
  battery:
    '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M20 10v4"/><path d="M6 10v4M10 10v4M14 10v4"/>',
}

const antIcon = computed(() => ANTD_ICONS[props.name])
const customIcon = computed(() => CUSTOM_ICONS[props.name] ?? CUSTOM_ICONS.check)
const iconStyle = computed(() => ({
  fontSize: typeof props.size === 'number' ? props.size + 'px' : props.size,
  lineHeight: 1,
  verticalAlign: '-0.125em',
}))
</script>

<template>
  <component
    :is="antIcon"
    v-if="antIcon"
    :style="iconStyle"
    aria-hidden="true"
    focusable="false"
  />
  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="customIcon"
  />
</template>
