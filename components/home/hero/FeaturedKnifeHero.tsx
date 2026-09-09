"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { HeroKnife } from "@/components/home/hero/hero-knives";
import { KnifeEnvironment } from "@/components/home/hero/KnifeEnvironment";
import { KnifeInspectionDialog } from "@/components/home/hero/KnifeInspectionDialog";
import { TorosMountainMark } from "@/components/home/hero/TorosMountainMark";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { demoCartAdapter } from "@/lib/demo-cart";
import { formatPrice } from "@/lib/products";
import { CATEGORY_LABELS } from "@/types/product";

interface FeaturedKnifeHeroProps {
  knives: HeroKnife[];
}

/** Positive modulo — the carousel wraps in both directions. */
function cycle(index: number, length: number): number {
  return ((index % length) + length) % length;
}

/**
 * Signed distance from the active index, wrapping the short way round, so knife
 * 0 sits directly right of knife 6 rather than six steps away.
 */
function relativeOffset(index: number, active: number, length: number): number {
  const half = Math.floor(length / 2);
  return cycle(index - active + half, length) - half;
}

const STEP_LOCK_MS = 320;
const DRAG_DISTANCE = 70;
const DRAG_VELOCITY = 320;
const TAP_SLOP = 6;

export function FeaturedKnifeHero({ knives }: FeaturedKnifeHeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const length = knives.length;

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [inspecting, setInspecting] = useState(false);
  const [addState, setAddState] = useState<"idle" | "added">("idle");
  const [cartCount, setCartCount] = useState(0);

  const lockedUntil = useRef(0);
  const dragStartX = useRef(0);
  const dragged = useRef(false);
  const inspectTrigger = useRef<HTMLButtonElement>(null);

  const knife = knives[active];
  const { presentation, product } = knife;

  // Rapid clicks and flicks are absorbed rather than queued, so the knife,
  // backdrop, copy and index can never drift out of step with each other.
  const step = useCallback(
    (delta: 1 | -1) => {
      const now = Date.now();
      if (now < lockedUntil.current) return;
      lockedUntil.current = now + STEP_LOCK_MS;
      setDirection(delta);
      setActive((current) => cycle(current + delta, length));
      setAddState("idle");
    },
    [length],
  );

  const goTo = useCallback(
    (index: number) => {
      const offset = relativeOffset(index, active, length);
      if (offset === 0) return;
      step(offset > 0 ? 1 : -1);
    },
    [active, length, step],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (inspecting) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    },
    [inspecting, step],
  );

  const handleDragStart = useCallback((_: unknown, info: PanInfo) => {
    dragStartX.current = info.point.x;
    dragged.current = false;
  }, []);

  const handleDrag = useCallback((_: unknown, info: PanInfo) => {
    if (Math.abs(info.point.x - dragStartX.current) > TAP_SLOP) dragged.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -DRAG_DISTANCE || velocity.x < -DRAG_VELOCITY) step(1);
      else if (offset.x > DRAG_DISTANCE || velocity.x > DRAG_VELOCITY) step(-1);
    },
    [step],
  );

  const openInspection = useCallback(() => {
    if (dragged.current) return; // released a drag, not a tap
    setInspecting(true);
  }, []);

  const addToCart = useCallback(() => {
    if (!product.inStock) return;
    const next = demoCartAdapter.add({
      slug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
    });
    setCartCount(demoCartAdapter.count(next));  // read back only after a write
    setAddState("added");
  }, [product]);

  const specs = useMemo(
    () =>
      [
        { label: "Steel", value: product.steel },
        { label: "Handle", value: product.handleMaterial },
        { label: "Overall", value: product.totalLength },
      ].filter((row) => row.value && row.value !== "N/A"),
    [product],
  );

  const spring = reducedMotion
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 120, damping: 22, mass: 0.9 };

  return (
    <section
      className="hero-cinematic"
      aria-roledescription="carousel"
      aria-label="Featured Toros knives"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={
        {
          "--knife-accent": presentation.accent,
          "--knife-accent-secondary": presentation.accentSecondary,
        } as React.CSSProperties
      }
    >
      <AnimatePresence mode="sync">
        <KnifeEnvironment presentation={presentation} reducedMotion={reducedMotion} />
      </AnimatePresence>

      <div className="hero-cinematic-inner">
        {/* Left column — story */}
        <div className="hero-col hero-col--story">
          <AnimatePresence mode="wait">
            <motion.div
              key={`story-${product.slug}`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 26 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -26 }}
              transition={{ duration: reducedMotion ? 0.18 : 0.45, ease: "easeOut" }}
            >
              <p className="eyebrow">{presentation.eyebrow}</p>
              <h1 className="hero-cinematic-title">{product.name}</h1>
              <p className="hero-cinematic-copy">{presentation.heroCopy}</p>
              <Link href={`/products/${product.slug}`} className="hero-inline-link">
                View full details →
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Centre — the stage */}
        <motion.div
          className="hero-stage"
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {knives.map((entry, index) => {
            const offset = relativeOffset(index, active, length);
            const isActive = offset === 0;
            const isNeighbour = Math.abs(offset) === 1;
            const visible = Math.abs(offset) <= 1;

            return (
              <motion.div
                key={entry.product.slug}
                className="hero-slide"
                data-role={isActive ? "active" : isNeighbour ? "neighbour" : "hidden"}
                animate={{
                  x: `${offset * 34}%`,
                  scale: isActive ? 1 : 0.68,
                  opacity: isActive ? 1 : isNeighbour ? 0.34 : 0,
                  filter: isActive
                    ? "blur(0px) brightness(1) saturate(1)"
                    : "blur(3px) brightness(0.62) saturate(0.55)",
                  rotateY: reducedMotion ? 0 : offset * -12,
                  zIndex: isActive ? 3 : 2 - Math.abs(offset),
                }}
                transition={spring}
                style={{ pointerEvents: visible ? "auto" : "none" }}
                aria-hidden={!isActive}
              >
                {isActive ? (
                  <button
                    ref={inspectTrigger}
                    type="button"
                    className="hero-slide-button"
                    onClick={openInspection}
                    aria-label={`Take a closer look at ${entry.product.name}`}
                  >
                    <motion.div
                      layoutId={reducedMotion ? undefined : `hero-knife-${entry.product.slug}`}
                      style={{
                        rotate: entry.presentation.imageRotation,
                        scale: entry.presentation.imageScale,
                      }}
                    >
                      <Image
                        src={entry.presentation.cutoutSrc}
                        alt={`${entry.product.name} — ${entry.product.steel} blade with ${entry.product.handleMaterial} handle`}
                        width={entry.presentation.cutoutWidth}
                        height={entry.presentation.cutoutHeight}
                        className="hero-knife-img"
                        preload={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 900px) 70vw, 38vw"
                      />
                    </motion.div>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="hero-slide-button hero-slide-button--preview"
                    onClick={() => goTo(index)}
                    tabIndex={visible ? 0 : -1}
                    aria-label={`Show ${entry.product.name}`}
                  >
                    <div
                      style={{
                        rotate: `${entry.presentation.imageRotation}deg`,
                        scale: entry.presentation.imageScale,
                      }}
                    >
                      <Image
                        src={entry.presentation.cutoutSrc}
                        alt=""
                        width={entry.presentation.cutoutWidth}
                        height={entry.presentation.cutoutHeight}
                        className="hero-knife-img"
                        loading="lazy"
                        sizes="24vw"
                      />
                    </div>
                  </button>
                )}
              </motion.div>
            );
          })}

          <div className="hero-stage-shadow" aria-hidden="true" />
        </motion.div>

        {/* Right column — commerce */}
        <div className="hero-col hero-col--buy">
          <AnimatePresence mode="wait">
            <motion.div
              key={`buy-${product.slug}`}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 26 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -26 }}
              transition={{ duration: reducedMotion ? 0.18 : 0.45, ease: "easeOut" }}
            >
              <p className="hero-category">{CATEGORY_LABELS[product.category]}</p>
              <p className="hero-price">{formatPrice(product.price)}</p>

              <dl className="hero-specs">
                {specs.map((row) => (
                  <div key={row.label} className="hero-spec">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              <p className={product.inStock ? "hero-stock" : "hero-stock hero-stock--out"}>
                {product.inStock ? "In stock" : "Sold out"}
              </p>

              <div className="hero-actions">
                <button type="button" className="hero-btn hero-btn--primary" onClick={openInspection}>
                  Inspect Knife
                </button>
                <button
                  type="button"
                  className="hero-btn hero-btn--secondary"
                  onClick={addToCart}
                  disabled={!product.inStock}
                >
                  {addState === "added" ? "Added ✓" : "Add to Cart"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="hero-controls">
        <button type="button" className="hero-arrow" onClick={() => step(-1)} aria-label="Previous knife">
          ←
        </button>

        <p className="hero-index">
          <TorosMountainMark className="hero-index-mark" />
          <span className="hero-index-current">{String(active + 1).padStart(2, "0")}</span>
          <span className="hero-index-sep">/</span>
          <span className="hero-index-total">{String(length).padStart(2, "0")}</span>
        </p>

        <button type="button" className="hero-arrow" onClick={() => step(1)} aria-label="Next knife">
          →
        </button>
      </div>

      {/* Selection changes are announced once, not on every frame. */}
      <p className="sr-only" aria-live="polite">
        {`${product.name}, ${active + 1} of ${length}`}
      </p>

      {addState === "added" ? (
        <p className="sr-only" role="status">
          {`${product.name} added to the demo cart. ${cartCount} item${cartCount === 1 ? "" : "s"} total.`}
        </p>
      ) : null}

      <AnimatePresence>
        {inspecting ? (
          <KnifeInspectionDialog
            knife={knife}
            reducedMotion={reducedMotion}
            addState={addState}
            onAddToCart={addToCart}
            onClose={() => {
              setInspecting(false);
              inspectTrigger.current?.focus();
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
