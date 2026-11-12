# RoadReady Auto

An auto parts and accessories storefront built with Nuxt 4, Vue 3 and Shopify's Storefront API.

## Run locally

```sh
npm install
npm run dev
```

Without Shopify credentials, the app uses a bundled preview catalog with illustrative products and prices. Checkout is disabled in preview mode. Add a Shopify Storefront API token to `.env` to load a live catalog and enable Shopify checkout:

```ini
NUXT_SHOPIFY_DOMAIN=your-store.myshopify.com
NUXT_SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
NUXT_PUBLIC_SITE_URL=https://your-store.example
NUXT_PUBLIC_STORE_DOMAIN=your-store.myshopify.com
```

Configure the public support email, phone and WhatsApp values in `nuxt.config.ts` before launch. The bundled catalog uses remote Unsplash demo photography; replace it with approved product imagery for production.

## Deploy with GitHub Actions

Create a Cloudflare Pages project named `roadready-auto` with `main` as its production branch. In the GitHub repository, add these Actions secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN` — an API token with Cloudflare Pages edit access.
- `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account ID.

The workflow at `.github/workflows/deploy-cloudflare-pages.yml` builds Nuxt with the `cloudflare_pages` Nitro preset and deploys `dist/` on every push to `main`. You can also start it manually from the repository’s **Actions** tab.

Set the app’s production runtime variables and secrets in the Cloudflare Pages project under **Settings → Variables and Secrets**. Keep Shopify Admin/Storefront tokens there as secrets; do not put them in GitHub workflow files. `NUXT_SHOPIFY_DOMAIN`, `NUXT_SHOPIFY_STOREFRONT_TOKEN`, `NUXT_SHOPIFY_ADMIN_CLIENT_ID`, and `NUXT_SHOPIFY_ADMIN_CLIENT_SECRET` are needed for live Shopify catalog, checkout, and contact lead capture. Set the `NUXT_PUBLIC_*` values for the site URL, support contact details, account domain, and analytics as needed.

## Checks

```sh
npm run typecheck
npm run build
```
