import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { ProductTrustBadges } from "@/components/product/ProductTrustBadges";
import { formatPrice } from "@/lib/products";
import type { ProductTrustBadge } from "@/lib/product-page";
import type { Product } from "@/types/product";

interface ProductBuyColumnProps {
  product: Product;
  categoryLabel: string;
  trustBadges: ProductTrustBadge[];
}

export function ProductBuyColumn({
  product,
  categoryLabel,
  trustBadges,
}: ProductBuyColumnProps) {
  return (
    <div className="product-buy">
      <p className="product-eyebrow">{categoryLabel}</p>
      <h1 className="product-title">{product.name}</h1>
      <p className="product-short-desc">{product.shortDescription}</p>

      <div className="product-price-row">
        <span className="product-price">{formatPrice(product.price)}</span>
        <span
          className={`product-stock${product.inStock ? " product-stock--in" : " product-stock--out"}`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <ProductPurchasePanel product={product} />

      <ProductTrustBadges badges={trustBadges} />

      {product.bestUses.length > 0 && (
        <ul className="product-uses" aria-label="Best uses">
          {product.bestUses.map((use) => (
            <li key={use} className="product-use-tag">{use}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
