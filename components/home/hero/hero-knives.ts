import type { Product } from "@/types/product";
import { getProductBySlug } from "@/lib/products";

/**
 * Presentation-only model for the cinematic hero.
 *
 * Canonical product facts (price, steel, dimensions, stock, descriptions) live
 * in `data/products.ts` and are resolved through `getProductBySlug`. Nothing
 * here duplicates them — this file holds staging data only: which cutout to
 * show, how it sits on the stage, and the scene it is placed into.
 *
 * This is the single place the seven scenes are configured. Adding an eighth
 * knife is a new entry here plus its plates; it never means another branch in
 * JSX or another `[data-variant]` rule in CSS.
 */

/**
 * A knife's world, as separately-composited layers.
 *
 * The plates are rendered by `scripts/build-hero-scenes.py` — procedural
 * terrain, light and material, never a generated knife. The real photographed
 * cutout is composited between `mid` and `fore` at runtime, so the product is
 * the only thing in the frame that came from a camera and it is never altered.
 */
export interface HeroScene {
  /** Far background: sky, wall, air. */
  plate: string;
  /** Middle ground: terrain, bench, anvil. Transparent above the horizon. */
  mid: string;
  /** Near element that overlaps the base of the product. */
  fore: string;
  /**
   * Unit vector the key light travels along, used for the runtime lighting
   * wash so the CSS light agrees with the light baked into the plates.
   */
  keyX: number;
  keyY: number;
  /** Strength of that wash, 0-1. Bright scenes need less. */
  keyStrength: number;
  /** One line describing the world, for the asset brief. */
  summary: string;
}

/** Whether the current cutout is good enough to ship at hero scale. */
export type HeroAssetStatus = "ready" | "needs-reshoot";

export interface HeroKnifePresentation {
  slug: string;
  /** Small label above the product name. */
  eyebrow: string;
  /** Cinematic marketing line — separate from the canonical descriptions. */
  heroCopy: string;
  cutoutSrc: string;
  cutoutWidth: number;
  cutoutHeight: number;
  /** Degrees; negative rotates counter-clockwise (lifts the blade tip). */
  imageRotation: number;
  imageScale: number;
  accent: string;
  accentSecondary: string;
  scene: HeroScene;
  assetStatus: HeroAssetStatus;
  /** Why an asset is flagged, surfaced in docs/hero-asset-audit.md. */
  assetNote?: string;
}

/**
 * Display order. Accents are sampled from each knife's own materials rather
 * than invented, so the seven scenes stay inside one Toros world.
 */
