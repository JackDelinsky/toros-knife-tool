"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { HeroSceneDef } from "@/lib/hero-scenes";

interface KnifeSceneProps {
  scene: HeroSceneDef;
  reducedMotion: boolean;
  /** Rendered eagerly for the first knife only; the rest load on demand. */
  eager: boolean;
  /** -1 or 1 — layers drift against the direction of travel. */
  direction: 1 | -1;
  /** True while the visitor is handling the knife: the world calms down. */
  engaged: boolean;
}

/**
 * The world behind one knife, in separate depth layers.
 *
 *   sky      the light behind everything
 *   far      the background, thrown far out of focus
 *   mid      the middle distance, and wherever the scene's accent lives
 *   surface  the log the knife rests on — the sharpest thing in the frame
 *
 * The foreground is rendered by the hero itself, because it has to sit *above*
 * the product to cross in front of it.
 *
 * Each layer enters by a different distance, which is what reads as depth
 * rather than a crossfade, and carries its own slow ambient animation. The
 * animations are CSS, keyed to the scene, so revisiting a knife restarts its
 * world from the opening state rather than resuming mid-cycle.
 */
export function KnifeScene({ scene, reducedMotion, eager, direction, engaged }: KnifeSceneProps) {
  const enter = (parallax: number) =>
    reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * parallax, scale: 1.03 };
  const settled = { opacity: 1, x: 0, scale: engaged && !reducedMotion ? 1.015 : 1 };
  const exit = (parallax: number) =>
    reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -parallax, scale: 1.02 };

  // Inside the brief's 0.9-1.3s budget, and the same easing for every scene so
  // seven worlds still feel like one site.
  const timing = { duration: reducedMotion ? 0.22 : 1.0, ease: [0.22, 1, 0.36, 1] as const };

  const ambient = (layer: HeroSceneDef["ambient"][number]["layer"]) => {
    const m = scene.ambient.find((a) => a.layer === layer);
    if (!m || reducedMotion) return undefined;
    return {
      animationName: `amb-${m.kind}`,
      animationDuration: `${m.duration}s`,
      "--amb": `${m.amount}%`,
    } as React.CSSProperties;
  };

  return (
    <motion.div
      className="hero-scene"
      data-engaged={engaged || undefined}
      style={
        {
          "--knife-accent": scene.accent,
          "--surface-tone": scene.surfaceTone,
          "--key-x": `${scene.lightX * 100}%`,
          "--key-y": `${(1 - scene.lightY) * 100}%`,
          "--key-strength": scene.lightStrength,
          // --surface-y is deliberately NOT set here. The hero measures where
          // the knife's feet actually land and writes it there; an inline
          // value on this element would win and pin the line to a constant.
        } as React.CSSProperties
      }
      initial={enter(0)}
      animate={settled}
      exit={exit(0)}
      transition={timing}
      aria-hidden="true"
    >
      <motion.div
        className="hero-layer hero-layer--sky"
        initial={enter(8)}
        animate={settled}
        exit={exit(8)}
        transition={timing}
        style={ambient("sky")}
      >
        <Image src={scene.sky} alt="" fill sizes="100vw" className="hero-layer-img"
               priority={eager} loading={eager ? "eager" : "lazy"} />
      </motion.div>

      <motion.div
        className="hero-layer hero-layer--far"
        initial={enter(18)}
        animate={settled}
        exit={exit(18)}
        transition={timing}
        style={ambient("far")}
      >
        <Image src={scene.far} alt="" fill sizes="100vw" className="hero-layer-img"
               loading={eager ? "eager" : "lazy"} />
      </motion.div>

      <motion.div
        className="hero-layer hero-layer--mid"
        initial={enter(34)}
        animate={settled}
        exit={exit(34)}
        transition={timing}
        style={ambient("mid")}
      >
        <Image src={scene.mid} alt="" fill sizes="100vw" className="hero-layer-img"
               loading={eager ? "eager" : "lazy"} />
      </motion.div>

      {/* The scene's own light, agreeing with the direction measured from the
          photograph the plates were built from. */}
      <div className="hero-key" />

      {/* Shading for the copy columns only — the middle of the frame keeps
          its full brightness. */}
      <div className="hero-readability" />

      <motion.div
        className="hero-layer hero-layer--surface"
        initial={enter(52)}
        animate={settled}
        exit={exit(52)}
        transition={timing}
        style={ambient("surface")}
      >
        <Image src={scene.surface} alt="" fill sizes="100vw" className="hero-layer-img"
               loading={eager ? "eager" : "lazy"} />
      </motion.div>
    </motion.div>
  );
}

/**
 * The near layer, above the product so it can cross in front of it.
 *
 * It fades out the moment the knife is picked up: a blade half-covered by
 * grass is fine while the knife is resting, and unacceptable while someone is
 * trying to look at it.
 */
export function KnifeSceneForeground({
  scene,
  reducedMotion,
  direction,
  engaged,
}: Omit<KnifeSceneProps, "eager">) {
  const motionDef = scene.ambient.find((a) => a.layer === "fore");
  return (
    <motion.div
      className="hero-fore"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 70, y: 8 }}
      animate={{ opacity: engaged ? 0 : 1, x: 0, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -70, y: 8 }}
      transition={{ duration: reducedMotion ? 0.22 : engaged ? 0.4 : 1.0, ease: [0.22, 1, 0.36, 1] }}
      style={
        motionDef && !reducedMotion
          ? ({
              animationName: `amb-${motionDef.kind}`,
              animationDuration: `${motionDef.duration}s`,
              "--amb": `${motionDef.amount}%`,
            } as React.CSSProperties)
          : undefined
      }
      aria-hidden="true"
    >
      <Image src={scene.fore} alt="" fill sizes="100vw" className="hero-layer-img" loading="lazy" />
    </motion.div>
  );
}
