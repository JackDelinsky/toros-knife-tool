import Image from "next/image";
import Link from "next/link";
import { BRAND_IMAGE_PATHS } from "@/lib/image-paths";

const SIZE_MAP = {
  xs: 24,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 112,
} as const;

type TorosLogoProps = {
  size?: keyof typeof SIZE_MAP;
  className?: string;
  priority?: boolean;
  /** Wrap in home link */
  linked?: boolean;
};

export function TorosLogo({
  size = "md",
  className = "",
  priority = false,
  linked = false,
}: TorosLogoProps) {
  const dim = SIZE_MAP[size];

  const image = (
    <Image
      src={BRAND_IMAGE_PATHS.logo}
      alt="Toros Knife & Tool"
      width={dim}
      height={dim}
      priority={priority}
      unoptimized
      className={`h-auto w-auto max-h-full max-w-full object-contain ${className}`}
      style={{ width: dim, height: dim }}
    />
  );

  if (linked) {
    return (
      <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Toros Knife & Tool home">
        {image}
      </Link>
    );
  }

  return image;
}
