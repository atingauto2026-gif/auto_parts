export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
    await $fetch('/api/admin/auth/me', { headers, credentials: 'include' })
  } catch {
    return navigateTo({ path: '/admin/login', query: { next: to.fullPath } })
  }
})
