"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveProductCardImage, resolveProductImage } from "@/lib/brand-images";
import type { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

/**
 * The media stage.
 *
 * The frame owns the aspect ratio, so the box is reserved before the photo
 * decodes and the layout never collapses or jumps while it loads. Thumbnails
 * appear only when there is genuinely more than one photograph — a single
 * thumbnail under a single image is a control that does nothing.
 */
export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const extra = product.images.slice(1);
  const hasMultiple = extra.length > 0;

  const src =
    activeIndex === 0
      ? resolveProductCardImage(product.slug, product.images)
      : resolveProductImage(product.slug, product.category, product.images, activeIndex);

  return (
    <div className="gallery">
      <div className="media media--product gallery-stage">
        <Image
          src={src}
          alt={`${product.name} — ${product.steel} blade with a ${product.handleMaterial} handle`}
          fill
          loading="eager"
          fetchPriority="high"
          className="gallery-img"
          sizes="(max-width: 900px) 94vw, 52vw"
        />
      </div>

      {hasMultiple ? (
        <div className="gallery-thumbs">
          {product.images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className="gallery-thumb"
              aria-label={`Show photograph ${i + 1} of ${product.images.length}`}
              aria-current={activeIndex === i ? "true" : undefined}
            >
              <span className="media media--square">
                <Image
                  src={resolveProductImage(product.slug, product.category, product.images, i)}
                  alt=""
                  fill
                  sizes="80px"
                  className="gallery-thumb-img"
                />
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
