import Image from "next/image";
import { CATEGORY_IMAGES, resolveProductImage } from "@/lib/brand-images";
import type { Product, ProductCategory } from "@/types/product";

interface ProductImageProps {
  product: Pick<Product, "name" | "slug" | "category" | "images">;
  className?: string;
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  imageIndex?: number;
  /** cover = hero crops; contain = shop cards show full knife profile */
  fit?: "cover" | "contain";
}

const sizeHint: Record<NonNullable<ProductImageProps["size"]>, string> = {
  sm: "(max-width: 768px) 25vw, 15vw",
  md: "(max-width: 768px) 50vw, 33vw",
  lg: "(max-width: 768px) 100vw, 33vw",
};

export function ProductImage({
  product,
  className = "",
  size = "md",
  priority = false,
  imageIndex = 0,
  fit = "cover",
}: ProductImageProps) {
  const src = resolveProductImage(
    product.slug,
    product.category,
    product.images,
    imageIndex,
  );

  const imageFitClass =
    fit === "contain"
      ? "object-contain object-center p-1 sm:p-2 transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      : "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]";

  return (
    <div
      className={`relative overflow-hidden ${fit === "contain" ? "bg-toros-black" : "bg-toros-surface"} ${className}`}
    >
      <Image
        src={src}
        alt={product.name}
        fill
        priority={priority}
        className={imageFitClass}
        sizes={sizeHint[size]}
      />
      {fit === "cover" && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-toros-charcoal/50 via-transparent to-toros-charcoal/10"
          aria-hidden="true"
        />
      )}
      <div className="pointer-events-none absolute inset-0 warm-grain opacity-[0.08]" aria-hidden="true" />
    </div>
  );
}

/** Standalone placeholder for category or editorial slots */
export function StockImage({
  src,
  alt,
  category,
  className = "",
  priority = false,
}: {
  src?: string;
  alt: string;
  category?: ProductCategory;
  className?: string;
  priority?: boolean;
}) {
  const imageSrc = src ?? (category ? CATEGORY_IMAGES[category] : CATEGORY_IMAGES["fixed-blades"]);

  return (
    <div className={`relative overflow-hidden bg-toros-surface ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-toros-charcoal/60 via-toros-charcoal/10 to-transparent" />
      <div className="pointer-events-none absolute inset-0 warm-grain opacity-[0.08]" />
    </div>
  );
}
