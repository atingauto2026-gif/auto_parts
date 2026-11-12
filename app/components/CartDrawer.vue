<script setup lang="ts">
/**
 * Slide-over cart. Opens automatically after `useCart().add()` resolves so the
 * customer sees what happened instead of only a badge change.
 */
const {
  cart,
  count,
  isEmpty,
  pending,
  drawerOpen,
  checkoutEnabled,
  closeDrawer,
  refresh,
  setQuantity,
  remove,
} = useCart()

const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const error = ref('')
const busy = ref(false)
let lastFocused: HTMLElement | null = null

const subtotal = computed(() => formatMoney(cart.value?.subtotal))

function variantLabel(title: string) {
  return !title || title === 'Default Title' ? '' : title
}

async function changeQuantity(lineId: string, quantity: number) {
  if (quantity < 1) return
  error.value = ''
  try {
    await setQuantity(lineId, quantity)
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

async function removeLine(lineId: string) {
  error.value = ''
  busy.value = true
  try {
    await remove(lineId)
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    busy.value = false
  }
}

function checkout() {
  const url = cart.value?.checkoutUrl
  if (!url) return
  window.location.href = url
}

/* -------------------------------------------------------------- behaviour */

function lockScroll(lock: boolean) {
  if (import.meta.server) return
  const root = document.documentElement
  if (lock) {
    const gap = window.innerWidth - root.clientWidth
    root.style.setProperty('--v-scrollbar-gap', `${gap}px`)
    root.classList.add('v-drawer-open')
  } else {
    root.classList.remove('v-drawer-open')
    root.style.removeProperty('--v-scrollbar-gap')
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!drawerOpen.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    closeDrawer()
    return
  }

  if (event.key !== 'Tab' || !panel.value) return

  const nodes = Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => node.offsetParent !== null)

  if (!nodes.length) return

  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (!first || !last) return

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  }
}

watch(drawerOpen, async (open) => {
  if (import.meta.server) return

  if (open) {
    lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    lockScroll(true)
    if (!cart.value) {
      try {
        await refresh()
      } catch {
        /* an empty cart is a valid state */
      }
    }
    await nextTick()
    closeButton.value?.focus()
  } else {
    lockScroll(false)
    lastFocused?.focus()
    lastFocused = null
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  lockScroll(false)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cd">
      <div v-if="drawerOpen" class="cd">
        <div class="cd__scrim" @click="closeDrawer"></div>

        <aside
          ref="panel"
          class="cd__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
        >
          <header class="cd__head">
            <div>
              <p class="cd__eyebrow">Your cart</p>
              <h2 class="cd__title">{{ count }} {{ count === 1 ? 'item' : 'items' }}</h2>
            </div>

            <button
              ref="closeButton"
              type="button"
              class="cd__close"
              aria-label="Close cart"
              @click="closeDrawer"
            >
              <AppIcon name="close" :size="18" />
            </button>
          </header>

          <div v-if="isEmpty" class="cd__empty">
            <span class="cd__empty-icon"><AppIcon name="cart" :size="26" /></span>
            <h3>Your cart is empty</h3>
            <p>Add a machine to see it here, or talk to us and we will size one for your ground.</p>
            <NuxtLink to="/products" class="v-btn v-btn--primary" @click="closeDrawer">
              Browse products
            </NuxtLink>
          </div>

          <template v-else>
            <div class="cd__body">
              <ul class="cd__lines">
                <li v-for="line in cart?.lines" :key="line.id" class="cd-line">
                  <NuxtLink
                    :to="`/products/${line.merchandise.productHandle}`"
                    class="cd-line__media"
                    @click="closeDrawer"
                  >
                    <img
                      v-if="line.merchandise.image"
                      :src="line.merchandise.image.url"
                      :alt="line.merchandise.image.altText || line.merchandise.productTitle"
                      loading="lazy"
                    >
                  </NuxtLink>

                  <div class="cd-line__info">
                    <NuxtLink
                      :to="`/products/${line.merchandise.productHandle}`"
                      class="cd-line__title"
                      @click="closeDrawer"
                    >
                      {{ line.merchandise.productTitle }}
                    </NuxtLink>

                    <p v-if="variantLabel(line.merchandise.title)" class="cd-line__variant">
                      {{ line.merchandise.title }}
                    </p>

                    <div class="cd-line__row">
                      <QuantityStepper
                        :model-value="line.quantity"
                        :min="1"
                        :max="20"
                        @update:model-value="changeQuantity(line.id, $event)"
                      />
                      <span class="cd-line__price">{{ formatMoney(line.merchandise.price) }}</span>
                    </div>

                    <a-button
                      type="link"
                      danger
                      size="small"
                      class="cd-line__remove"
                      :disabled="busy || pending"
                      @click="removeLine(line.id)"
                    >
                      Remove
                    </a-button>
                  </div>
                </li>
              </ul>

              <a-alert v-if="error" class="cd__error" type="error" show-icon :message="error" />
            </div>

            <footer class="cd__foot">
              <div class="cd__subtotal">
                <span>Subtotal</span>
                <strong>{{ subtotal }}</strong>
              </div>
              <p class="cd__note">
                Shipping and applicable taxes are confirmed at checkout.
              </p>

              <a-button
                type="primary"
                size="large"
                block
                class="cd-checkout-btn"
                :disabled="!cart?.checkoutUrl"
                @click="checkout"
              >
                Continue to checkout
                <AppIcon name="arrow-right" :size="16" />
              </a-button>

              <NuxtLink to="/cart" class="cd__cartlink" @click="closeDrawer">
                View full cart
              </NuxtLink>

              <p v-if="!checkoutEnabled" class="cd__preview">
                Preview catalogue — checkout opens on Shopify once a Storefront API token is
                configured.
              </p>
            </footer>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
