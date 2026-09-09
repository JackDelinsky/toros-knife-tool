import { ProductCard } from "@/components/ProductCard";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { getShopProducts } from "@/lib/products";

/**
 * The shop, on the homepage.
 *
 * The rail above is the cinematic way in — pick a family, see what is in it.
 * This is the practical one: every knife on the page, one click from its
 * product page, with the same category pills the shop uses. A visitor who
 * already knows what they want should not have to open a category first.
 *
 * It deliberately borrows the catalogue's own classes rather than a parallel
 * set, so the grid here and the grid at /shop stay the same thing.
 */
export function HomeShop() {
  const products = getShopProducts();
  if (products.length === 0) return null;

  return (
    <section className="shopband" aria-labelledby="shopband-heading">
      <div className="page-container">
        <header className="catalog-head">
          <h2 id="shopband-heading" className="t-h2">
            Every blade
          </h2>
          <p className="t-lead catalog-lead">
            Hand-finished in the workshop, for hunters, campers, collectors and anyone who
            values the craft.
          </p>
        </header>

        <div className="catalog-bar">
          {/* Nothing here is the current page — this is the homepage — so the
              pills are plain links out to the shop, not a current-state row. */}
          <CategoryNav marksCurrent={false} />
          <p className="catalog-count">
            {products.length} {products.length === 1 ? "blade" : "blades"}
          </p>
        </div>

        <div className="catalog-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
