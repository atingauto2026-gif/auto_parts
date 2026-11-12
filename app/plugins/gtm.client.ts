/**
 * Google Tag Manager loader (client only).
 *
 * - Injects the gtm.js script via useHead once a container id is configured
 *   (NUXT_PUBLIC_GTM_ID). An empty id disables everything, so the same build
 *   works with tracking on or off.
 * - GA4's config tag sends the automatic page_view for the initial load; this
 *   plugin only pushes page_view on subsequent SPA navigations to avoid
 *   double counting.
 */
export default defineNuxtPlugin(() => {
  const gtmId = useRuntimeConfig().public.gtmId
  if (!gtmId) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
        async: true,
        // Load after first paint — analytics must not delay LCP.
        tagPriority: 'low',
      },
    ],
  })

  const router = useRouter()
  let initialNavigation = true

  router.afterEach((to) => {
    if (initialNavigation) {
      initialNavigation = false
      return
    }
    trackEvent('page_view', {
      page_path: to.fullPath,
      page_title: document.title,
      page_location: window.location.origin + to.fullPath,
    })
  })
})