export const HERO_KNIVES: readonly HeroKnifePresentation[] = [
  {
    slug: "toros-jellybean",
    eyebrow: "Mystery Jellybean Series",
    heroCopy: "Pocket-sized neck carry, sealed in stabilized epoxy.",
    cutoutSrc: "/images/hero/knives/toros-jellybean.png",
    cutoutWidth: 272,
    cutoutHeight: 866,
    imageRotation: -14,
    imageScale: 0.92,
    accent: "#3f9bb5",
    accentSecondary: "#1f6f8b",
    scene: {
      plate: "/images/hero/scenes/toros-jellybean-plate.webp",
      mid: "/images/hero/scenes/toros-jellybean-mid.webp",
      fore: "/images/hero/scenes/toros-jellybean-fore.webp",
      keyX: 0.42,
      keyY: 0.91,
      keyStrength: 0.34,
      summary:
        "Charred walnut log on a mossy forest floor, lit by a cool canopy gap with one warm edge from the right.",
    },
    assetStatus: "needs-reshoot",
    assetNote:
      "Smallest source region of the seven (136x433 before a 2x resample); one of three colourways in a shared photo.",
  },
  {
    slug: "bos-stag-golden-horn",
    eyebrow: "Fixed Blades",
    heroCopy: "N690 steel set into real antler and brass.",
    cutoutSrc: "/images/hero/knives/bos-stag-golden-horn.png",
    cutoutWidth: 810,
    cutoutHeight: 516,
    imageRotation: -38,
    imageScale: 1,
    accent: "#c4a574",
    accentSecondary: "#8a6a33",
    scene: {
      plate: "/images/hero/scenes/bos-stag-golden-horn-plate.webp",
      mid: "/images/hero/scenes/bos-stag-golden-horn-mid.webp",
      fore: "/images/hero/scenes/bos-stag-golden-horn-fore.webp",
      keyX: -0.28,
      keyY: 0.96,
      keyStrength: 0.30,
      summary:
        "Three receding Taurus ridgelines with a low amber sunrise behind them and dust suspended at each depth.",
    },
    assetStatus: "ready",
  },
  {
    slug: "sakra-bear-claw-neck-knives",
    eyebrow: "Neck Knives",
    heroCopy: "A two-inch claw that rides under a collar.",
    cutoutSrc: "/images/hero/knives/sakra-bear-claw-neck-knives.png",
    cutoutWidth: 361,
    cutoutHeight: 391,
    imageRotation: 168,
    imageScale: 0.82,
    accent: "#9fb0bd",
    accentSecondary: "#5c6b78",
    scene: {
      plate: "/images/hero/scenes/sakra-bear-claw-neck-knives-plate.webp",
      mid: "/images/hero/scenes/sakra-bear-claw-neck-knives-mid.webp",
      fore: "/images/hero/scenes/sakra-bear-claw-neck-knives-fore.webp",
      keyX: 0.62,
      keyY: 0.78,
      keyStrength: 0.32,
      summary:
        "Cold weathered crag under a high moon, with the knives' own leather cord entering the foreground.",
    },
    assetStatus: "needs-reshoot",
    assetNote:
      "Source photograph shows five colourways together; the front knife was isolated as the hero subject.",
  },
  {
    slug: "misty-stubby-giraffe",
    eyebrow: "Custom Knives",
    heroCopy: "Thuya burl, stubby grip, built for close work.",
    cutoutSrc: "/images/hero/knives/misty-stubby-giraffe.png",
    cutoutWidth: 791,
    cutoutHeight: 347,
    imageRotation: -34,
    imageScale: 1,
    accent: "#c98f4a",
    accentSecondary: "#8a5a26",
    scene: {
      plate: "/images/hero/scenes/misty-stubby-giraffe-plate.webp",
      mid: "/images/hero/scenes/misty-stubby-giraffe-mid.webp",
      fore: "/images/hero/scenes/misty-stubby-giraffe-fore.webp",
      keyX: -0.55,
      keyY: 0.84,
      keyStrength: 0.36,
      summary:
        "A maker's bench: blocks and tool handles out of focus behind, walnut top, shavings curling off the front edge.",
    },
    assetStatus: "ready",
  },
  {
    slug: "misty-rebar-shank",
    eyebrow: "Custom Knives",
    heroCopy: "Handle and blade drawn from a single bar.",
    cutoutSrc: "/images/hero/knives/misty-rebar-shank.png",
    cutoutWidth: 860,
    cutoutHeight: 470,
    imageRotation: -30,
    imageScale: 1,
    accent: "#8a8f95",
    accentSecondary: "#b5643a",
    scene: {
      plate: "/images/hero/scenes/misty-rebar-shank-plate.webp",
      mid: "/images/hero/scenes/misty-rebar-shank-mid.webp",
      fore: "/images/hero/scenes/misty-rebar-shank-fore.webp",
      keyX: 0.66,
      keyY: 0.75,
      keyStrength: 0.42,
      summary:
        "Forge floor at night — anvil in silhouette, forge mouth low and right, deformed rebar framing the base.",
    },
    assetStatus: "ready",
  },
  {
    slug: "gur-tuva",
    eyebrow: "Custom Knives",
    heroCopy: "Four inches of 1075 carbon, sheathed in leather.",
    cutoutSrc: "/images/hero/knives/gur-tuva.png",
    cutoutWidth: 873,
    cutoutHeight: 566,
    imageRotation: -36,
    imageScale: 1,
    accent: "#a8894a",
    accentSecondary: "#6b4a2a",
    scene: {
      plate: "/images/hero/scenes/gur-tuva-plate.webp",
      mid: "/images/hero/scenes/gur-tuva-mid.webp",
      fore: "/images/hero/scenes/gur-tuva-fore.webp",
      keyX: -0.30,
      keyY: 0.95,
      keyStrength: 0.18,
      summary:
        "Open windswept highland under pale directional daylight, wide and quiet, with deep charcoal ground shadow.",
    },
    assetStatus: "ready",
    assetNote:
      "Cutout is sound; the product record's handle material is disputed — see docs/hero-product-audit.md.",
  },
  {
    slug: "gur-tombik",
    eyebrow: "Custom Knives",
    heroCopy: "Turkish walnut, girthy in the hand, 1075 carbon.",
    cutoutSrc: "/images/hero/knives/gur-tombik.png",
    cutoutWidth: 870,
    cutoutHeight: 542,
    imageRotation: -36,
    imageScale: 1,
    accent: "#b87333",
    accentSecondary: "#7a4a22",
    scene: {
      plate: "/images/hero/scenes/gur-tombik-plate.webp",
      mid: "/images/hero/scenes/gur-tombik-mid.webp",
      fore: "/images/hero/scenes/gur-tombik-fore.webp",
      keyX: -0.92,
      keyY: 0.39,
      keyStrength: 0.34,
      summary:
        "Walnut slab and rounded stone in copper side light, heavy and grounded, with a low ember glow far right.",
    },
    assetStatus: "ready",
  },
] as const;

/** A presentation entry paired with its resolved canonical product. */
export interface HeroKnife {
  presentation: HeroKnifePresentation;
  product: Product;
}

/**
 * Resolves every configured slug against the canonical catalogue. Throws in
 * development if a slug goes missing so a bad rename fails loudly rather than
 * silently dropping a knife from the carousel.
 */
export function getHeroKnives(): HeroKnife[] {
  const resolved: HeroKnife[] = [];

  for (const presentation of HERO_KNIVES) {
    const product = getProductBySlug(presentation.slug);
    if (!product) {
      const message = `Hero knife "${presentation.slug}" is not in data/products.ts`;
      if (process.env.NODE_ENV !== "production") throw new Error(message);
      console.error(message);
      continue;
    }
    resolved.push({ presentation, product });
  }

  return resolved;
}
