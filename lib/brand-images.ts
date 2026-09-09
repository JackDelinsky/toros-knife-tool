import type { ProductCategory } from "@/types/product";
import {
  BRAND_IMAGE_PATHS,
  CATEGORY_IMAGE_PATHS,
  JELLYBEAN_IMAGE_PATHS,
  USE_CASE_IMAGE_PATHS,
  productCardImage,
  productMainImage,
} from "@/lib/image-paths";

/** Homepage & section photography — local assets in public/images/ */
export const BRAND_IMAGES = {
  hero: BRAND_IMAGE_PATHS.hero,
  logo: BRAND_IMAGE_PATHS.logo,
  heritage: BRAND_IMAGE_PATHS.heritage,
  maker: BRAND_IMAGE_PATHS.aboutInternational,
  collector: BRAND_IMAGE_PATHS.collector,
  email: BRAND_IMAGE_PATHS.email,
  mystery: BRAND_IMAGE_PATHS.mystery,
  jellybeanKnives: BRAND_IMAGE_PATHS.jellybeanKnives,
  jellybeanGroup: JELLYBEAN_IMAGE_PATHS.group,
  event: BRAND_IMAGE_PATHS.event,
  aboutBanner: BRAND_IMAGE_PATHS.aboutBanner,
  aboutBushcraft: BRAND_IMAGE_PATHS.aboutBushcraft,
  aboutInternational: BRAND_IMAGE_PATHS.aboutInternational,
  aboutJellybeanDisplay: BRAND_IMAGE_PATHS.aboutJellybeanDisplay,
} as const;

export const CATEGORY_IMAGES = CATEGORY_IMAGE_PATHS;

export const USE_CASE_IMAGES = USE_CASE_IMAGE_PATHS;

/** Full-resolution photograph, for the product page's media stage. */
export function resolveProductImage(
  slug: string,
  _category: ProductCategory,
  images: string[],
  index = 0,
): string {
  return images[index] ?? productMainImage(slug);
}

/**
 * The consistently-framed derivative, for anywhere a product appears in a
 * grid or list. Products that ship an explicit image (the mystery bag uses a
 * group shot rather than a single knife) keep it.
 */
export function resolveProductCardImage(slug: string, images: string[]): string {
  const explicit = images[0];
  if (explicit && !explicit.startsWith(`/images/products/${slug}/`)) return explicit;
  return productCardImage(slug);
}
