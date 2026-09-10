"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { type HeroKnife } from "@/components/home/hero/hero-knives";
import { KnifeScene, KnifeSceneForeground } from "@/components/home/hero/KnifeScene";
import { ProductViewer } from "@/components/product/viewer/ProductViewer";
import { useQuickInspect } from "@/components/product/QuickInspectProvider";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import { useRigTestMode } from "@/lib/use-rig-test";
import { RIG_TEST_MEDIA, getProductMedia } from "@/lib/product-media";
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
/** Slides kept mounted either side of centre: one visible, one warming up. */
const MOUNT_RADIUS = 2;

export function FeaturedKnifeHero({ knives }: FeaturedKnifeHeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rigTest = useRigTestMode();
  const length = knives.length;

  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [addState, setAddState] = useState<"idle" | "added">("idle");
  const [cartCount, setCartCount] = useState(0);
  // The cue is long until the visitor has actually moved a knife, then short.
  const [handled, setHandled] = useState(false);

  const lockedUntil = useRef(0);

  const knife = knives[active];
  const { presentation, product } = knife;

  const inspect = useQuickInspect();
  // What this knife can honestly show, decided in lib/product-media.ts.
  const media = rigTest ? RIG_TEST_MEDIA : getProductMedia(product);

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
      // The viewer stops its own arrow keys from reaching here, so arrows on
      // the knife turn the knife and arrows anywhere else change knife.
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    },
    [step],
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      if (offset.x < -DRAG_DISTANCE || velocity.x < -DRAG_VELOCITY) step(1);
      else if (offset.x > DRAG_DISTANCE || velocity.x > DRAG_VELOCITY) step(-1);
    },
    [step],
  );

  // No drag guard here. A drag on the knife is resolved inside the viewer,
  // which only reports a tap when the pointer did not move; a drag on the
  // stage never calls this at all. Gating on a "did we just drag" ref meant
  // one drag disabled the button until the next drag started.
  const openInspection = useCallback(() => {
    inspect?.open(product.slug);
  }, [inspect, product.slug]);

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
        <div className="hero-stage">
          {/* The carousel's swipe lives on its own layer *behind* the knives,
              not on their container. Framer binds a native listener to the
              element it drags, and a native listener on an ancestor fires
              before React's delegated handlers — so a child calling
              stopPropagation cannot stop it, and every drag on the knife
              turned into "next knife". Separate layers need no arbitration:
              the knife takes what lands on the knife, this takes the rest. */}
          <motion.div
            className="hero-swipe"
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            aria-hidden="true"
          />
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
                {isActive ? (
                  <div
                    className="hero-handle"
                    // Purely to shorten the cue once the visitor has moved a
                    // knife; the gesture itself is the viewer's business.
                    onPointerDown={() => setHandled(true)}
                  >
                    <ProductViewer
                      media={media}
                      alt={`${entry.product.name}: ${entry.product.steel} blade with a ${entry.product.handleMaterial} handle`}
                      className="hero-viewer"
                      size="compact"
                      onTap={openInspection}
                    />
                  </div>
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

          <div className="hero-contact-shadow" aria-hidden="true" />
        </div>

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

        <p className="hero-cue" aria-hidden="true">
          {handled ? "Arrows change knife" : "Drag to inspect · arrows change knife"}
        </p>

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

    </section>
  );
}
