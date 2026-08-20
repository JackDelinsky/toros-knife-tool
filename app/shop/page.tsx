import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/Header";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getShopProducts, getProductsByCategory, getProductsByTag } from "@/lib/products";
import { MYSTERY_BAG_SLUG } from "@/lib/image-paths";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_LABELS,
  type ProductCategory,
} from "@/types/product";

export const metadata: Metadata = {
  title: "Shop All Knives",
  description:
    "Browse handcrafted fixed blades, neck knives, folding knives, custom commissions, and axes from Toros Knife & Tool.",
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

  const pageTitle = tagParam === "misty"
    ? "Misty Series"
    : category
      ? CATEGORY_LABELS[category]
      : "Shop All Knives";

  const pageDescription = tagParam === "misty"
    ? "In-house Misty Series blades designed and forged by Aydin — raw utility, rebar craft, and compact puukko-inspired builds."
    : category
      ? CATEGORY_DESCRIPTIONS[category]
      : "Every Toros blade is hand-finished in our workshop, built for hunters, campers, collectors, and those who value craft.";

  return (
    <div className="page-container section-pad-sm">
      <SectionHeader
        eyebrow="Shop"
        title={pageTitle}
        description={pageDescription}
        size="large"
      />

      <div className="mt-10 border-y border-toros-border/50 py-6">
        <CategoryNav active={category} />
      </div>

      <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-toros-steel">
        {products.length} {products.length === 1 ? "blade" : "blades"}
      </p>

      {products.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-sm border border-toros-border bg-toros-surface/50 p-12 text-center">
          <p className="text-toros-sand/70">No products in this category yet.</p>
        </div>
      )}
    </div>
  );
}
