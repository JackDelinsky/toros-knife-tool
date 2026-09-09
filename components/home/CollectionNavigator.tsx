import Link from "next/link";
import { getShopProducts } from "@/lib/products";
import { CATEGORY_LABELS, type ProductCategory } from "@/types/product";

/**
 * Where to go next, by purpose rather than by taxonomy.
 *
 * Deliberately typographic: the hero is a wall of photography, so the section
 * directly under it earns its place by being quiet. Counts come from the real
 * catalogue, and a category with nothing in it is not listed — an empty filter
 * is a broken promise, not a navigation option.
 */
const COLLECTIONS: { category: ProductCategory; purpose: string }[] = [
  { category: "fixed-blades", purpose: "Field, hunt and camp" },
  { category: "custom-knives", purpose: "One-of-one builds" },
  { category: "folding-knives", purpose: "Everyday carry" },
  { category: "neck-knives", purpose: "Compact, worn close" },
];

export function CollectionNavigator() {
  const products = getShopProducts();

  const entries = COLLECTIONS.map((entry) => ({
    ...entry,
    count: products.filter((p) => p.category === entry.category).length,
  })).filter((entry) => entry.count > 0);

  return (
    <section className="collections" aria-labelledby="collections-heading">
      <div className="page-container">
        <h2 id="collections-heading" className="sr-only">
          Browse the collection
        </h2>

        <ul className="collections-row">
          {entries.map((entry, index) => (
            <li key={entry.category}>
              <Link href={`/shop?category=${entry.category}`} className="collection group">
                <span className="collection-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="collection-name">{CATEGORY_LABELS[entry.category]}</span>
                <span className="collection-purpose">{entry.purpose}</span>
                <span className="collection-count">
                  {entry.count} {entry.count === 1 ? "blade" : "blades"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
