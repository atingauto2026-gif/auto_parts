import type { Cart } from '#shared/types'

export function useCart() {
  const cart = useState<Cart | null>('vesper-cart', () => null)
  const checkoutEnabled = useState<boolean>('vesper-checkout-enabled', () => false)
  const pending = useState<boolean>('vesper-cart-pending', () => false)
  const drawerOpen = useState<boolean>('vesper-cart-drawer-open', () => false)

  function openDrawer() {
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  const count = computed(() => cart.value?.totalQuantity ?? 0)
  const isEmpty = computed(() => !cart.value || cart.value.lines.length === 0)

  const requestFetch = useRequestFetch()

  async function refresh() {
    try {
      const response = await requestFetch<{ cart: Cart | null; checkoutEnabled: boolean }>(
        '/api/cart',
      )
      cart.value = response.cart
      checkoutEnabled.value = response.checkoutEnabled
    } catch {
      cart.value = null
    }
    return cart.value
  }

  async function add(variantId: string, quantity = 1) {
    pending.value = true
    try {
      const response = await requestFetch<{ cart: Cart }>('/api/cart/lines', {
        method: 'POST',
        body: { variantId, quantity },
      })
      cart.value = response.cart
      // Every successful add opens the drawer so the result is visible.
      drawerOpen.value = true
    } finally {
      pending.value = false
    }
    return cart.value
  }

  async function setQuantity(lineId: string, quantity: number) {
    pending.value = true
    try {
      const response = await requestFetch<{ cart: Cart }>('/api/cart/lines', {
        method: 'PATCH',
        body: { lineId, quantity },
      })
      cart.value = response.cart
    } finally {
      pending.value = false
    }
    return cart.value
  }

  async function remove(lineId: string) {
    pending.value = true
    try {
      const response = await requestFetch<{ cart: Cart }>('/api/cart/lines', {
        method: 'DELETE',
        query: { lineId },
      })
      cart.value = response.cart
    } finally {
      pending.value = false
    }
    return cart.value
  }

  return {
    cart,
    count,
    isEmpty,
    pending,
    checkoutEnabled,
    drawerOpen,
    openDrawer,
    closeDrawer,
    refresh,
    add,
    setQuantity,
    remove,
  }
}
