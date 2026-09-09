"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { RIG_TEST_SPIN, type HeroKnife } from "@/components/home/hero/hero-knives";
import { KnifeScene, KnifeSceneForeground } from "@/components/home/hero/KnifeScene";
import { KnifeInspectionDialog } from "@/components/home/hero/KnifeInspectionDialog";
import { SpinViewer } from "@/components/home/hero/SpinViewer";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useRigTestMode } from "@/lib/use-rig-test";
import { demoCartAdapter } from "@/lib/demo-cart";
import { formatPrice } from "@/lib/products";

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

/**
 * Where a slide sits for a given offset from centre.
 *
 * Used for both `initial` and `animate` so the very first paint — server HTML
 * included — already has final coordinates. Without this the seven knives
 * render stacked at the centre for a frame before the carousel settles.
 */
function slidePose(offset: number, flat: boolean) {
  const isActive = offset === 0;
  const isNeighbour = Math.abs(offset) === 1;
  return {
    x: `${offset * 58}%`,
    scale: isActive ? 1 : 0.54,
    // Neighbours stay recognisable rather than being crushed to silhouettes,
    // but far enough out that they never sit under the copy or the price.
    opacity: isActive ? 1 : isNeighbour ? 0.46 : 0,
    filter: isActive
      ? "blur(0px) brightness(1) saturate(1)"
      : "blur(2.5px) brightness(0.74) saturate(0.7)",
    rotateY: flat ? 0 : offset * -11,
    zIndex: isActive ? 3 : 2 - Math.abs(offset),
  };
}

const STEP_LOCK_MS = 340;
const DRAG_DISTANCE = 70;
const DRAG_VELOCITY = 320;
const TAP_SLOP = 6;
/** Slides kept mounted either side of centre: one visible, one warming up. */
const MOUNT_RADIUS = 2;

