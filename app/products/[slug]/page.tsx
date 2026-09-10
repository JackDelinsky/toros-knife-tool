import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { Anatomy } from "@/components/product/Anatomy";
import { ProductViewer } from "@/components/product/viewer/ProductViewer";
import { getProductMedia } from "@/lib/product-media";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
  formatPrice,
} from "@/lib/products";
import { buildProductSpecs, getCategoryEyebrow, getProductStory } from "@/lib/product-page";
import { CATEGORY_LABELS } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.shortDescription };
}

const SHIPPING_TEXT =
  "Orders ship within 3–5 business days from Georgia via insured carrier. International shipping is available on select items.";

const RETURNS_TEXT =
  "Unused knives may be returned within 14 days in original condition. Custom commissions are non-refundable once production begins.";

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  const related = getRelatedProducts(product);
  const media = getProductMedia(product);
  const specs = buildProductSpecs(product);
  const story = getProductStory(product);

  const warrantyCare = [
    product.warranty && `Warranty: ${product.warranty}.`,
    product.careInstructions,
  ]
    .filter(Boolean)
    .join(" ");

  const accordionItems = [
    { id: "shipping", title: "Shipping", content: SHIPPING_TEXT },
    { id: "returns", title: "Returns", content: RETURNS_TEXT },
    { id: "care", title: "Warranty and care", content: warrantyCare },
  ].filter((item) => item.content);

  // The long description often restates the story's opening; showing both
  // reads as padding, so the duplicate is dropped.
  const showLongDescription =
    product.longDescription &&
    product.longDescription.trim() !== story.trim() &&
    !product.longDescription.startsWith(story.slice(0, 40));

  return (
    <article className="pdp">
      <div className="page-container">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/shop?category=${product.category}`}>
            {CATEGORY_LABELS[product.category]}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="pdp-top">
          {/* The same viewer the hero and the closer look use, in the same
              mode, from the same configuration. */}
          <ProductViewer
            media={media}
            alt={`${product.name}: ${product.steel} blade with a ${product.handleMaterial} handle`}
            className="pdp-viewer"
          />

          <div className="buy">
            <p className="eyebrow">{getCategoryEyebrow(product)}</p>
            <h1 className="t-h1 buy-title">{product.name}</h1>
            <p className="t-lead buy-lead">{product.shortDescription}</p>

            <div className="buy-price-row">
              <span className="t-price">{formatPrice(product.price)}</span>
              <span className={product.inStock ? "buy-stock" : "buy-stock buy-stock--out"}>
                {product.inStock ? "In stock" : "Sold out"}
              </span>
            </div>

            <ProductPurchasePanel product={product} />

            {!product.checkoutUrl ? (
              <p className="t-meta buy-note">
                Demo storefront — the cart lives in your browser and takes no payment.
              </p>
            ) : null}

            <dl className="buy-specs">
              {specs.map((spec) => (
                <div key={spec.label} className="buy-spec">
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>

            {product.bestUses.length > 0 ? (
              <p className="t-meta buy-uses">
                <span className="buy-uses-label">Built for</span> {product.bestUses.join(" · ")}
              </p>
            ) : null}
          </div>
        </div>

        <Anatomy product={product} media={media} />

        <section className="pdp-story editorial" aria-labelledby="pdp-story-heading">
          <div>
            <h2 id="pdp-story-heading" className="t-h2">
              The making
            </h2>
            <p className="t-body pdp-story-lead">{story}</p>
            {showLongDescription ? (
              <p className="t-body pdp-story-lead">{product.longDescription}</p>
            ) : null}
          </div>

          <ProductDetailsAccordion items={accordionItems} />
        </section>

        {related.length > 0 ? (
          <section className="pdp-related" aria-labelledby="pdp-related-heading">
            <h2 id="pdp-related-heading" className="t-h3">
              More {CATEGORY_LABELS[product.category].toLowerCase()}
            </h2>
            <div className="pdp-related-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
