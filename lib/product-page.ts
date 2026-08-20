import type { Product, ProductSpecRow } from "@/types/product";
import { CATEGORY_KNIFE_TYPES, CATEGORY_LABELS } from "@/types/product";

export interface ProductTrustBadge {
  label: string;
}

export function buildProductSpecs(product: Product): ProductSpecRow[] {
  if (product.specRows?.length) {
    return product.specRows;
  }

  const rows: ProductSpecRow[] = [
    { label: "Knife Type", value: CATEGORY_KNIFE_TYPES[product.category] },
    { label: "Blade Material", value: product.steel },
    { label: "Handle Material", value: product.handleMaterial },
    { label: "Blade Length", value: product.bladeLength },
    { label: "Overall Length", value: product.totalLength },
  ];

  if (product.weight) {
    rows.push({ label: "Weight", value: product.weight });
  }

  if (product.sheath) {
    rows.push({ label: "Sheath", value: product.sheath });
  }

  if (product.madeIn) {
    rows.push({ label: "Made In", value: product.madeIn });
  }

  if (product.warranty) {
    rows.push({ label: "Warranty", value: product.warranty });
  }

  return rows;
}

export function getProductStory(product: Product): string {
  return product.craftsmanshipBlurb ?? product.craftsmanshipStory;
}

export function getTrustBadges(product: Product): ProductTrustBadge[] {
  const badges: ProductTrustBadge[] = [
    { label: "Hand-finished" },
    { label: "Small batch" },
    { label: "Ships from Georgia" },
  ];

  const madeIn =
    product.madeIn ??
    (product.tags.includes("bos") || product.tags.includes("gur")
      ? "Türkiye"
      : product.tags.includes("usa-made")
        ? "United States"
        : undefined);

  if (madeIn === "Türkiye" || madeIn === "Turkey") {
    badges.push({ label: "Made in Türkiye" });
  }

  return badges;
}

export function getCategoryEyebrow(product: Product): string {
  return CATEGORY_LABELS[product.category];
}
