import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

/**
 * The featured run, composed asymmetrically.
 *
 * One knife is given real size and the rest sit beside it in a narrower column,
 * so the eye has somewhere to land. A row of equal cards says everything here
 * matters the same amount, which is never true.
 */
export function FeaturedEditorial() {
  const featured = getFeaturedProducts();
  if (featured.length === 0) return null;

  const [lead, ...rest] = featured;
  const secondary = rest.slice(0, 4);

  return (
    <section className="section-pad featured" aria-labelledby="featured-heading">
      <div className="page-container">
        <div className="featured-head">
          <h2 id="featured-heading" className="t-h2">
            On the bench now
          </h2>
          <Link href="/shop" className="link featured-all">
            All {featured.length > 0 ? "blades" : "products"}
          </Link>
        </div>

        <div className="featured-grid">
          <ProductCard product={lead} emphasis />
          <div className="featured-rest">
            {secondary.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
