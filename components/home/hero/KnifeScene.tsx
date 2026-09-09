"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { HeroKnifePresentation } from "@/components/home/hero/hero-knives";

interface KnifeSceneProps {
  presentation: HeroKnifePresentation;
  reducedMotion: boolean;
  /** Rendered eagerly for the first knife only; the rest fade in on demand. */
  eager: boolean;
  /** -1 or 1 — the scene drifts against the direction of travel. */
  direction: 1 | -1;
}

/**
 * The world behind one knife, composited from separate depth layers so the
 * product sits *inside* a scene instead of on top of a backdrop:
 *
 *   plate      far background — sky, wall, air
 *   atmosphere a CSS haze pass that ties the plates into the page
 *   mid        middle ground — terrain, bench, anvil
 *   key        the scene's directional light, agreeing with the plates
 *
 * The matching foreground layer is rendered by the hero itself, because it has
 * to sit *above* the knife to overlap it. Each layer moves a different amount
 * on a change, which is what reads as depth rather than a crossfade.
 */
export function KnifeScene({ presentation, reducedMotion, eager, direction }: KnifeSceneProps) {
  const { scene, accent, accentSecondary } = presentation;

  const enter = (parallax: number) =>
    reducedMotion
      ? { opacity: 0 }
      : { opacity: 0, x: direction * parallax, scale: 1.04 };

  const settled = { opacity: 1, x: 0, scale: 1 };

  const exit = (parallax: number) =>
    reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -parallax, scale: 1.02 };

  const timing = { duration: reducedMotion ? 0.22 : 0.85, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <motion.div
      key={presentation.slug}
      className="hero-scene"
      style={
        {
          "--knife-accent": accent,
          "--knife-accent-secondary": accentSecondary,
          "--key-x": `${50 + scene.keyX * 34}%`,
          "--key-y": `${50 - scene.keyY * 30}%`,
          "--key-strength": scene.keyStrength,
        } as React.CSSProperties
      }
      initial={enter(0)}
      animate={settled}
      exit={exit(0)}
      transition={timing}
      aria-hidden="true"
    >
      {/* Far background moves least — aerial perspective. */}
      <motion.div
        className="hero-scene-layer hero-scene-layer--plate"
        initial={enter(14)}
        animate={settled}
        exit={exit(14)}
        transition={timing}
      >
        <Image
          src={scene.plate}
          alt=""
          fill
          sizes="100vw"
          className="hero-scene-img"
          preload={eager}
          loading={eager ? "eager" : "lazy"}
        />
      </motion.div>

      <div className="hero-scene-atmosphere" />

      {/* Middle ground moves more, and sits on the horizon. */}
      <motion.div
        className="hero-scene-layer hero-scene-layer--mid"
        initial={enter(44)}
        animate={settled}
        exit={exit(44)}
        transition={timing}
      >
        <Image
          src={scene.mid}
          alt=""
          fill
          sizes="100vw"
          className="hero-scene-img"
          loading={eager ? "eager" : "lazy"}
        />
      </motion.div>

      <div className="hero-scene-key" />
      <div className="hero-scene-floor" />
    </motion.div>
  );
}

/**
 * The near layer. Split out from `KnifeScene` because it has to be stacked
 * above the product to overlap it, which means a separate node in the hero.
 */
export function KnifeSceneForeground({
  presentation,
  reducedMotion,
  direction,
}: Omit<KnifeSceneProps, "eager">) {
  return (
    <motion.div
      key={`fore-${presentation.slug}`}
      className="hero-scene-fore"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * 90, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: direction * -90, y: 10 }}
      transition={{ duration: reducedMotion ? 0.22 : 0.85, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <Image
        src={presentation.scene.fore}
        alt=""
        fill
        sizes="100vw"
        className="hero-scene-img"
        loading="lazy"
      />
    </motion.div>
  );
}
