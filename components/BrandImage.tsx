import Image from "next/image";

interface BrandImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  overlay?: "hero" | "card" | "subtle" | "none";
  objectFit?: "cover" | "contain";
}

const overlayClasses = {
  hero: "bg-gradient-to-r from-toros-black via-toros-black/85 to-toros-black/20",
  card: "bg-gradient-to-t from-toros-black/85 via-toros-black/15 to-transparent",
  subtle: "bg-gradient-to-br from-toros-black/40 via-transparent to-toros-black/60",
  none: "",
};

export function BrandImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  overlay = "subtle",
  objectFit = "cover",
}: BrandImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={objectFit === "contain" ? "object-contain" : "object-cover"}
        sizes={sizes}
      />
      {overlay !== "none" && (
        <div className={`absolute inset-0 ${overlayClasses[overlay]}`} aria-hidden="true" />
      )}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.12] warm-grain"
        aria-hidden="true"
      />
    </div>
  );
}
