import Link from "next/link";
import { getShopProducts } from "@/lib/products";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

interface CategoryNavProps {
  active?: ProductCategory;
  /**
   * Whether one of these links describes the page the visitor is already on.
   * True on the shop itself, where "All" or a category really is the current
   * page. False anywhere else — the homepage row is a set of links out, and
   * marking one `aria-current` there would tell a screen reader something
   * untrue about where the visitor is.
   */
  marksCurrent?: boolean;
}

/**
 * Category filter row.
 *
 * A category with nothing in it is omitted rather than rendered as a dead
 * filter — the catalogue currently has no axes or hatchets, and offering that
 * tab would be a control that promises results it cannot return.
 */
export function CategoryNav({ active, marksCurrent = true }: CategoryNavProps) {
  const products = getShopProducts();
  const categories = (Object.keys(CATEGORY_LABELS) as ProductCategory[]).filter((key) =>
    products.some((p) => p.category === key),
  );
  const current = (key?: ProductCategory) =>
    marksCurrent && active === key ? "page" : undefined;

  return (
    <nav className="catnav" aria-label="Filter by category">
      <Link href="/shop" className="catnav-item" aria-current={current(undefined)}>
        All
      </Link>
      {categories.map((key) => (
        <Link
          key={key}
          href={`/shop?category=${key}`}
          className="catnav-item"
          aria-current={current(key)}
        >
          {CATEGORY_LABELS[key]}
        </Link>
      ))}
    </nav>
  );
}
