import { Button } from "@/components/ui/Button";
import { MYSTERY_BAG_SLUG } from "@/lib/image-paths";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
}

export function AddToCartButton({
  product,
  quantity = 1,
  className = "",
}: AddToCartButtonProps) {
  const combinedClass = `product-cta-btn ${className}`.trim();

  if (product.checkoutUrl && product.inStock) {
    return (
      <Button
        href={product.checkoutUrl}
        variant="secondary"
        size="lg"
        className={combinedClass}
        target="_blank"
        rel="noopener noreferrer"
      >
        Buy Now · Secure Checkout
      </Button>
    );
  }

  if (product.customAvailable && product.inStock) {
    return (
      <Button variant="secondary" size="lg" className={combinedClass} disabled>
        Request Custom Build (Coming Soon)
      </Button>
    );
  }

  const isMysteryBag = product.slug === MYSTERY_BAG_SLUG;
  const label =
    isMysteryBag && product.inStock
      ? "Add to Cart"
      : product.inStock
        ? "Add to Cart (Coming Soon)"
        : "Notify When Available";

  return (
    <Button
      variant="secondary"
      size="lg"
      className={combinedClass}
      disabled={!product.inStock}
      aria-label={`${label}, quantity ${quantity}`}
    >
      {label}
    </Button>
  );
}
