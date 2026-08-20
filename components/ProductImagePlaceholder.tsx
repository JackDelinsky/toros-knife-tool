import Image from "next/image";
import { CATEGORY_IMAGES } from "@/lib/brand-images";
import type { ProductCategory } from "@/types/product";

interface ProductImagePlaceholderProps {
  category: ProductCategory;
  name: string;
  className?: string;
}

export function ProductImagePlaceholder({
  category,
  name,
  className = "",
}: ProductImagePlaceholderProps) {
  return (
    <div className={`relative overflow-hidden bg-toros-surface ${className}`}>
      <Image
        src={CATEGORY_IMAGES[category]}
        alt={name}
        fill
        className="object-cover"
        sizes="50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-toros-charcoal/50 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 warm-grain opacity-[0.08]" />
    </div>
  );
}
