"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import type { RailCategory } from "@/components/home/category/category-data";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { ProductCategory } from "@/types/product";

interface CategoryRailProps {
  categories: RailCategory[];
}

/**
 * How many times the category sequence repeats inside one "set". One set has
 * to be wider than the widest viewport we support, or the loop shows a gap at
 * 1920. Four categories at ~320px is ~1.4k; doubling clears 1920 comfortably.
 */
const REPEATS_PER_SET = 2;

export function CategoryRail({ categories }: CategoryRailProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [open, setOpen] = useState<ProductCategory | null>(null);
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = categories.find((c) => c.category === open) ?? null;

  function toggle(category: ProductCategory) {
    // Re-picking the open category closes it; picking another swaps content.
    setOpen((current) => (current === category ? null : category));
  }

  // The track holds two identical sets and slides by exactly one set width, so
  // the frame where it resets is pixel-identical to the frame before it. That
  // is what makes the loop seamless rather than a jump nobody can quite see.
  const oneSet = Array.from({ length: REPEATS_PER_SET }).flatMap(() => categories);
  const track = [...oneSet, ...oneSet];

  return (
    <section className="cat" aria-labelledby="cat-heading">
      {/* The belt is the section. There is no visible heading and no intro
          block: a title and a lead above it turned a strip of navigation into
          a third homepage band, with its own rules above and below. The
          categories are legible on the cards themselves, so the accessible
          name is all that is left. */}
      <h2 id="cat-heading" className="sr-only">
        Knife categories
      </h2>

      <div className="cat-rail" data-reduced={reducedMotion || undefined}>
        <ul className="cat-track">
          {track.map((entry, i) => {
            // Only the first pass is real to assistive tech and the keyboard.
            // The rest exist to fill the loop, and 16 repeated focus stops
            // announcing the same four categories would be noise.
            const isPrimary = i < categories.length;
            return (
              <li key={`${entry.category}-${i}`} className="cat-item">
                <button
                  type="button"
                  className="cat-card"
                  data-active={open === entry.category || undefined}
                  onClick={() => toggle(entry.category)}
                  aria-expanded={isPrimary ? open === entry.category : undefined}
                  aria-controls={isPrimary ? panelId : undefined}
                  aria-hidden={!isPrimary}
                  tabIndex={isPrimary ? 0 : -1}
                >
                  <span className="cat-card-top">
                    <span className="cat-card-name">{entry.label}</span>
                    <span className="cat-card-cue" aria-hidden="true">
                      {/* A direction, not a word: the belt is slim enough that
                          "Open" and "Close" cost a line the card cannot spare. */}
                      <svg viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 4.5L6 8l3.5-3.5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </span>
                  <span className="cat-card-desc">{entry.description}</span>
                  <span className="cat-card-count">
                    {entry.count} {entry.count === 1 ? "knife" : "knives"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        id={panelId}
        ref={panelRef}
        className="cat-panel-wrap"
        role="region"
        aria-label={selected ? `${selected.label} products` : undefined}
      >
        <AnimatePresence initial={false} mode="wait">
          {selected ? (
            <motion.div
              key={selected.category}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="cat-panel"
            >
              <div className="page-container cat-panel-inner">
                <div className="cat-panel-head">
                  <div>
                    <h3 className="t-h3">{selected.label}</h3>
                    <p className="t-meta cat-panel-desc">{selected.description}</p>
                  </div>
                  <Link href={selected.href} className="link cat-panel-all">
                    View all {selected.count} {selected.label.toLowerCase()}
                  </Link>
                </div>

                <div className="cat-panel-grid">
                  {selected.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
