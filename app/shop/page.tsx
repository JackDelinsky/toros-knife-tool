import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { getShopProducts, getProductsByCategory, getProductsByTag } from "@/lib/products";
import { MYSTERY_BAG_SLUG } from "@/lib/image-paths";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/types/product";

export const metadata: Metadata = {
  title: "Shop all knives",
  description:
    "Browse handcrafted fixed blades, neck knives, folding knives and custom commissions from Toros Knife & Tool.",
};

const VALID_CATEGORIES = new Set<string>([
  "fixed-blades",
  "neck-knives",
  "folding-knives",
  "custom-knives",
  "axes-hatchets",
]);

interface ShopPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const categoryParam = params.category;
  const tagParam = params.tag?.trim().toLowerCase();
  const category =
    categoryParam && VALID_CATEGORIES.has(categoryParam)
      ? (categoryParam as ProductCategory)
      : undefined;

  const products = tagParam
    ? getProductsByTag(tagParam)
    : category
      ? getProductsByCategory(category).filter((p) => p.slug !== MYSTERY_BAG_SLUG)
      : getShopProducts();

  const title =
    tagParam === "misty" ? "Misty Series" : category ? CATEGORY_LABELS[category] : "Every blade";

  const description =
    tagParam === "misty"
      ? "In-house Misty Series blades, designed and forged by Aydin — raw utility, rebar craft and compact puukko-inspired builds."
      : category
        ? CATEGORY_DESCRIPTIONS[category]
        : "Every Toros blade is hand-finished in the workshop, for hunters, campers, collectors and anyone who values the craft.";

  return (
    <div className="catalog">
      <div className="page-container">
        <header className="catalog-head">
          <h1 className="t-h1">{title}</h1>
          <p className="t-lead catalog-lead">{description}</p>
        </header>

        <div className="catalog-bar">
          <CategoryNav active={category} />
          <p className="catalog-count">
            {products.length} {products.length === 1 ? "blade" : "blades"}
          </p>
        </div>

        {products.length > 0 ? (
          <div className="catalog-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="catalog-empty">Nothing in this category yet.</p>
        )}
      </div>
    </div>
  );
}
