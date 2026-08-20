import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductBuyColumn } from "@/components/product/ProductBuyColumn";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductSpecsTable } from "@/components/product/ProductSpecsTable";
import { ProductStorySection } from "@/components/product/ProductStorySection";
import { RelatedProductCard } from "@/components/product/RelatedProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import {
  buildProductSpecs,
  getCategoryEyebrow,
  getProductStory,
  getTrustBadges,
} from "@/lib/product-page";
import { CATEGORY_LABELS } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

const SHIPPING_TEXT =
  "Orders ship within 3–5 business days from Georgia via insured carrier. International shipping is available on select items.";

const RETURNS_TEXT =
  "Unused knives may be returned within 14 days in original condition. Custom commissions are non-refundable once production begins.";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product);
  const specs = buildProductSpecs(product);
  const story = getProductStory(product);
  const trustBadges = getTrustBadges(product);
  const categoryLabel = getCategoryEyebrow(product);

  const warrantyCareParts = [
    product.warranty && `Warranty: ${product.warranty}.`,
    product.careInstructions,
  ].filter(Boolean);

  const accordionItems = [
    { id: "shipping", title: "Shipping", content: SHIPPING_TEXT },
    { id: "returns", title: "Returns", content: RETURNS_TEXT },
    {
      id: "warranty",
      title: "Warranty & Care",
      content: warrantyCareParts.join(" "),
    },
  ];

  return (
    <div className="product-page">
      <div className="product-page-bg" aria-hidden="true" />

      <div className="page-container product-page-inner">
        <nav className="product-breadcrumb" aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/shop?category=${product.category}`}>
            {CATEGORY_LABELS[product.category]}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="product-breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-hero">
          <ProductGallery product={product} />
          <ProductBuyColumn
            product={product}
            categoryLabel={categoryLabel}
            trustBadges={trustBadges}
          />
        </div>

        <div className="product-details-grid">
          <ProductSpecsTable specs={specs} />
          <ProductStorySection story={story} longDescription={product.longDescription} />
        </div>

        <ProductDetailsAccordion items={accordionItems} />

        {related.length > 0 && (
          <section className="product-related" aria-labelledby="product-related-heading">
            <h2 id="product-related-heading" className="product-section-heading">
              You May Also Like
            </h2>
            <div className="product-related-grid">
              {related.map((item) => (
                <RelatedProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
