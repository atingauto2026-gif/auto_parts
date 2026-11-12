<script setup lang="ts">
const config = useRuntimeConfig()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  company: '',
  product: '',
  message: '',
})

const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  sending.value = true
  try {
    await $fetch('/api/contact', { method: 'POST', body: { ...form, leadType: 'contact_page' } })
    sent.value = true
    trackEvent('generate_lead', { form: 'contact_page', product: form.product || null })
    form.name = ''
    form.email = ''
    form.phone = ''
    form.company = ''
    form.product = ''
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
      Send us a message
    </a-typography-title>
    <a-typography-paragraph class="ct-form__intro">
      Tell us what you drive and what you are looking for. Our team will be in touch.
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
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Please enter your email address.' },
            { type: 'email', message: 'Please enter a valid email address.' },
          ]"
        >
          <a-input v-model:value="form.email" type="email" autocomplete="email" placeholder="you@company.com" />
        </a-form-item>

        <a-form-item label="Phone" name="phone">
          <a-input v-model:value="form.phone" type="tel" autocomplete="tel" placeholder="Your phone number" />
        </a-form-item>

        <a-form-item label="Company" name="company">
          <a-input v-model:value="form.company" autocomplete="organization" placeholder="Company name" />
        </a-form-item>

        <a-form-item class="ct-form__full" label="Product interest" name="product">
          <a-input
            v-model:value="form.product"
            placeholder="e.g. vehicle make/model/year or the part you need"
          />
        </a-form-item>

        <a-form-item
          class="ct-form__full"
          label="How can we help?"
          name="message"
          :rules="[{ required: true, message: 'Please tell us a little about your project.' }]"
        >
          <a-textarea
            v-model:value="form.message"
            :rows="4"
            :maxlength="3000"
            show-count
            placeholder="Include your vehicle details, the part you’re considering and any questions."
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
          <a :href="`mailto:${config.public.email}`" style="text-decoration: underline">{{ config.public.email }}</a>
        </p>
        <a-button html-type="submit" type="primary" size="large" :loading="sending">
          <template #icon><AppIcon name="mail" :size="16" /></template>
          Send message
        </a-button>
      </div>
    </a-form>

    <div v-else class="ct-form__success">
      <a-alert type="success" show-icon message="Thanks — your message is on its way.">
        <template #description>
          We’ll review your question and get back to you as soon as we can.
        </template>
      </a-alert>
      <a-button type="default" style="margin-top: 18px" @click="sent = false">
        Send another message
      </a-button>
    </div>
  </div>
</template>
