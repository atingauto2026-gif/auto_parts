<script setup lang="ts">
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  country: '',
  product: '',
  volume: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  sending.value = true
  try {
    // Structured B2B fields (country / volume) are folded into `message`, and
    // OE / part numbers go into `product`, so the leads table and the contact
    // API keep their existing schema — no migration required.
    const composedMessage = [
      form.message,
      form.country ? `Country / target market: ${form.country}` : '',
      form.volume ? `Estimated volume: ${form.volume}` : '',
    ].filter(Boolean).join('\n')

    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        product: form.product,
        message: composedMessage,
        leadType: 'contact_page',
      },
    })
    sent.value = true
    trackEvent('generate_lead', { form: 'contact_page', product: form.product || null })
    form.name = ''
    form.email = ''
    form.phone = ''
    form.company = ''
    form.country = ''
    form.product = ''
    form.volume = ''
    form.message = ''
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="ct-form antd-contact-form">
    <a-typography-title :level="4" class="ct-form__title">
      Send your enquiry
    </a-typography-title>
    <a-typography-paragraph class="ct-form__intro">
      Share your part numbers and target volumes — we reply with availability, pricing and full trade terms.
    </a-typography-paragraph>

    <a-form v-if="!sent" :model="form" layout="vertical" @finish="submit">
      <div class="ct-form__grid">
        <a-form-item
          label="Name"
          name="name"
          :rules="[{ required: true, message: 'Please enter your name.' }]"
        >
          <a-input v-model:value="form.name" autocomplete="name" placeholder="Your name" />
        </a-form-item>

        <a-form-item
          label="Business email"
          name="email"
          :rules="[
            { required: true, message: 'Please enter your email address.' },
            { type: 'email', message: 'Please enter a valid email address.' },
          ]"
        >
          <a-input v-model:value="form.email" type="email" autocomplete="email" placeholder="you@company.com" />
        </a-form-item>

        <a-form-item
          label="Company"
          name="company"
          :rules="[{ required: true, message: 'Please enter your company name.' }]"
        >
          <a-input v-model:value="form.company" autocomplete="organization" placeholder="Company or trading name" />
        </a-form-item>

        <a-form-item label="Country / target market" name="country">
          <a-input v-model:value="form.country" autocomplete="country-name" placeholder="e.g. Germany / DACH distributors" />
        </a-form-item>

        <a-form-item label="Phone / WhatsApp" name="phone">
          <a-input v-model:value="form.phone" type="tel" autocomplete="tel" placeholder="Include country code" />
        </a-form-item>

        <a-form-item label="Estimated volume" name="volume">
          <a-input v-model:value="form.volume" placeholder="e.g. 500 pcs trial, 5,000 pcs / year" />
        </a-form-item>

        <a-form-item class="ct-form__full" label="OE / part numbers" name="product">
          <a-input
            v-model:value="form.product"
            placeholder="OE number, factory number or cross reference — several are fine"
          />
        </a-form-item>

        <a-form-item
          class="ct-form__full"
          label="How can we help?"
          name="message"
          :rules="[{ required: true, message: 'Please tell us a little about your requirement.' }]"
        >
          <a-textarea
            v-model:value="form.message"
            :rows="4"
            :maxlength="3000"
            show-count
            placeholder="Vehicle applications, quality requirements, packing needs, certifications — anything that helps us quote accurately."
          />
        </a-form-item>
      </div>

      <a-alert
        v-if="error"
        class="ct-form__alert"
        type="error"
        show-icon
        :message="error"
      />

      <div class="ct-form__foot">
        <p>
          We use your details only to answer this enquiry. Prefer email?
          <a v-if="config.public.email" :href="`mailto:${config.public.email}`" style="text-decoration: underline">{{ config.public.email }}</a>
          <span v-else>Use this form and our export team will reply directly.</span>
        </p>
        <a-button html-type="submit" type="primary" size="large" :loading="sending">
          <template #icon><AppIcon name="mail" :size="16" /></template>
          Send enquiry
        </a-button>
      </div>
    </a-form>

    <div v-else class="ct-form__success">
      <a-alert type="success" show-icon message="Thanks — your enquiry is on its way.">
        <template #description>
          Our export team will come back to you with availability, pricing and full trade terms.
        </template>
      </a-alert>
      <a-button type="default" style="margin-top: 18px" @click="sent = false">
        Send another enquiry
      </a-button>
    </div>
  </div>
</template>
