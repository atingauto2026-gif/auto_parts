import {
  Alert,
  Button,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Typography,
} from 'ant-design-vue'

/**
 * Register the focused Ant Design Vue component set used by the storefront.
 * We intentionally skip reset.css so the storefront layout remains intact.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const components = [
    Alert,
    Button,
    ConfigProvider,
    Empty,
    Form,
    Input,
    InputNumber,
    Select,
    Tag,
    Typography,
  ]

  components.forEach((component) => nuxtApp.vueApp.use(component))
})
