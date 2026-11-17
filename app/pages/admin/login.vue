<script setup lang="ts">
useSeoMeta({ title: '管理员登录' })
const pending = ref(false)
const sent = ref(false)
const errorMessage = ref('')

async function sendLink() {
  if (pending.value) return
  pending.value = true
  sent.value = false
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/auth/request', {
      method: 'POST',
      body: { email: 'atingauto2026@gmail.com' },
    })
    sent.value = true
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || '登录邮件发送失败，请稍后重试。'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <NuxtLink to="/" class="back-link">← RoadReady Auto</NuxtLink>
      <p class="eyebrow">CATALOG MANAGEMENT</p>
      <h1>管理员登录</h1>
      <p class="intro">登录链接将发送到已授权的管理员邮箱。请在同一浏览器中打开邮件链接。</p>
      <div class="email">{{ 'atingauto2026@gmail.com' }}</div>
      <button :disabled="pending" @click="sendLink">
        {{ pending ? '正在发送…' : '发送安全登录链接' }}
      </button>
      <p v-if="sent" class="success">登录邮件已发送，请检查收件箱和垃圾邮件文件夹。</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p class="hint">仅此邮箱具有后台管理权限。登录会话通过安全 HttpOnly Cookie 保存。</p>
    </section>
  </main>
</template>

<style scoped>
.login-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f3f4f5;color:#20262d;font-family:Arial,sans-serif}
.login-card{width:min(100%,460px);box-sizing:border-box;background:#fff;border:1px solid #e0e4e7;border-radius:14px;padding:32px}
.back-link{color:#68727c;text-decoration:none;font-size:13px}.eyebrow{margin:34px 0 8px;color:#d66b2d;font-size:11px;font-weight:700;letter-spacing:.16em}
h1{font-size:30px;margin:0 0 12px}.intro{color:#65707a;line-height:1.7;font-size:14px}
.email{padding:13px 14px;border:1px solid #e0e4e7;border-radius:8px;background:#f8f9fa;margin:22px 0;font-size:14px}
button{width:100%;padding:14px;border:0;border-radius:8px;background:#d76d32;color:#fff;font-weight:700;cursor:pointer}button:disabled{opacity:.6;cursor:wait}
.success,.error{font-size:13px;line-height:1.6;margin:14px 0 0}.success{color:#267348}.error{color:#b33a2b}.hint{font-size:12px;color:#7b858e;line-height:1.6;margin:18px 0 0}
</style>
