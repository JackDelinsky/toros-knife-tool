"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HERO_KNIFE_LAYERS } from "@/lib/hero-knife";
import { formatPrice, getProductBySlug } from "@/lib/products";

/**
 * Layered hero knives — each knife links to its product page on hover.
 */
export function HeroFeaturedKnife() {
  const visualRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMotionEnabled(!reducedMotion);

    if (reducedMotion) return;

    function handlePointerMove(event: PointerEvent) {
      const element = visualRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (event.clientX - centerX) / rect.width;
      const deltaY = (event.clientY - centerY) / rect.height;

      setParallax({
        x: deltaX * 6,
        y: deltaY * 4,
      });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const parallaxStyle = motionEnabled
    ? { transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)` }
    : undefined;

  return (
    <div ref={visualRef} className="hero-knife-visual">
      <div className="hero-knife-stage">
        <div className="hero-knife-parallax" style={parallaxStyle}>
          <div className="hero-knife-stack">
            {HERO_KNIFE_LAYERS.map((layer) => {
              const product = getProductBySlug(layer.slug);
              const href = product ? `/products/${product.slug}` : "/shop";
              const label = product
                ? `View ${product.name} — ${formatPrice(product.price)}`
                : "View knife";

              return (
                <Link
                  key={layer.id}
                  href={href}
                  className={`hero-knife-slot hero-knife-slot--${layer.id} group`}
                  aria-label={label}
                >
                  <img
                    src={`${layer.image}?v=2`}
                    alt=""
                    width={layer.width}
                    height={layer.height}
                    decoding="async"
                    className={`hero-knife-layer-image hero-knife-layer-image--${layer.id}`}
                  />
                  <span className="hero-knife-layer-cta">
                    View Knife
                    <span className="hero-knife-layer-cta-arrow" aria-hidden="true">→</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
