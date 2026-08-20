import Link from "next/link";
import Image from "next/image";
import { resolveProductImage } from "@/lib/brand-images";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";
import type { Product } from "@/types/product";

interface RelatedProductCardProps {
  product: Product;
}

export function RelatedProductCard({ product }: RelatedProductCardProps) {
  const src = resolveProductImage(
    product.slug,
    product.category,
    product.images,
    0,
  );

  return (
    <Link href={`/products/${product.slug}`} className="product-related-card group">
      <div className="product-related-card-media">
        <Image
          src={src}
          alt={product.name}
          width={240}
          height={320}
          className="product-related-card-img"
          sizes="(max-width: 640px) 30vw, 180px"
        />
      </div>
      <div className="product-related-card-body">
        <span className="product-related-card-category">
          {CATEGORY_LABELS[product.category]}
        </span>
        <h3 className="product-related-card-title">{product.name}</h3>
        <span className="product-related-card-price">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}
