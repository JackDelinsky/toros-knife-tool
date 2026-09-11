"use client";

import { motion } from "framer-motion";
import type { HeroSceneDef } from "@/lib/hero-scenes";

interface KnifeSceneProps {
  scene: HeroSceneDef;
  reducedMotion: boolean;
  /** True while the visitor is handling the knife: the light steadies. */
  engaged: boolean;
}

/**
 * The field the knife is presented against.
 *
 * Entirely CSS — no raster plates, nothing to download, nothing to go soft.
 * Three passes, back to front: a ground that varies per product, one warm key
 * behind the product in the product's own accent, and a vignette that closes
 * the frame. Grain sits over all of it so the gradients never band.
 *
 * There is deliberately no horizon, no surface texture and no photograph. The
 * previous version enlarged a crop of the knife's own product photo to fill
 * the hero; it was soft, it seamed across the middle, and the knife floated on
 * the join. A studio field that admits what it is beats a landscape that does
 * not survive being looked at. `docs/hero-environment-asset-brief.md` is what
 * a real plate has to clear before it replaces this.
 */
export function KnifeScene({ scene, reducedMotion, engaged }: KnifeSceneProps) {
  return (
    <motion.div
      className="hero-scene"
      data-engaged={engaged || undefined}
      style={
        {
          "--knife-accent": scene.accent,
          "--scene-ground": scene.ground,
          "--key-x": `${scene.keyX}%`,
          "--key-y": `${scene.keyY}%`,
          "--key-strength": scene.keyStrength,
        } as React.CSSProperties
      }
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.2 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <div className="hero-ground" />
      <div className="hero-key" />
      <div className="hero-vignette" />
      <div className="hero-grain" />
    </motion.div>
  );
}
