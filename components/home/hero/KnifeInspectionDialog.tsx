"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { HeroKnife } from "@/components/home/hero/hero-knives";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";

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
 * The closer look.
 *
 * Not a modal on a black panel. The knife's own scene layers are re-rendered
 * behind it at a larger scale, so stepping in reads as moving *into* the world
 * the knife was already standing in — the light, the ground and the foreground
 * are the same ones, just nearer. The product itself animates from its carousel
 * position via a shared `layoutId`.
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

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: reducedMotion ? 0.16 : 0.5, ease: [0.22, 1, 0.36, 1] as const },
  };

  // Only ever rendered in response to a click, so there is no server pass to
  // guard against beyond this belt-and-braces check.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="inspect"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspect-title"
      style={
        {
          "--knife-accent": presentation.accent,
          "--knife-accent-secondary": presentation.accentSecondary,
          "--key-x": `${50 + presentation.scene.keyX * 34}%`,
          "--key-y": `${50 - presentation.scene.keyY * 30}%`,
          "--key-strength": presentation.scene.keyStrength,
        } as React.CSSProperties
      }
    >
      {/* The same world, moved closer. */}
      <motion.div className="inspect-scene" {...fade} aria-hidden="true">
        <Image src={presentation.scene.plate} alt="" fill sizes="100vw" className="inspect-scene-img" />
        <div className="inspect-scene-mid">
          <Image src={presentation.scene.mid} alt="" fill sizes="100vw" className="inspect-scene-img" />
        </div>
        <div className="inspect-scene-key" />
      </motion.div>

      {/* Clicking anywhere off the content closes; the button exists so the
          gesture is real to assistive tech rather than a bare div handler. */}
      <motion.button
        type="button"
        className="inspect-dismiss"
        onClick={onClose}
        aria-label="Close closer look"
        tabIndex={-1}
        {...fade}
      />

      <motion.div
        ref={panelRef}
        className="inspect-body"
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
        transition={
          reducedMotion ? { duration: 0.18 } : { type: "spring", stiffness: 200, damping: 30 }
        }
      >
        <button ref={closeRef} type="button" className="inspect-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Close closer look</span>
        </button>

        <div className="inspect-stage">
          <motion.div
            className="inspect-knife-wrap"
            layoutId={reducedMotion ? undefined : `hero-knife-${product.slug}`}
            style={{ rotate: presentation.imageRotation, scale: presentation.imageScale }}
          >
            <Image
              src={presentation.cutoutSrc}
              alt={`${product.name}: ${product.steel} blade with a ${product.handleMaterial} handle`}
              width={presentation.cutoutWidth}
              height={presentation.cutoutHeight}
              className="inspect-knife"
              sizes="(max-width: 900px) 92vw, 52vw"
            />
          </motion.div>
        </div>

        <div className="inspect-detail">
          <p className="eyebrow">{CATEGORY_LABELS[product.category]}</p>
          <h2 id="inspect-title" className="t-h2 inspect-title">
            {product.name}
          </h2>

          <p className="t-body inspect-copy">{product.longDescription}</p>

          <dl className="inspect-specs">
            {specs.map((row) => (
              <div key={row.label} className="inspect-spec">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="inspect-meta">
            <span className="t-price">{formatPrice(product.price)}</span>
            <span className={product.inStock ? "inspect-stock" : "inspect-stock inspect-stock--out"}>
              {product.inStock ? "In stock" : "Sold out"}
            </span>
          </div>

          <div className="inspect-actions">
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

          <p className="inspect-note">
            Demo storefront — the cart lives in your browser and takes no payment.
          </p>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
