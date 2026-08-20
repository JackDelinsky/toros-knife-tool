import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card-premium flex flex-col overflow-hidden rounded-sm"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-toros-black to-toros-charcoal">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(168,137,74,0.06),transparent_65%)]"
          aria-hidden="true"
        />
        <ProductImage
          product={product}
          fit="contain"
          className="product-card-image relative z-[1] h-full w-full"
          size="lg"
        />

        {!product.inStock && (
          <span className="absolute left-3 top-3 z-[2] rounded-sm border border-toros-steel-dark/80 bg-toros-black/90 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-toros-sand backdrop-blur-sm">
            Sold Out
          </span>
        )}
        {product.featured && product.inStock && (
          <span className="absolute left-3 top-3 z-[2] rounded-sm bg-toros-brass px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-toros-black">
            Featured
          </span>
        )}

        <div className="absolute inset-0 z-[2] flex items-end justify-center pb-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="rounded-sm border border-toros-brass/45 bg-toros-black/88 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-toros-parchment backdrop-blur-sm">
            View Blade
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-toros-border/80 bg-toros-elevated/90 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-toros-tan">
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.steel ? (
            <span className="text-[9px] uppercase tracking-[0.14em] text-toros-steel-dark">
              {product.steel}
            </span>
          ) : null}
        </div>
        <h3 className="font-display text-xl font-semibold leading-tight text-toros-parchment transition-colors group-hover:text-toros-brass-light sm:text-2xl">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-toros-steel sm:text-sm">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-toros-border/40 pt-3">
          <span className="text-lg font-bold tracking-tight text-toros-brass-light">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-toros-steel transition-colors group-hover:text-toros-brass">
            Shop →
          </span>
        </div>
      </div>
    </Link>
  );
}
