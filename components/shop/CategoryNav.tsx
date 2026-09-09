import Link from "next/link";
import { getShopProducts } from "@/lib/products";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

/**
 * Category filter row.
 *
 * A category with nothing in it is omitted rather than rendered as a dead
 * filter — the catalogue currently has no axes or hatchets, and offering that
 * tab would be a control that promises results it cannot return.
 */
export function CategoryNav({ active }: { active?: ProductCategory }) {
  const products = getShopProducts();
  const categories = (Object.keys(CATEGORY_LABELS) as ProductCategory[]).filter((key) =>
    products.some((p) => p.category === key),
  );

  return (
    <nav className="catnav" aria-label="Filter by category">
      <Link href="/shop" className="catnav-item" aria-current={!active ? "page" : undefined}>
        All
      </Link>
      {categories.map((key) => (
        <Link
          key={key}
          href={`/shop?category=${key}`}
          className="catnav-item"
          aria-current={active === key ? "page" : undefined}
        >
          {CATEGORY_LABELS[key]}
        </Link>
      ))}
    </nav>
  );
}
