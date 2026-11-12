declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

/**
 * Push an event onto the GTM dataLayer. Safe to call anywhere: on the server
 * it is a no-op, on the client it lazily creates the dataLayer so events
 * pushed before gtm.js loads are still delivered once it does.
 *
 * Events follow GA4's recommended naming (view_item, add_to_cart,
 * begin_checkout, generate_lead…) so Google Ads conversions can reuse the
 * GA4 key events without extra wiring.
 */
export function trackEvent(event: string, params: Record<string, unknown> = {}) {
  if (import.meta.client) {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event, ...params })
  }
}
