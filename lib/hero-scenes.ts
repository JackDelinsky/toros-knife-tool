/**
 * The seven hero environments, as one typed table.
 *
 * These are **neutral studio fields, not photographs of places.**
 *
 * The previous pass built each environment out of the knife's own product
 * photograph — a clean rectangle of the stump it was shot on, enlarged to fill
 * a widescreen hero. That failed, and the failure is worth recording so it is
 * not repeated: a 700px crop stretched to 1920 is soft however it is graded,
 * the join between the sharp surface and the blurred background read as a hard
 * horizontal seam across every slide, and the knives ended up floating on that
 * seam rather than resting anywhere.
 *
 * Until an environment plate exists that clears the asset gate in
 * `docs/hero-environment-asset-brief.md` — 2560x1440 or better, a real ground
 * plane, no product baked in, negative space where the copy goes — the honest
 * answer is a deliberate studio field rather than a bad landscape. That is
 * what this is: a deep charcoal ground, one warm light behind the product in
 * the product's own colour, a restrained vignette, and fine grain. No seam, no
 * blur, nothing pretending to be a photograph of anywhere.
 *
 * Everything here is CSS. There are no raster plates, which is also why the
 * hero now costs nothing to load.
 */

export interface HeroSceneDef {
  slug: string;
  /** The scene's accent, sampled from the knife's own materials. */
  accent: string;
  /** Warm or cool ground, so the seven are not one repeated background. */
  ground: string;
  /** Where the key light sits behind the product, as viewport percentages. */
  keyX: number;
  keyY: number;
  /** 0-1. Brighter products need less light behind them. */
  keyStrength: number;
  /** Carried into the category rail below the hero. */
  surfaceTone: string;
  /** One line, for the asset brief. */
  summary: string;
}

const SCENES: Record<string, HeroSceneDef> = {
  "toros-jellybean": {
    slug: "toros-jellybean",
    accent: "#3f9bb5",
    ground: "#0b1013",
    keyX: 50, keyY: 44, keyStrength: 0.34,
    surfaceTone: "#16242a",
    summary: "Cool teal key, the epoxy's own colour, against a blue-black ground.",
  },
  "bos-stag-golden-horn": {
    slug: "bos-stag-golden-horn",
    accent: "#c4a574",
    ground: "#12100c",
    keyX: 52, keyY: 46, keyStrength: 0.42,
    surfaceTone: "#2a2318",
    summary: "The warmest of the seven: brass and antler light on a warm dusk ground.",
  },
  "sakra-bear-claw-neck-knives": {
    slug: "sakra-bear-claw-neck-knives",
    accent: "#9fb0bd",
    ground: "#0d1013",
    keyX: 50, keyY: 42, keyStrength: 0.30,
    surfaceTone: "#1c2126",
    summary: "Cold pale steel light, the most neutral scene in the set.",
  },
  "misty-stubby-giraffe": {
    slug: "misty-stubby-giraffe",
    accent: "#c98f4a",
    ground: "#120e09",
    keyX: 51, keyY: 45, keyStrength: 0.40,
    surfaceTone: "#2b2014",
    summary: "Amber burl light on a deep warm ground.",
  },
  "misty-rebar-shank": {
    slug: "misty-rebar-shank",
    accent: "#b5643a",
    ground: "#0d0c0c",
    keyX: 53, keyY: 47, keyStrength: 0.36,
    surfaceTone: "#241c18",
    summary: "Forge-orange key, low and to one side, against near-black.",
  },
  "gur-tuva": {
    slug: "gur-tuva",
    accent: "#a8894a",
    ground: "#101010",
    keyX: 49, keyY: 43, keyStrength: 0.32,
    surfaceTone: "#242019",
    summary: "Pale ochre light, wide and even, the quietest scene.",
  },
  "gur-tombik": {
    slug: "gur-tombik",
    accent: "#b87333",
    ground: "#100d0a",
    keyX: 51, keyY: 45, keyStrength: 0.38,
    surfaceTone: "#2a2017",
    summary: "Copper key on walnut-dark ground, the second warm flagship.",
  },
};

export function getHeroScene(slug: string): HeroSceneDef | undefined {
  return SCENES[slug];
}

/**
 * How each knife is presented on the stage.
 *
 * Sized by the **visible silhouette**, never by the file rectangle. The
 * cutouts have different aspect ratios and different amounts of empty margin,
 * so one shared scale rendered a wide knife at half the height of a tall one
 * and left both off-centre. `widthPct` is the share of the stage's usable
 * width the silhouette should occupy; the viewer solves for the rest.
 */
export interface HeroPresentation {
  /** Share of the stage width the visible silhouette should fill, 0-1. */
  widthPct: number;
  /** Degrees. Negative lifts the blade tip. Only where the cutout supports it. */
  rotate: number;
  /** Fine vertical trim, as a percentage of the stage height. */
  nudgeY: number;
}

const PRESENTATION: Record<string, HeroPresentation> = {
  // A short vertical knife: sized by its long dimension so it still reads as
  // the focal object rather than a thumbnail of one.
  "toros-jellybean": { widthPct: 0.34, rotate: -8, nudgeY: 0 },
  "bos-stag-golden-horn": { widthPct: 0.86, rotate: -7, nudgeY: 0 },
  "sakra-bear-claw-neck-knives": { widthPct: 0.52, rotate: -6, nudgeY: 0 },
  "misty-stubby-giraffe": { widthPct: 0.84, rotate: -6, nudgeY: 0 },
  "misty-rebar-shank": { widthPct: 0.86, rotate: -7, nudgeY: 0 },
  "gur-tuva": { widthPct: 0.84, rotate: -7, nudgeY: 0 },
  "gur-tombik": { widthPct: 0.84, rotate: -7, nudgeY: 0 },
};

const DEFAULT_PRESENTATION: HeroPresentation = { widthPct: 0.8, rotate: -6, nudgeY: 0 };

export function getHeroPresentation(slug: string): HeroPresentation {
  return PRESENTATION[slug] ?? DEFAULT_PRESENTATION;
}
