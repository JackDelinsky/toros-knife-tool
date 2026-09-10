"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Anatomy } from "@/components/product/Anatomy";
import { ProductViewer } from "@/components/product/viewer/ProductViewer";
import { HERO_KNIVES } from "@/components/home/hero/hero-knives";
import { getProductMedia } from "@/lib/product-media";
import { buildProductSpecs } from "@/lib/product-page";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS, type Product } from "@/types/product";

interface QuickInspectProps {
  product: Product;
  onClose: () => void;
  onAddToCart: () => void;
  addState: "idle" | "added";
  reducedMotion: boolean;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
type Tab = "overview" | "anatomy" | "specifications";
const TABS: ReadonlyArray<{ key: Tab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "anatomy", label: "Anatomy" },
  { key: "specifications", label: "Specifications" },
];

/**
 * The closer look — one experience, opened from the hero and from the shop.
 *
 * There is deliberately only one of these. Two near-identical panels that
 * behaved differently depending on where you clicked was the thing worth
 * removing, so the hero and the grid now open the same component against the
 * same product record and the same media configuration.
 *
 * Hero products keep their scene: the knife's own painted layers are rendered
 * behind the panel, so stepping in reads as moving into the world it was
 * already standing in. Everything else gets a plain ground rather than a
 * borrowed one.
 */
export function QuickInspect({
  product,
  onClose,
  onAddToCart,
  addState,
  reducedMotion,
}: QuickInspectProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [tab, setTab] = useState<Tab>("overview");

  const media = getProductMedia(product);
  const scene = HERO_KNIVES.find((k) => k.slug === product.slug)?.scene;
  const specs = buildProductSpecs(product);
  const alt = `${product.name}: ${product.steel} blade with a ${product.handleMaterial} handle`;

  // Move focus in, trap it while open, and lock the page behind the dialog.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0.16 : 0.45, ease: [0.22, 1, 0.36, 1] as const },
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="qi"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={
        scene
          ? ({
              "--key-x": `${50 + scene.keyX * 34}%`,
              "--key-y": `${50 - scene.keyY * 30}%`,
              "--key-strength": scene.keyStrength,
            } as React.CSSProperties)
          : undefined
      }
    >
      {scene ? (
        <motion.div className="qi-scene" {...fade} aria-hidden="true">
          <Image src={scene.plate} alt="" fill sizes="100vw" className="qi-scene-img" />
          <div className="qi-scene-mid">
            <Image src={scene.mid} alt="" fill sizes="100vw" className="qi-scene-img" />
          </div>
          <div className="qi-scene-key" />
        </motion.div>
      ) : (
        <motion.div className="qi-ground" {...fade} aria-hidden="true" />
      )}

      {/* Clicking anywhere off the content closes; a real button so the gesture
          exists for assistive tech rather than being a bare div handler. */}
      <motion.button
        type="button"
        className="qi-dismiss"
        onClick={onClose}
        aria-label="Close closer look"
        tabIndex={-1}
        {...fade}
      />

      <motion.div
        ref={panelRef}
        className="qi-body"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        transition={reducedMotion ? { duration: 0.18 } : { type: "spring", stiffness: 200, damping: 30 }}
      >
        <button ref={closeRef} type="button" className="qi-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close closer look</span>
        </button>

        <div className="qi-stage">
          <ProductViewer media={media} alt={alt} className="qi-viewer" />
        </div>

        <div className="qi-detail">
          <p className="eyebrow">{CATEGORY_LABELS[product.category]}</p>
          <h2 id={titleId} className="t-h2 qi-title">
            {product.name}
          </h2>

          <div className="qi-meta">
            <span className="t-price">{formatPrice(product.price)}</span>
            <span className={product.inStock ? "qi-stock" : "qi-stock qi-stock--out"}>
              {product.inStock ? "In stock" : "Sold out"}
            </span>
          </div>

          <div className="qi-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={onAddToCart}
              disabled={!product.inStock}
            >
              {addState === "added" ? "Added to cart" : "Add to cart"}
            </button>
            <Link href={`/products/${product.slug}`} className="btn btn--secondary">
              View full product
            </Link>
          </div>

          <div className="qi-tabs" role="tablist" aria-label="Product detail">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`${titleId}-tab-${t.key}`}
                aria-selected={tab === t.key}
                aria-controls={`${titleId}-panel-${t.key}`}
                className="qi-tab"
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            id={`${titleId}-panel-${tab}`}
            aria-labelledby={`${titleId}-tab-${tab}`}
            className="qi-panel"
          >
            {tab === "overview" ? (
              <p className="t-body">{product.longDescription}</p>
            ) : tab === "anatomy" ? (
              <Anatomy product={product} media={media} />
            ) : (
              <dl className="qi-specs">
                {specs.map((row) => (
                  <div key={row.label} className="qi-spec">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <p className="qi-note">
            Demo storefront — the cart lives in your browser and takes no payment.
          </p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
