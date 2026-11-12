<script setup lang="ts">
const props = defineProps<{
  product: string
  code: string
}>()

const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  region: '',
  interest: '',
  message: '',
})

const options = computed(() => [
  props.product,
  `${props.code} — pricing and lead time`,
  `${props.code} — demo or site visit`,
  'Service, parts or warranty',
])

const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  if (sending.value || sent.value) return
  error.value = ''
  sending.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        product: form.interest || props.product,
        leadType: 'product_quote',
        message: [
          form.region ? `Region: ${form.region}` : '',
          form.interest ? `Interest: ${form.interest}` : '',
          form.message,
        ]
          .filter(Boolean)
          .join('\n'),
      },
    })
    sent.value = true
    trackEvent('generate_lead', { form: 'product_quote', product: props.code })
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="dl__quote-form">
    <div v-if="sent" class="dl-form__success" role="status">
      <strong>Thanks — your enquiry is on its way.</strong>
      We’ll review your question and get back to you as soon as we can.
    </div>

    <form v-else class="dl-form" @submit.prevent="submit">
      <div class="dl-form__row">
        <label>
          Name
          <input v-model.trim="form.name" type="text" name="name" autocomplete="name" required>
        </label>
        <label>
          Email
          <input v-model.trim="form.email" type="email" name="email" autocomplete="email" required>
        </label>
      </div>

      <div class="dl-form__row">
        <label>
          Phone
          <input v-model.trim="form.phone" type="tel" name="phone" autocomplete="tel">
        </label>
        <label>
          Company
          <input v-model.trim="form.company" type="text" name="company" autocomplete="organization">
        </label>
      </div>

      <div class="dl-form__row">
        <label>
          Region
          <input
            v-model.trim="form.region"
            type="text"
            name="region"
            autocomplete="address-level1"
            placeholder="State or region"
          >
        </label>
        <label>
          Interest
          <select v-model="form.interest" name="interest">
            <option value="">{{ product }}</option>
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>
      </div>

      <label>
        Message
        <textarea
          v-model.trim="form.message"
          name="message"
          rows="4"
          placeholder="Ground conditions, acreage, timeline or access notes"
        ></textarea>
      </label>

      <p class="dl-form__privacy">
        We use your details only to answer this enquiry. Prefer email?
        <a :href="`mailto:${config.public.email}`">{{ config.public.email }}</a>
      </p>

      <button type="submit" class="dl-form__submit" :disabled="sending">
        {{ sending ? 'Sending…' : 'Request a quote' }}
      </button>

      <p v-if="error" class="dl-form__status" role="alert">{{ error }}</p>
    </form>
  </div>
</template>
