"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Hands the hero off to the category experience as the visitor scrolls.
 *
 * The hero is sticky, so what follows slides up over it rather than pushing it
 * away, and the hero loses emphasis as it goes — a little smaller, a little
 * darker, its secondary interface fading out. Scrolling back reverses it.
 *
 * Deliberately no wheel handler, no scroll snapping, no scroll jacking. This
 * reads the scroll position the browser already has and maps it to transform
 * and opacity; native scrolling, keyboard paging and scrollbar dragging all
 * behave exactly as they normally would, because nothing intercepts them.
 */
export function HeroStage({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);
  const dim = useTransform(scrollYProgress, [0, 0.85], [0, 0.62]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  return (
    <div ref={ref} className="hero-stage-outer">
      <motion.div
        className="hero-stage-sticky"
        style={reducedMotion ? undefined : { scale }}
      >
        {children}

        {/* Darkens the hero as the catalogue takes over, so the two are never
            competing for attention at the same brightness. */}
        <motion.div
          className="hero-handoff-dim"
          aria-hidden="true"
          style={reducedMotion ? { opacity: 0 } : { opacity: dim }}
        />

        <motion.p
          className="hero-scroll-cue"
          aria-hidden="true"
          style={reducedMotion ? undefined : { opacity: cueOpacity }}
        >
          <span>Scroll to explore</span>
          <span className="hero-scroll-cue-line" />
        </motion.p>
      </motion.div>
    </div>
  );
}
