import { getShopProducts } from "@/lib/products";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS, type Product, type ProductCategory } from "@/types/product";

/**
 * The rail's order, and the single mapping between a category and everything
 * shown about it. Counts and product lists are computed from the catalogue —
 * never written down here — so a category can't advertise more than it has.
 */
const RAIL_ORDER: ProductCategory[] = [
  "fixed-blades",
  "custom-knives",
  "folding-knives",
  "neck-knives",
];

export interface RailCategory {
  category: ProductCategory;
  label: string;
  description: string;
  count: number;
  href: string;
  products: Product[];
}

export function getRailCategories(): RailCategory[] {
  const products = getShopProducts();

  return RAIL_ORDER.map((category) => {
    const owned = products.filter((p) => p.category === category);
    return {
      category,
      label: CATEGORY_LABELS[category],
      description: CATEGORY_DESCRIPTIONS[category],
      count: owned.length,
      href: `/shop?category=${category}`,
      products: owned,
    };
    // A category with nothing in it would be a dead selector, so it is dropped
    // rather than shown empty — the catalogue has no axes today.
  }).filter((entry) => entry.count > 0);
}