export function FeaturedKnifeHero({ knives }: FeaturedKnifeHeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rigTest = useRigTestMode();
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

  // The active knife turns in place when it has turntable frames. Navigation
  // then moves to the arrows and the side knives, because a horizontal drag on
  // the stage cannot mean "rotate this knife" and "go to the next one" at once.
  const spin = rigTest ? RIG_TEST_SPIN : presentation.spin;

  // Rapid clicks and flicks are absorbed rather than queued, so the knife,
  // scene, copy and index can never drift out of step with each other.
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
    setCartCount(demoCartAdapter.count(next)); // read back only after a write
    setAddState("added");
  }, [product]);

  // Two facts, not a spec sheet. The full table lives on the product page.
  const facts = useMemo(
    () =>
      [
        { label: "Steel", value: product.steel },
        { label: "Overall", value: product.totalLength },
      ].filter((row) => row.value && row.value !== "N/A"),
    [product],
  );

  const spring = reducedMotion
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 120, damping: 22, mass: 0.9 };

  const copyMotion = {
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 },
    transition: { duration: reducedMotion ? 0.18 : 0.42, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section
      className="hero"
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
      <AnimatePresence initial={false} mode="sync">
        <KnifeScene
          key={presentation.slug}
          presentation={presentation}
          reducedMotion={reducedMotion}
          direction={direction}
          eager={active === 0}
        />
      </AnimatePresence>

      <div className="hero-grid">
        {/* Left — the cinematic line */}
        <div className="hero-col hero-col--story">
          <AnimatePresence mode="wait">
            <motion.div key={`story-${product.slug}`} {...copyMotion}>
              <p className="eyebrow">{presentation.eyebrow}</p>
              <h1 className="hero-title">{product.name}</h1>
              <p className="hero-line">{presentation.heroCopy}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Centre — the stage */}
        <motion.div
          className="hero-stage"
          data-spinning={spin ? true : undefined}
          drag={spin ? false : "x"}
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
            const pose = slidePose(offset, reducedMotion);

            // Far slides stay unmounted; one beyond the visible neighbours is
            // kept so the next cutout is already decoded when it steps in.
            if (Math.abs(offset) > MOUNT_RADIUS) return null;

            const image = (
              <Image
                src={entry.presentation.cutoutSrc}
                alt={
                  isActive
                    ? `${entry.product.name}: ${entry.product.steel} blade with a ${entry.product.handleMaterial} handle`
                    : ""
                }
                width={entry.presentation.cutoutWidth}
                height={entry.presentation.cutoutHeight}
                className="hero-knife-img"
                /* The active knife is the LCP element. `preload` is not used
                   here: a slide's index is fixed but its offset is not, so a
                   preloaded slide would end up `loading="lazy"` after one step
                   and Next rejects that pair. Eager loading plus a high fetch
                   priority is the documented equivalent for this case. */
                loading={Math.abs(offset) <= 1 ? "eager" : "lazy"}
                fetchPriority={isActive ? "high" : "auto"}
                sizes="(max-width: 900px) 76vw, 42vw"
              />
            );

            return (
              <motion.div
                key={entry.product.slug}
                className="hero-slide"
                data-role={isActive ? "active" : "neighbour"}
                initial={pose}
                animate={pose}
                transition={spring}
              >
                {isActive && spin ? (
                  <SpinViewer
                    spin={spin}
                    alt={`${entry.product.name}: ${entry.product.steel} blade with a ${entry.product.handleMaterial} handle`}
                    className="hero-spin"
                    poster={entry.presentation.cutoutSrc}
                    onTap={openInspection}
                  />
                ) : isActive ? (
                  <button
                    ref={inspectTrigger}
                    type="button"
                    className="hero-slide-button hero-slide-button--active"
                    onClick={openInspection}
                    aria-label={`Take a closer look at ${entry.product.name}`}
                  >
                    <motion.div
                      className="hero-knife-wrap"
                      layoutId={reducedMotion ? undefined : `hero-knife-${entry.product.slug}`}
                      style={{
                        rotate: entry.presentation.imageRotation,
                        scale: entry.presentation.imageScale,
                      }}
                    >
                      {image}
                    </motion.div>
                    <span className="hero-focus-hint" aria-hidden="true">
                      Press Enter for a closer look
                    </span>
                  </button>
                ) : (
                  // The neighbours are their own selection targets. The side
                  // zones cannot cover a knife that is being dragged, so
                  // without this there is no way to pick the next knife by
                  // pointing at it — only the arrows.
                  <button
                    type="button"
                    className="hero-slide-button hero-slide-button--neighbour"
                    onClick={() => step(offset > 0 ? 1 : -1)}
                    tabIndex={-1}
                    aria-label={`Show ${entry.product.name}`}
                  >
                    <div
                      className="hero-knife-wrap"
                      style={{
                        rotate: `${entry.presentation.imageRotation}deg`,
                        scale: entry.presentation.imageScale,
                      }}
                    >
                      {image}
                    </div>
                  </button>
                )}
              </motion.div>
            );
          })}

          {/* Deterministic navigation targets over the outer thirds. The active
              cutout is a transparent PNG whose box is far wider than the knife,
              so hit-testing must not depend on it.

              They are dropped once the knife turns. The active slide sits in
              its own stacking context, so a zone layered above it swallows the
              drag before the turntable ever sees it — and a knife you can only
              grab in its middle third feels broken. Navigation is then the
              arrows and the keyboard, which are always available. */}
          {!spin ? (
            <>
              <button
                type="button"
                className="hero-side-zone hero-side-zone--prev"
                onClick={() => step(-1)}
                aria-label={`Show ${knives[cycle(active - 1, length)].product.name}`}
              />
              <button
                type="button"
                className="hero-side-zone hero-side-zone--next"
                onClick={() => step(1)}
                aria-label={`Show ${knives[cycle(active + 1, length)].product.name}`}
              />
            </>
          ) : null}

          <div className="hero-contact-shadow" aria-hidden="true" />
        </motion.div>

        {/* Right — price, two facts, the actions */}
        <div className="hero-col hero-col--buy">
          <AnimatePresence mode="wait">
            <motion.div key={`buy-${product.slug}`} {...copyMotion}>
              <p className="t-price hero-price">{formatPrice(product.price)}</p>

              <dl className="hero-facts">
                {facts.map((row) => (
                  <div key={row.label} className="hero-fact">
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>

              {!product.inStock ? <p className="hero-sold">Sold out</p> : null}

              <div className="hero-actions">
                <button type="button" className="btn btn--primary" onClick={openInspection}>
                  Take a closer look
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={addToCart}
                  disabled={!product.inStock}
                >
                  {addState === "added" ? "Added" : "Add to cart"}
                </button>
              </div>

              <Link href={`/products/${product.slug}`} className="link hero-full-link">
                Full details
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Near layer — above the knife, so it genuinely overlaps it. */}
      <AnimatePresence initial={false} mode="sync">
        <KnifeSceneForeground
          key={`fore-${presentation.slug}`}
          presentation={presentation}
          reducedMotion={reducedMotion}
          direction={direction}
        />
      </AnimatePresence>

      <div className="hero-controls">
        <button
          type="button"
          className="btn btn--icon hero-arrow"
          onClick={() => step(-1)}
          aria-label="Previous knife"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="hero-index">
          <span className="hero-index-current">{String(active + 1).padStart(2, "0")}</span>
          <span className="hero-index-rule" aria-hidden="true" />
          <span>{String(length).padStart(2, "0")}</span>
        </p>

        <button
          type="button"
          className="btn btn--icon hero-arrow"
          onClick={() => step(1)}
          aria-label="Next knife"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
