import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  /** The lead item in a grid gets a taller frame and larger type. */
  emphasis?: boolean;
}

/**
 * One product, presented the same way everywhere it appears.
 *
 * The source photography is uneven — every file is a 900x1200 JPEG with the
 * knife letterboxed into a landscape band in the middle — so the frame fixes a
 * 4:3 ratio and crops to centre. That shows every product at the same scale
 * without stretching anything, which is the whole reason `.media` exists.
 */
export function ProductCard({ product, emphasis = false }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="pcard group">
      <div className={`media media--product ${emphasis ? "media--tall" : ""} pcard-media`}>
        <ProductImage
          product={product}
          fit="cover"
          className="pcard-img"
          size={emphasis ? "lg" : "md"}
        />
        {!product.inStock ? <span className="pcard-flag">Sold out</span> : null}
      </div>

      <div className="pcard-body">
        <p className="pcard-cat">{CATEGORY_LABELS[product.category]}</p>
        <h3 className={emphasis ? "t-h3 pcard-name" : "pcard-name"}>{product.name}</h3>
        <p className="pcard-desc">{product.shortDescription}</p>
        <p className="pcard-price">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
