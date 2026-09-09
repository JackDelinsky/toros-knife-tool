import { FeaturedKnifeHero } from "@/components/home/hero/FeaturedKnifeHero";
import { getHeroKnives } from "@/components/home/hero/hero-knives";

/**
 * Server wrapper: resolves the canonical product records once, then hands the
 * carousel state, gestures and dialog to a focused client island so the rest of
 * the homepage stays a Server Component.
 */
export function Hero() {
  const knives = getHeroKnives();

  if (knives.length === 0) return null;

  return <FeaturedKnifeHero knives={knives} />;
}
