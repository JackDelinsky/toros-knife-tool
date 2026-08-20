import type { ProductSpecRow } from "@/types/product";

interface ProductSpecsTableProps {
  specs: ProductSpecRow[];
}

export function ProductSpecsTable({ specs }: ProductSpecsTableProps) {
  return (
    <section className="product-specs" aria-labelledby="product-specs-heading">
      <h2 id="product-specs-heading" className="product-section-heading">
        Specifications
      </h2>
      <dl className="product-specs-table">
        {specs.map((spec) => (
          <div key={spec.label} className="product-specs-row">
            <dt className="product-specs-label">{spec.label}</dt>
            <dd className="product-specs-value">{spec.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
