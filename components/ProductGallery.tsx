"use client";

import Image from "next/image";
import { useState } from "react";
import { resolveProductImage } from "@/lib/brand-images";
import type { Product } from "@/types/product";

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const imageCount = Math.max(product.images.length, 1);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = resolveProductImage(
    product.slug,
    product.category,
    product.images,
    activeIndex,
  );

  return (
    <div className="product-gallery">
      <div className="product-gallery-stage">
        <div
          className="product-gallery-glow"
          aria-hidden="true"
        />
        <Image
          src={activeSrc}
          alt={product.name}
          width={960}
          height={1200}
          priority
          className="product-gallery-image"
          sizes="(max-width: 1024px) 92vw, 42vw"
        />
      </div>

      {imageCount > 1 && (
        <div className="product-gallery-thumbs">
          {Array.from({ length: imageCount }).map((_, i) => {
            const thumbSrc = resolveProductImage(
              product.slug,
              product.category,
              product.images,
              i,
            );
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`product-gallery-thumb${activeIndex === i ? " product-gallery-thumb--active" : ""}`}
                aria-label={`View image ${i + 1}`}
                aria-current={activeIndex === i ? "true" : undefined}
              >
                <Image
                  src={thumbSrc}
                  alt=""
                  width={80}
                  height={80}
                  className="product-gallery-thumb-img"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
