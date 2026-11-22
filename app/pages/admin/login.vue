<script setup lang="ts">
useSeoMeta({ title: '管理员登录' })
const username = ref('admin')
const password = ref('')
const pending = ref(false)
const errorMessage = ref('')

async function signIn() {
  if (pending.value) return
  pending.value = true
  errorMessage.value = ''
  try {
    await $fetch('/api/admin/auth/password', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await navigateTo('/admin/import')
  } catch (error: any) {
    const status = error?.data?.statusCode
    errorMessage.value = status === 401
      ? '用户名或密码错误。'
      : error?.data?.statusMessage || '登录失败，请稍后重试。'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <section class="login-card">
      <NuxtLink to="/" class="back-link">← VAKTRA</NuxtLink>
      <p class="eyebrow">CATALOG MANAGEMENT</p>
      <h1>管理员登录</h1>
      <p class="intro">输入管理员账号与密码进入产品目录管理后台。</p>
      <form @submit.prevent="signIn">
        <label>
          <span>用户名</span>
          <input v-model="username" type="text" autocomplete="username" required>
        </label>
        <label>
          <span>密码</span>
          <input v-model="password" type="password" autocomplete="current-password" required>
        </label>
        <button type="submit" :disabled="pending">
          {{ pending ? '正在登录…' : '登录' }}
        </button>
      </form>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p class="hint">登录会话通过安全 HttpOnly Cookie 保存，有效期 12 小时。</p>
    </section>
  </main>
</template>

<style scoped>
.login-page{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f3f4f5;color:#20262d;font-family:Arial,sans-serif}
.login-card{width:min(100%,460px);box-sizing:border-box;background:#fff;border:1px solid #e0e4e7;border-radius:14px;padding:32px}
.back-link{color:#68727c;text-decoration:none;font-size:13px}.eyebrow{margin:34px 0 8px;color:#d66b2d;font-size:11px;font-weight:700;letter-spacing:.16em}
h1{font-size:30px;margin:0 0 12px}.intro{color:#65707a;line-height:1.7;font-size:14px}
form{display:grid;gap:16px;margin:22px 0 0}
label{display:grid;gap:7px;font-size:13px;color:#4a545d}
input{width:100%;box-sizing:border-box;padding:12px 14px;border:1px solid #dfe3e6;border-radius:8px;font-size:14px;outline:none}
input:focus{border-color:#d76d32;box-shadow:0 0 0 3px rgba(215,109,50,.14)}
button{width:100%;padding:14px;border:0;border-radius:8px;background:#d76d32;color:#fff;font-weight:700;cursor:pointer;margin-top:4px}button:disabled{opacity:.6;cursor:wait}
.error{font-size:13px;line-height:1.6;margin:14px 0 0;color:#b33a2b}.hint{font-size:12px;color:#7b858e;line-height:1.6;margin:18px 0 0}
</style>
