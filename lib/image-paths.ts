import type { ProductCategory } from "@/types/product";

/** Base path for static images in public/images/ */
export const IMAGES_ROOT = "/images";

/** Brand / homepage images (public/images/brand/) */
export const BRAND_IMAGE_PATHS = {
  hero: `${IMAGES_ROOT}/brand/hero.png`,
  heroKnife: `${IMAGES_ROOT}/brand/hero-knife-cutout.png`,
  heroSecondary: `${IMAGES_ROOT}/categories/neck-knives.png`,
  logo: `${IMAGES_ROOT}/brand/logo.png`,
  heritage: `${IMAGES_ROOT}/brand/heritage.png`,
  maker: `${IMAGES_ROOT}/brand/maker.png`,
  collector: `${IMAGES_ROOT}/brand/collector.png`,
  email: `${IMAGES_ROOT}/brand/email.png`,
  mystery: `${IMAGES_ROOT}/brand/mystery.png`,
  jellybeanKnives: `${IMAGES_ROOT}/brand/jellybean-knives-transparent.png`,
  event: `${IMAGES_ROOT}/brand/event.png`,
  aboutBanner: `${IMAGES_ROOT}/brand/about/banner.jpg`,
  aboutBushcraft: `${IMAGES_ROOT}/brand/about/bushcraft.jpg`,
  aboutInternational: `${IMAGES_ROOT}/brand/about/international-connection.jpg`,
  aboutJellybeanDisplay: `${IMAGES_ROOT}/brand/about/jellybean-display.jpg`,
} as const;

export const MYSTERY_BAG_SLUG = "mystery-jellybean-knife-bag";

/** Isolated Jellybean knife cutouts (public/images/mystery/jellybean/) */
export const JELLYBEAN_IMAGE_PATHS = {
  red: `${IMAGES_ROOT}/mystery/jellybean/jellybean-red.png`,
  blue: `${IMAGES_ROOT}/mystery/jellybean/jellybean-blue.png`,
  green: `${IMAGES_ROOT}/mystery/jellybean/jellybean-green.png`,
  group: `${IMAGES_ROOT}/mystery/jellybean/jellybean-group.png`,
} as const;

/** Category card images (public/images/categories/) */
export const CATEGORY_IMAGE_PATHS: Record<ProductCategory, string> = {
  "fixed-blades": `${IMAGES_ROOT}/categories/fixed-blades.png`,
  "neck-knives": `${IMAGES_ROOT}/categories/neck-knives.png`,
  "folding-knives": `${IMAGES_ROOT}/categories/folding-knives.png`,
  "custom-knives": `${IMAGES_ROOT}/categories/custom-knives.png`,
  "axes-hatchets": `${IMAGES_ROOT}/categories/axes-hatchets.png`,
};

/** Primary product photo — public/images/products/{slug}/main.jpg */
export function productMainImage(slug: string): string {
  return `${IMAGES_ROOT}/products/${slug}/main.jpg`;
}

/** Flat export path — public/images/products/{slug}.jpg */
export function productFlatImage(slug: string): string {
  return `${IMAGES_ROOT}/products/${slug}.jpg`;
}

/** Gallery images — gallery-1.png, gallery-2.png, ... */
export function productGalleryImage(slug: string, index: number): string {
  return `${IMAGES_ROOT}/products/${slug}/gallery-${index}.png`;
}

/** Built for the Field — mapped to knife-type photos */
export const USE_CASE_IMAGE_PATHS: Record<string, string> = {
  Hunting: CATEGORY_IMAGE_PATHS["fixed-blades"],
  "Camping & Bushcraft": CATEGORY_IMAGE_PATHS["axes-hatchets"],
  "Everyday Carry": CATEGORY_IMAGE_PATHS["neck-knives"],
  Collecting: CATEGORY_IMAGE_PATHS["custom-knives"],
  Gifting: CATEGORY_IMAGE_PATHS["folding-knives"],
};
