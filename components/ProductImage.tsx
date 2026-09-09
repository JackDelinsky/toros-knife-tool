import Image from "next/image";
import { resolveProductCardImage } from "@/lib/brand-images";
import type { Product } from "@/types/product";

interface ProductImageProps {
  product: Pick<Product, "name" | "slug" | "category" | "images">;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** cover fills a fixed frame; contain shows the whole silhouette. */
  fit?: "cover" | "contain";
}

const sizeHint: Record<NonNullable<ProductImageProps["size"]>, string> = {
  sm: "(max-width: 768px) 25vw, 15vw",
  md: "(max-width: 768px) 50vw, 33vw",
  lg: "(max-width: 768px) 100vw, 50vw",
};

/**
 * One product photograph, with no frame of its own.
 *
 * The caller supplies the frame — always a `.media` element, which owns the
 * aspect ratio and reserves the box before the image decodes. Keeping the two
 * apart is what makes uneven source photography present consistently.
 */
export function ProductImage({
  product,
  className = "",
  size = "md",
  fit = "cover",
}: ProductImageProps) {
  const src = resolveProductCardImage(product.slug, product.images);

  return (
    <Image
      src={src}
      alt={product.name}
      fill
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
      sizes={sizeHint[size]}
    />
  );
}
