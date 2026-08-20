import type { ProductTrustBadge } from "@/lib/product-page";

interface ProductTrustBadgesProps {
  badges: ProductTrustBadge[];
}

export function ProductTrustBadges({ badges }: ProductTrustBadgesProps) {
  return (
    <ul className="product-trust-badges" aria-label="Product assurances">
      {badges.map((badge) => (
        <li key={badge.label} className="product-trust-badge">
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
