import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextLink } from "@/components/ui/TextLink";
import { getFeaturedProducts } from "@/lib/products";

export function FeaturedProducts() {
  const featured = getFeaturedProducts();

  return (
    <section className="section-pad border-t border-toros-border/40">
      <div className="page-container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <SectionHeader
              eyebrow="Curated"
              title="Featured Blades"
              description="Hand-selected pieces that showcase Turkish-inspired craft, premium steels, and field-ready design."
            />
          </Reveal>
          <Reveal delay={80}>
            <TextLink href="/shop" className="shrink-0">
              View all knives
              <span aria-hidden="true">→</span>
            </TextLink>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {featured.slice(0, 6).map((product, index) => (
            <Reveal key={product.id} delay={index * 60}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
