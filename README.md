# RoadReady Auto

Nuxt 4 + Vue 3 storefront with a Supabase PostgreSQL backend.

## Supabase backend setup

The Shopify backend has been replaced with Supabase Postgres. Product/category reads, visitor carts and enquiry submissions are served by Nuxt Nitro routes and the Supabase REST Data API.

### Required server-only environment variables

Set these in local `.env` and Cloudflare Pages **Secrets** (not public build variables):

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

For legacy projects, `SUPABASE_SERVICE_ROLE_KEY` is accepted as a fallback. Never use a secret/service-role key in `NUXT_PUBLIC_*`, client code, source control, or browser-exposed variables.

Project ref: `npxpxlosubxgkgsbyfnv`.

### Database

The migration `replace_shopify_with_supabase_storefront` creates `categories`, `products`, `product_variants`, `carts`, `cart_items` and `leads`. It seeds six categories, eight demonstration products and eight variants. Prices are demonstration AUD values; replace them with approved catalog data before taking real orders.

All tables have RLS enabled and no public/anon/authenticated table grants or policies. Server routes use the private Supabase secret key. Do not expose that key to the browser.

### API compatibility

- `GET /api/products`
- `GET /api/products/:handle`
- `GET /api/categories`
- `GET /api/cart`
- `POST /api/cart/lines`
- `PATCH /api/cart/lines`
- `DELETE /api/cart/lines?lineId=...`
- `POST /api/contact`

Cart IDs are stored in an HttpOnly, SameSite=Lax cookie. Checkout remains disabled until a payment provider and order workflow are implemented.

### Deploy

1. Add the two server-only variables to Cloudflare Pages project settings.
2. Deploy the `main` branch after the Supabase migration is merged.
3. Verify product/category pages, cart operations and contact submissions on the deployed preview.
4. Replace demonstration catalog records, images and AUD prices with verified inventory and pricing.

The Supabase database migration has already been applied to the linked project. Repository changes do not deploy Cloudflare automatically.
