"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/AddToCartButton";
import type { Product } from "@/types/product";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="buy-purchase">
      <div className="qty">
        <span className="qty-label" id="qty-label">
          Quantity
        </span>
        <div className="qty-control" role="group" aria-labelledby="qty-label">
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={!product.inStock || quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="qty-value" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="qty-btn"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            disabled={!product.inStock || quantity >= 10}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton product={product} quantity={quantity} />
    </div>
  );
}
