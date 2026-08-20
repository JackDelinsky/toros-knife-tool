import Link from "next/link";
import { BrandImage } from "@/components/BrandImage";
import { GeometricBorder } from "@/components/ui/GeometricAccents";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CATEGORY_IMAGES } from "@/lib/brand-images";
import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "@/types/product";
import type { ProductCategory } from "@/types/product";

const CATEGORIES: ProductCategory[] = [
  "fixed-blades",
  "neck-knives",
  "folding-knives",
  "custom-knives",
  "axes-hatchets",
];

export function CategoryCards() {
  return (
    <section className="section-pad border-t border-toros-border bg-toros-charcoal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The Collection"
          title="Explore the Collection"
          description="Field knives, carry folders, collector pieces, and camp axes. Each category built for a different kind of work."
        />

        <GeometricBorder className="mt-6 mb-8 opacity-40" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category, index) => (
            <Link
              key={category}
              href={`/shop?category=${category}`}
              className={`group card-premium overflow-hidden rounded-sm ${
                index === 0 ? "sm:col-span-2 lg:col-span-2" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  index === 0 ? "aspect-[21/9] sm:aspect-[2.4/1]" : "aspect-[16/10]"
                }`}
              >
                <BrandImage
                  src={CATEGORY_IMAGES[category]}
                  alt={CATEGORY_LABELS[category]}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  overlay="card"
                  sizes={index === 0 ? "100vw" : "50vw"}
                />
              </div>
              <div className="border-t border-toros-border/60 bg-toros-elevated/90 p-4 sm:p-5">
                <h3 className="font-display text-lg font-semibold text-toros-parchment transition-colors group-hover:text-toros-brass-light sm:text-xl">
                  {CATEGORY_LABELS[category]}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-toros-steel sm:text-sm line-clamp-2">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
                <span className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.2em] text-toros-brass">
                  Shop Collection →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
