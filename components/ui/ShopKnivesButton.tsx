import Link from "next/link";
import { KnifeIcon } from "@/components/ui/KnifeIcon";

type ShopKnivesButtonProps = {
  href?: string;
  size?: "sm" | "lg";
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h9.5M8.5 4.5L12 8l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sizeClasses = {
  sm: "shop-knives-btn-sm px-4 py-2 text-[10px] tracking-[0.2em] gap-2.5",
  lg: "shop-knives-btn-lg px-8 py-3.5 text-[11px] tracking-[0.24em] gap-3",
};

const iconSizes = {
  sm: { knife: "h-4 w-4", arrow: "h-3.5 w-3.5" },
  lg: { knife: "h-5 w-5", arrow: "h-4 w-4" },
};

export function ShopKnivesButton({
  href = "/shop",
  size = "lg",
  fullWidth = false,
  className = "",
  onClick,
}: ShopKnivesButtonProps) {
  const icons = iconSizes[size];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`shop-knives-btn group ${sizeClasses[size]} ${fullWidth ? "w-full justify-center" : ""} ${className}`}
    >
      <KnifeIcon className={`shop-knives-btn-knife shrink-0 ${icons.knife}`} />
      <span className="shop-knives-btn-label">Shop Knives</span>
      <ArrowIcon className={`shop-knives-btn-arrow shrink-0 ${icons.arrow}`} />
    </Link>
  );
}
