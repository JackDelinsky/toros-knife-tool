import type { Product, ProductCategory } from "@/types/product";
import { CATEGORY_LABELS } from "@/types/product";

/**
 * The shop's filters, derived entirely from the catalogue.
 *
 * Every option here is computed from values the product records actually
 * carry, and an option with nothing behind it is never offered. There is no
 * colour, rating, review, popularity or best-seller filter, because the
 * catalogue holds no such data and a control that sorts by nothing is worse
 * than no control.
 */

export type SortKey = "catalogue" | "price-asc" | "price-desc" | "name";

export const SORTS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: "catalogue", label: "Catalogue order" },
  { key: "price-asc", label: "Price, low to high" },
  { key: "price-desc", label: "Price, high to low" },
  { key: "name", label: "Name, A–Z" },
];

/**
 * Handle materials, grouped into families.
 *
 * The records are free text written by hand: "Walnut" and "Turkish Walnut" are
 * the same wood, and "Antler", "Deer Antler" and "Antler and brass bolster"
 * are all antler. Offering sixteen filters for eighteen knives would filter
 * nothing, so the stated values are grouped by keyword. This classifies what
 * the record says; it never adds a material the record does not mention, and
 * the product page always shows the record's own wording.
 */
const HANDLE_FAMILIES: ReadonlyArray<{ family: string; match: RegExp }> = [
  { family: "Antler", match: /antler/i },
  { family: "Horn", match: /\bhorn\b/i },
  { family: "Micarta", match: /micarta/i },
  { family: "Walnut", match: /walnut/i },
  { family: "Burl", match: /burl/i },
  { family: "Leather", match: /leather/i },
  { family: "Rebar", match: /rebar/i },
  { family: "Stabilized resin", match: /epoxy|resin|stabilized/i },
  { family: "Composite", match: /composite/i },
];

export function handleFamily(product: Product): string | undefined {
  return HANDLE_FAMILIES.find((f) => f.match.test(product.handleMaterial))?.family;
}

/** A steel that names an actual steel. "Varies by series" is not one. */
export function steelName(product: Product): string | undefined {
  const value = product.steel?.trim();
  if (!value || /^varies/i.test(value)) return undefined;
  return value;
}

export interface FilterState {
  category?: ProductCategory;
  steel?: string;
  handle?: string;
  inStockOnly: boolean;
  maxPrice?: number;
  tag?: string;
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = { inStockOnly: false, sort: "catalogue" };

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterOptions {
  categories: FilterOption[];
  steels: FilterOption[];
  handles: FilterOption[];
  /** Price ceilings offered, rounded up from the catalogue's own spread. */
  prices: FilterOption[];
  outOfStock: number;
}

function tally(
  products: Product[],
  key: (p: Product) => string | undefined,
  label: (value: string) => string = (v) => v,
): FilterOption[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const value = key(p);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([value, count]) => ({ value, label: label(value), count }));
}

export function buildFilterOptions(products: Product[]): FilterOptions {
  const prices = products.map((p) => p.price).sort((a, b) => a - b);
  const ceilings: number[] = [];
  if (prices.length > 1) {
    // Three ceilings drawn from where the catalogue's own prices actually sit,
    // rather than round numbers that might select everything or nothing.
    for (const q of [0.33, 0.66]) {
      const at = prices[Math.floor((prices.length - 1) * q)];
      const rounded = Math.ceil(at / 25) * 25;
      if (!ceilings.includes(rounded) && rounded < prices[prices.length - 1]) {
        ceilings.push(rounded);
      }
    }
  }

  return {
    categories: tally(
      products,
      (p) => p.category,
      (v) => CATEGORY_LABELS[v as ProductCategory],
    ),
    steels: tally(products, steelName),
    handles: tally(products, handleFamily),
    prices: ceilings.map((c) => ({
      value: String(c),
      label: `Under $${c}`,
      count: products.filter((p) => p.price <= c).length,
    })),
    outOfStock: products.filter((p) => !p.inStock).length,
  };
}

export function applyFilters(products: Product[], filters: FilterState): Product[] {
  const filtered = products.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.tag && !p.tags.includes(filters.tag)) return false;
    if (filters.steel && steelName(p) !== filters.steel) return false;
    if (filters.handle && handleFamily(p) !== filters.handle) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (filters.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

/** How many filters the visitor has actually applied — sort is not one. */
export function activeCount(filters: FilterState): number {
  return (
    (filters.category ? 1 : 0) +
    (filters.steel ? 1 : 0) +
    (filters.handle ? 1 : 0) +
    (filters.tag ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0)
  );
}

/** Reads the filter state out of the URL, ignoring anything unrecognised. */
export function filtersFromParams(
  params: Record<string, string | string[] | undefined>,
  valid: FilterOptions,
): FilterState {
  const one = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };
  const category = one("category");
  const steel = one("steel");
  const handle = one("handle");
  const price = one("price");
  const sort = one("sort");
  const maxPrice = price !== undefined && /^\d+$/.test(price) ? Number(price) : undefined;

  return {
    category: valid.categories.some((c) => c.value === category)
      ? (category as ProductCategory)
      : undefined,
    steel: valid.steels.some((s) => s.value === steel) ? steel : undefined,
    handle: valid.handles.some((h) => h.value === handle) ? handle : undefined,
    tag: one("tag")?.toLowerCase(),
    inStockOnly: one("availability") === "in-stock",
    maxPrice,
    sort: SORTS.some((s) => s.key === sort) ? (sort as SortKey) : "catalogue",
  };
}
