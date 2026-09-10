import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ShopToolbar } from "@/components/shop/ShopToolbar";
import { QuickInspectProvider } from "@/components/product/QuickInspectProvider";
import { getShopProducts } from "@/lib/products";
import { applyFilters, buildFilterOptions, filtersFromParams } from "@/lib/shop-filters";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "@/types/product";

export const metadata: Metadata = {
  title: "Shop all knives",
  description:
    "Browse handcrafted fixed blades, neck knives, folding knives and custom commissions from Toros Knife & Tool.",
};

interface ShopPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The catalogue.
 *
 * Eighteen knives is a small shop, so the page leads with the knives rather
 * than a hero: a title, a line, the controls, the grid. Filters live in the
 * query string and the grid is rendered from them on the server, which is why
 * a filtered view can be linked and why Back works.
 */
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const all = getShopProducts();
  const options = buildFilterOptions(all);
  const filters = filtersFromParams(params, options);
  const products = applyFilters(all, filters);

  const title =
    filters.tag === "misty"
      ? "Misty Series"
      : filters.category
        ? CATEGORY_LABELS[filters.category]
        : "Every blade";

  const description =
    filters.tag === "misty"
      ? "In-house Misty Series blades, designed and forged by Aydin — raw utility, rebar craft and compact puukko-inspired builds."
      : filters.category
        ? CATEGORY_DESCRIPTIONS[filters.category]
        : "Every Toros blade is hand-finished in the workshop, for hunters, campers, collectors and anyone who values the craft.";

  return (
    <QuickInspectProvider products={all}>
      <div className="catalog">
        <div className="page-container">
          <header className="catalog-head">
            <h1 className="t-h1">{title}</h1>
            <p className="t-lead catalog-lead">{description}</p>
          </header>

          <div className="catalog-bar">
            <CategoryNav active={filters.category} />
          </div>

          {/* useSearchParams needs a boundary; the toolbar is the only part of
              this page that reads the URL on the client. */}
          <Suspense fallback={null}>
            <ShopToolbar options={options} filters={filters} resultCount={products.length} />
          </Suspense>

          {products.length > 0 ? (
            <div className="catalog-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="catalog-empty">
              Nothing matches those filters. Clear one and there will be more.
            </p>
          )}
        </div>
      </div>
    </QuickInspectProvider>
  );
}
