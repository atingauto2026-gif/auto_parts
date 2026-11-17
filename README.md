# RoadReady Auto

Nuxt 4 + Vue 3 storefront with a Supabase PostgreSQL backend.

## Supabase backend setup

The Shopify backend has been replaced with Supabase Postgres. Product/category reads and enquiry submissions are served by Nuxt Nitro routes and the Supabase REST Data API. The storefront is a catalogue and quote-request experience; cart and checkout UI are disabled.

### Required server-only environment variables

Set these in local `.env` and Cloudflare Pages **Secrets** (not public build variables):

```dotenv
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```

For legacy projects, `SUPABASE_SERVICE_ROLE_KEY` is accepted as a fallback. Never use a secret/service-role key in `NUXT_PUBLIC_*`, client code, source control, or browser-exposed variables.

Project ref: `npxpxlosubxgkgsbyfnv`.

### Database

The migration `replace_shopify_with_supabase_storefront` creates `categories`, `products`, `product_variants`, `carts`, `cart_items` and `leads`. The public catalogue uses six specialist categories: Coolant Temperature Sensor, Temperature Control Switch, Reverse Light Switch, Solenoid Valve, Oil Pressure Alarm and Tire Pressure Sensor. Original demo products are unpublished; publish approved inventory with verified fitment data before launch.

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

Legacy cart tables and API handlers remain in the database/codebase for backwards compatibility, but are not exposed in the storefront UI.

### Deploy

1. Add the two server-only variables to Cloudflare Pages project settings.
2. Deploy the `main` branch after the Supabase migration is merged.
3. Verify product/category pages, quote/contact submissions and responsive layouts on the deployed preview.
4. Publish approved product records, images, fitment references and quote details.

The Supabase database migration has already been applied to the linked project. Repository changes do not deploy Cloudflare automatically.
