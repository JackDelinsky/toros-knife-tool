"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { HeroKnife } from "@/components/home/hero/hero-knives";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";
import { TorosMountainMark } from "@/components/home/hero/TorosMountainMark";

interface KnifeInspectionDialogProps {
  knife: HeroKnife;
  reducedMotion: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  addState: "idle" | "added";
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

/**
 * Closer look at the active knife. Deliberately not a white modal: it keeps the
 * product's own environment dimmed at the edges so it reads as moving forward
 * within the same scene.
 */
export function KnifeInspectionDialog({
  knife,
  reducedMotion,
  onClose,
  onAddToCart,
  addState,
}: KnifeInspectionDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { presentation, product } = knife;

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

  const specs = [
    { label: "Steel", value: product.steel },
    { label: "Handle", value: product.handleMaterial },
    { label: "Blade", value: product.bladeLength },
    { label: "Overall", value: product.totalLength },
  ].filter((row) => row.value && row.value !== "N/A");

  // Only ever rendered in response to a click, so there is no server pass to
  // guard against beyond this belt-and-braces check.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="hero-inspect" role="presentation">
      <motion.button
        type="button"
        className="hero-inspect-scrim"
        onClick={onClose}
        aria-label="Close closer look"
        tabIndex={-1}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.35 }}
      />

      <motion.div
        ref={panelRef}
        className="hero-inspect-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hero-inspect-title"
        style={
          {
            "--knife-accent": presentation.accent,
            "--knife-accent-secondary": presentation.accentSecondary,
          } as React.CSSProperties
        }
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
        transition={
          reducedMotion
            ? { duration: 0.18 }
            : { type: "spring", stiffness: 220, damping: 28 }
        }
      >
        <button
          ref={closeRef}
          type="button"
          className="hero-inspect-close"
          onClick={onClose}
        >
          <span aria-hidden="true">✕</span>
          <span className="sr-only">Close closer look</span>
        </button>

        <div className="hero-inspect-stage">
          <motion.div layoutId={reducedMotion ? undefined : `hero-knife-${product.slug}`}>
            <Image
              src={presentation.cutoutSrc}
              alt={`${product.name} — ${product.steel} blade with ${product.handleMaterial} handle`}
              width={presentation.cutoutWidth}
              height={presentation.cutoutHeight}
              className="hero-inspect-image"
              sizes="(max-width: 900px) 80vw, 40vw"
            />
          </motion.div>
        </div>

        <div className="hero-inspect-detail">
          <p className="eyebrow">{CATEGORY_LABELS[product.category]}</p>
          <h2 id="hero-inspect-title" className="hero-inspect-title">
            {product.name}
          </h2>

          <p className="hero-inspect-copy">{product.longDescription}</p>

          <dl className="hero-inspect-specs">
            {specs.map((row) => (
              <div key={row.label} className="hero-inspect-spec">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="hero-inspect-meta">
            <span className="hero-inspect-price">{formatPrice(product.price)}</span>
            <span className={product.inStock ? "hero-stock" : "hero-stock hero-stock--out"}>
              {product.inStock ? "In stock" : "Sold out"}
            </span>
          </div>

          <div className="hero-inspect-actions">
            <button
              type="button"
              className="hero-btn hero-btn--primary"
              onClick={onAddToCart}
              disabled={!product.inStock}
            >
              {addState === "added" ? "Added to demo cart" : "Add to Cart"}
            </button>
            <Link href={`/products/${product.slug}`} className="hero-btn hero-btn--ghost">
              Full product page →
            </Link>
          </div>

          <p className="hero-demo-note">
            <TorosMountainMark className="hero-demo-mark" />
            Demo storefront — this cart is local to your browser and takes no payment.
          </p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
