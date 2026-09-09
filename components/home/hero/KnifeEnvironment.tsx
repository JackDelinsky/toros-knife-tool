"use client";

import { motion } from "framer-motion";
import type { HeroKnifePresentation } from "@/components/home/hero/hero-knives";

interface KnifeEnvironmentProps {
  presentation: HeroKnifePresentation;
  reducedMotion: boolean;
}

/**
 * Per-product backdrop, composed from CSS gradient layers rather than seven
 * unrelated illustrations: one shared charcoal foundation, then accent light,
 * ground haze and a texture pass tuned per knife. Layers crossfade on change
 * and then settle — nothing loops forever.
 */
export function KnifeEnvironment({ presentation, reducedMotion }: KnifeEnvironmentProps) {
  const { accent, accentSecondary, environmentVariant } = presentation;

  return (
    <motion.div
      key={presentation.slug}
      className="hero-env"
      data-variant={environmentVariant}
      style={
        {
          "--knife-accent": accent,
          "--knife-accent-secondary": accentSecondary,
        } as React.CSSProperties
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.2 : 0.75, ease: "easeOut" }}
      aria-hidden="true"
    >
      {/* Key light, thrown from the direction that suits each scene. */}
      <div className="hero-env-key" />
      {/* Ground haze so the knife has something to stand in. */}
      <div className="hero-env-ground" />
      {/* Material texture pass — grain, grit or stone depending on variant. */}
      <div className="hero-env-texture" />
      {/* Quiet ridge line, the Toros signature carried into the backdrop. */}
      <div className="hero-env-ridge" />
    </motion.div>
  );
}
