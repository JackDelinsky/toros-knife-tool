# Toros Knife & Tool

Premium e-commerce storefront for **Toros Knife & Tool** — handcrafted Turkish-inspired blades built for American outdoor adventure.

> *"Toros Knife & Tool bridges centuries-old Turkish bladesmithing with the spirit of American outdoor adventure."*

## Screenshots

| Home | Shop |
| --- | --- |
| ![Homepage hero](docs/media/home-hero.png) | ![Shop page](docs/media/shop.png) |

| Product detail |
| --- |
| ![Product detail page](docs/media/product-detail.png) |

**Hero parallax + hover interaction:**

![Hero parallax and hover animation](docs/media/hero-animation.gif)

## Phase 1 (Current)

- Dark premium aesthetic with tan/gold accents
- Mobile-first responsive layout
- Homepage with hero, categories, featured products, heritage, maker story, use cases, collector club, email capture
- Shop page with category filtering
- Product detail pages with specs, craftsmanship, care, shipping, and trust sections
- Local product data (`data/products.ts`)
- Placeholder product imagery (ready for real photos)

**Not included in Phase 1:** Knife Finder quiz, 360 viewer, event landing pages, email backend, live checkout.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- React 19 + TypeScript
- Tailwind CSS v4

## Getting Started

```bash
cd toros-knife-tool
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # serve production build
```

## Project Structure

```
toros-knife-tool/
├── app/
│   ├── layout.tsx          # Root layout, fonts, header/footer
│   ├── page.tsx            # Homepage
│   ├── shop/page.tsx       # Shop + category filter
│   └── products/[slug]/    # Product detail (static generation)
├── components/
│   ├── Header.tsx          # Navigation + mobile menu
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ProductGallery.tsx
│   ├── ProductImage.tsx    # Real image or placeholder fallback
│   ├── AddToCartButton.tsx # Checkout URL or placeholder CTA
│   ├── home/               # Homepage sections
│   └── ui/                 # Button, SectionHeader
├── data/products.ts        # Product catalog (edit here)
├── lib/products.ts         # Data access helpers
└── types/product.ts        # TypeScript product model
```

## Replacing Placeholder Product Data

### 1. Edit product entries

Open `data/products.ts`. Each product supports:

| Field | Description |
|-------|-------------|
| `name`, `slug`, `category`, `price` | Core listing info |
| `shortDescription`, `longDescription` | Card + detail copy |
| `images` | Array of image paths, e.g. `["/products/anatolian-hunter-1.jpg"]` |
| `spinImages` | Reserved for Phase 2 360 viewer |
| `steel`, `handleMaterial`, `bladeLength`, `totalLength` | Specs table |
| `bestUses`, `tags` | Use-case badges |
| `inStock`, `featured`, `customAvailable` | Availability flags |
| `checkoutUrl` | External checkout link (Shopify, Stripe, etc.) |
| `craftsmanshipStory`, `careInstructions` | Detail page content |

Example with real images:

```ts
withDefaults({
  slug: "anatolian-hunter",
  // ...
  images: [
    "/products/anatolian-hunter/front.jpg",
    "/products/anatolian-hunter/profile.jpg",
    "/products/anatolian-hunter/sheath.jpg",
  ],
  checkoutUrl: "https://your-store.myshopify.com/cart/VARIANT_ID:1",
}),
```

### 2. Add product photos

Place files in `public/products/` matching the paths in `images[]`. The `ProductImage` component automatically uses placeholders when `images` is empty.

Recommended specs:
- **Hero / primary:** 1600×2000px (4:5 aspect)
- **Gallery thumbs:** 800×800px minimum
- Format: WebP or JPEG, optimized for web

### 3. Add or remove products

Add new `withDefaults({ ... })` entries to the `products` array. Slugs must be unique URL-safe strings. Product pages are statically generated from all slugs in the catalog.

## Connecting Checkout

Do **not** build custom payment processing. Use one of these approaches:

### Option A: Shopify Buy Button / checkout URL (simplest)

1. Create products in Shopify Admin.
2. Copy each product or variant checkout/cart URL.
3. Set `checkoutUrl` on each item in `data/products.ts`.
4. `AddToCartButton` renders a "Buy Now — Secure Checkout" link automatically.

### Option B: Shopify Storefront API (scalable)

1. Create a Shopify custom app with Storefront API access.
2. Add env vars: `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_ACCESS_TOKEN`.
3. Replace `data/products.ts` reads with Storefront API queries (products, variants, inventory).
4. Use Shopify Cart API or redirect to hosted checkout.

### Option C: Stripe Checkout

1. Create Stripe Products and Prices in the Stripe Dashboard.
2. Generate Payment Links or Checkout Session URLs per product.
3. Set `checkoutUrl` to each Stripe Payment Link.
4. For dynamic carts, add a Next.js API route that creates Checkout Sessions server-side.

## Brand Colors

Defined in `app/globals.css`:

- **Charcoal** `#0c0b0a` — background
- **Gold** `#c9a227` — primary accent
- **Tan** `#a89070` — secondary text
- **Red** `#8b2635` — sparing accent (out of stock, etc.)

## Phase 2 Roadmap

- Knife Finder quiz (`KnifeFinderQuiz`)
- 360 spin viewer (`Knife360Viewer`) when `spinImages` exist
- Event/show QR landing page
- Contact, custom inquiry, and newsletter form backends
- About, Craftsmanship, Privacy, and Terms pages
- Live Shopify or Supabase sync

## License

Private — Toros Knife & Tool.
