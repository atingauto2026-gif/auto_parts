<script setup lang="ts">
const config = useRuntimeConfig()
const { cart, isEmpty, checkoutEnabled, pending, setQuantity, remove, refresh, count } = useCart()

const error = ref('')

onMounted(() => {
  if (!cart.value) refresh()
})

const subtotal = computed(() => formatMoney(cart.value?.subtotal))
const total = computed(() => formatMoney(cart.value?.total))

async function changeQuantity(lineId: string, quantity: number) {
  error.value = ''
  try {
    await setQuantity(lineId, quantity)
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

async function removeLine(lineId: string) {
  error.value = ''
  try {
    await remove(lineId)
  } catch (cause) {
    error.value = errorMessage(cause)
  }
}

function checkout() {
  const url = cart.value?.checkoutUrl
  if (!url) return
  trackEvent('begin_checkout', {
    currency: cart.value?.subtotal.currencyCode,
    value: Number(cart.value?.subtotal.amount ?? 0),
    items: cart.value?.lines.map((line) => ({
      item_id: line.merchandise.productHandle,
      item_name: line.merchandise.productTitle,
      item_variant: line.merchandise.title,
      price: Number(line.merchandise.price.amount),
      quantity: line.quantity,
    })),
  })
  window.location.href = url
}

useSeoMeta({
  title: 'Cart | RoadReady Auto',
  description: 'Review your RoadReady Auto parts and accessories order.',
  robots: 'noindex, nofollow',
})

useHead({
  link: [{ rel: 'canonical', href: `${config.public.siteUrl}/cart` }],
})
</script>

<template>
  <div>
    <section class="pg-hero">
      <div class="v-container">
        <span class="v-eyebrow">Your order</span>
        <h1>Cart</h1>
        <div class="pg-hero__meta">
          <span>{{ count }} {{ count === 1 ? 'item' : 'items' }}</span>
          <span>Checkout and payment are handled by Shopify</span>
        </div>
      </div>
    </section>

    <section class="v-section">
      <div class="v-container">
        <p v-if="error" class="v-form-note v-form-note--error" style="margin-bottom: 20px">
          {{ error }}
        </p>

        <div v-if="isEmpty" class="cart-empty">
          <AppIcon name="cart" :size="34" style="color: var(--v-ink-faint)" />
          <h2>Your cart is empty</h2>
          <p>Explore parts and accessories for your vehicle and add your next upgrade.</p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center">
            <NuxtLink to="/products" class="v-btn v-btn--primary">Browse products</NuxtLink>
            <NuxtLink to="/contact" class="v-btn v-btn--outline">Talk to the team</NuxtLink>
          </div>
        </div>

        <div v-else class="cart-layout">
          <div class="cart-lines">
            <div v-for="line in cart?.lines" :key="line.id" class="cart-line">
              <div class="cart-line__media">
                <img
                  v-if="line.merchandise.image"
                  :src="line.merchandise.image.url"
                  :alt="line.merchandise.image.altText || line.merchandise.productTitle"
                  loading="lazy"
                >
              </div>

              <div>
                <NuxtLink :to="`/products/${line.merchandise.productHandle}`" class="cart-line__title">
                  {{ line.merchandise.productTitle }}
                </NuxtLink>
                <div v-if="line.merchandise.title && line.merchandise.title !== 'Default Title'" class="cart-line__variant">
                  {{ line.merchandise.title }}
                </div>

                <div class="cart-line__controls">
                  <QuantityStepper
                    :model-value="line.quantity"
                    :min="1"
                    :max="20"
                    @update:model-value="changeQuantity(line.id, $event)"
                  />
                  <button type="button" class="cart-line__remove" :disabled="pending" @click="removeLine(line.id)">
                    Remove
                  </button>
                </div>
              </div>

              <div class="cart-line__price">
                {{ formatMoney(line.merchandise.price) }}
              </div>
            </div>
          </div>

          <aside class="cart-summary">
            <h2>Order summary</h2>

            <div class="cart-summary__row">
              <span>Items</span>
              <strong>{{ count }}</strong>
            </div>
            <div class="cart-summary__row">
              <span>Subtotal</span>
              <strong>{{ subtotal }}</strong>
            </div>
            <div class="cart-summary__row">
              <span>Freight</span>
              <span>Quoted after order</span>
            </div>

            <div class="cart-summary__total">
              <span>Total</span>
              <strong>{{ total }}</strong>
            </div>

            <button
              type="button"
              class="v-btn v-btn--primary v-btn--block v-btn--lg"
              :disabled="!cart?.checkoutUrl"
              @click="checkout"
            >
              Continue to checkout
              <AppIcon name="arrow-right" :size="16" />
            </button>

            <p v-if="!cart?.checkoutUrl" class="cart-summary__note">
              Preview mode: add Shopify Storefront API credentials to enable checkout. Sample
              prices are for demonstration and no payment is processed in preview mode.
            </p>
            <p v-else class="cart-summary__note">
              You will be redirected to Shopify checkout to complete your order.
            </p>

            <NuxtLink to="/products" class="v-btn v-btn--ghost">Continue shopping</NuxtLink>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
