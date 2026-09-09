import { MYSTERY_BAG_SLUG } from "@/lib/image-paths";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
}

/**
 * The purchase action, which says exactly what it will do.
 *
 * Where a real checkout URL exists the button goes there. Everywhere else it
 * is honest that this is a demo rather than dressing up a dead control as a
 * working one.
 */
export function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  if (product.checkoutUrl && product.inStock) {
    return (
      <a
        href={product.checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--primary btn--wide"
      >
        Buy now — secure checkout
      </a>
    );
  }

  if (!product.inStock) {
    return (
      <button type="button" className="btn btn--secondary btn--wide" disabled>
        Sold out
      </button>
    );
  }

  const custom = product.customAvailable;
  const isMysteryBag = product.slug === MYSTERY_BAG_SLUG;

  return (
    <button
      type="button"
      className="btn btn--primary btn--wide"
      disabled={custom}
      aria-label={
        custom
          ? "Custom build requests are not open yet"
          : `Add ${quantity} ${product.name} to the demo cart`
      }
    >
      {custom ? "Custom builds not open yet" : isMysteryBag ? "Add a bag" : "Add to cart"}
    </button>
  );
}
