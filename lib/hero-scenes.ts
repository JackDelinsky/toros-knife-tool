/**
 * The seven hero environments, as one typed table.
 *
 * Everything a scene needs lives here: its layers, where its surface sits,
 * how its knife is seated on that surface, which way its light falls, what
 * moves in it and how fast. No component branches on a slug, and adding an
 * eighth scene is an entry here plus its plates.
 *
 * How the plates were made
 * ------------------------
 * `scripts/build-photo-scenes.py` builds each environment out of the knife's
 * own photograph. The makers shot every knife outdoors on a real weathered
 * stump in real light, and that surface is better material than anything that
 * can be drawn — so the scene is the largest product-free rectangle of that
 * photograph, extended, defocused and graded, rather than an invented
 * landscape placed behind a cutout.
 *
 * Two things follow from that, and both are deliberate:
 *
 *   These are product-scale scenes, not wide landscapes. There is no ridgeline
 *   and no creek, because nothing photographed one. What there is instead is a
 *   real log with real grain in real light, which is what the knives were
 *   actually photographed on.
 *
 *   The seven are separated by grade rather than by geography. The source
 *   photographs share one grey afternoon, so season and time of day are
 *   carried by colour temperature, exposure and one accent per scene.
 *
 * `docs/nature-hero-art-direction.md` records what each scene would become
 * with purpose-shot photography, and `docs/nature-hero-asset-manifest.md`
 * lists exactly which assets are real, which are temporary and what is still
 * needed from the makers.
 */

/** One ambient movement. Never more than two visible plus one micro-detail. */
export interface AmbientMotion {
  /** Which layer moves. */
  layer: "sky" | "far" | "mid" | "surface" | "fore" | "micro";
  /** Seconds for one cycle. The brief's range is 8-20s. */
  duration: number;
  /** Named CSS animation in globals.css. */
  kind: "drift" | "sway" | "breathe" | "shimmer" | "rise";
  /** Travel, as a percentage of the layer's own box. */
  amount: number;
}

export interface HeroSceneDef {
  slug: string;
  /** Raster layers, back to front. */
  sky: string;
  far: string;
  mid: string;
  surface: string;
  fore: string;
  /**
   * Where the top of the surface sits, as a fraction of the hero's height.
   * Must match SURFACE_Y in scripts/build-photo-scenes.py.
   */
  surfaceY: number;
  /**
   * How far the knife's base overlaps the surface line, in percent of the
   * hero height. A knife that stops exactly at the line reads as floating;
   * a little overlap is what makes it read as resting.
   */
  seat: number;
  /** Unit vector the key light travels along, measured from the photograph. */
  lightX: number;
  lightY: number;
  /** 0-1, how strongly the runtime light pass is applied. */
  lightStrength: number;
  /** The scene's own accent, sampled from its materials. */
  accent: string;
  /** Surface tone, carried into the category belt below the hero. */
  surfaceTone: string;
  /** One line describing the world, for the art-direction document. */
  summary: string;
  /** What moves, and how fast. */
  ambient: AmbientMotion[];
  /**
   * Whether a moving reflection may cross the blade. False wherever the real
   * finish is hammered, blackened or matte — a sweep there would make a
   * forged blade look chromed, which is a claim about the product.
   */
  bladeSweep: boolean;
}

const SCENES: Record<string, HeroSceneDef> = {
  "toros-jellybean": {
    slug: "toros-jellybean",
    sky: "/images/hero/scenes/toros-jellybean-sky.webp",
    far: "/images/hero/scenes/toros-jellybean-far.webp",
    mid: "/images/hero/scenes/toros-jellybean-mid.webp",
    surface: "/images/hero/scenes/toros-jellybean-surface.webp",
    fore: "/images/hero/scenes/toros-jellybean-fore.webp",
    surfaceY: 0.635,
    seat: 1.6,
    lightX: 0.62,
    lightY: 0.73,
    lightStrength: 0.26,
    accent: "#3f9bb5",
    surfaceTone: "#4a3a2a",
    summary:
      "Bright spring woodland: damp stump, green leaf bokeh, cool filtered daylight with one warm break.",
    ambient: [
      { layer: "far", duration: 19, kind: "drift", amount: 1.6 },
      { layer: "fore", duration: 13, kind: "sway", amount: 1.1 },
      { layer: "micro", duration: 17, kind: "shimmer", amount: 1 },
    ],
    bladeSweep: true,
  },
  "bos-stag-golden-horn": {
    slug: "bos-stag-golden-horn",
    sky: "/images/hero/scenes/bos-stag-golden-horn-sky.webp",
    far: "/images/hero/scenes/bos-stag-golden-horn-far.webp",
    mid: "/images/hero/scenes/bos-stag-golden-horn-mid.webp",
    surface: "/images/hero/scenes/bos-stag-golden-horn-surface.webp",
    fore: "/images/hero/scenes/bos-stag-golden-horn-fore.webp",
    surfaceY: 0.635,
    seat: 1.8,
    lightX: 0.66,
    lightY: 0.40,
    lightStrength: 0.34,
    accent: "#c4a574",
    surfaceTone: "#5a4229",
    summary:
      "The flagship: golden-hour side light across a sun-aged log, honeyed and open, the brightest of the seven.",
    ambient: [
      { layer: "far", duration: 20, kind: "drift", amount: 1.8 },
      { layer: "mid", duration: 15, kind: "breathe", amount: 1.2 },
      { layer: "micro", duration: 14, kind: "shimmer", amount: 1 },
    ],
    bladeSweep: false,
  },
  "sakra-bear-claw-neck-knives": {
    slug: "sakra-bear-claw-neck-knives",
    sky: "/images/hero/scenes/sakra-bear-claw-neck-knives-sky.webp",
    far: "/images/hero/scenes/sakra-bear-claw-neck-knives-far.webp",
    mid: "/images/hero/scenes/sakra-bear-claw-neck-knives-mid.webp",
    surface: "/images/hero/scenes/sakra-bear-claw-neck-knives-surface.webp",
    fore: "/images/hero/scenes/sakra-bear-claw-neck-knives-fore.webp",
    surfaceY: 0.635,
    seat: 1.4,
    lightX: 0.57,
    lightY: 0.32,
    lightStrength: 0.16,
    accent: "#9fb0bd",
    surfaceTone: "#4b4a48",
    summary:
      "Cold bright overcast: pale winter light, low fog behind the stone-grey timber, almost no colour.",
    ambient: [
      { layer: "mid", duration: 18, kind: "drift", amount: 2.2 },
      { layer: "far", duration: 20, kind: "breathe", amount: 0.9 },
    ],
    bladeSweep: true,
  },
  "misty-stubby-giraffe": {
    slug: "misty-stubby-giraffe",
    sky: "/images/hero/scenes/misty-stubby-giraffe-sky.webp",
    far: "/images/hero/scenes/misty-stubby-giraffe-far.webp",
    mid: "/images/hero/scenes/misty-stubby-giraffe-mid.webp",
    surface: "/images/hero/scenes/misty-stubby-giraffe-surface.webp",
    fore: "/images/hero/scenes/misty-stubby-giraffe-fore.webp",
    surfaceY: 0.635,
    seat: 1.7,
    lightX: 0.69,
    lightY: 0.27,
    lightStrength: 0.30,
    accent: "#c98f4a",
    surfaceTone: "#5d4426",
    summary:
      "Warm late-afternoon summer wood: amber light on a figured surface, broken leaf shadow moving across it.",
    ambient: [
      { layer: "surface", duration: 16, kind: "breathe", amount: 0.8 },
      { layer: "fore", duration: 12, kind: "sway", amount: 1.4 },
      { layer: "micro", duration: 18, kind: "shimmer", amount: 1 },
    ],
    bladeSweep: false,
  },
  "misty-rebar-shank": {
    slug: "misty-rebar-shank",
    sky: "/images/hero/scenes/misty-rebar-shank-sky.webp",
    far: "/images/hero/scenes/misty-rebar-shank-far.webp",
    mid: "/images/hero/scenes/misty-rebar-shank-mid.webp",
    surface: "/images/hero/scenes/misty-rebar-shank-surface.webp",
    fore: "/images/hero/scenes/misty-rebar-shank-fore.webp",
    surfaceY: 0.635,
    seat: 1.8,
    lightX: 0.66,
    lightY: 0.35,
    lightStrength: 0.38,
    accent: "#b5643a",
    surfaceTone: "#332f2c",
    summary:
      "The one twilight scene: cool blue woodland with a low warm glow off to the right and thin smoke behind.",
    ambient: [
      { layer: "mid", duration: 17, kind: "rise", amount: 2.4 },
      { layer: "far", duration: 20, kind: "breathe", amount: 1.0 },
      { layer: "micro", duration: 16, kind: "shimmer", amount: 1 },
    ],
    bladeSweep: false,
  },
  "gur-tuva": {
    slug: "gur-tuva",
    sky: "/images/hero/scenes/gur-tuva-sky.webp",
    far: "/images/hero/scenes/gur-tuva-far.webp",
    mid: "/images/hero/scenes/gur-tuva-mid.webp",
    surface: "/images/hero/scenes/gur-tuva-surface.webp",
    fore: "/images/hero/scenes/gur-tuva-fore.webp",
    surfaceY: 0.635,
    seat: 1.7,
    lightX: 0.64,
    lightY: 0.32,
    lightStrength: 0.14,
    accent: "#a8894a",
    surfaceTone: "#565046",
    summary:
      "Open highland dawn: pale luminous light, silvered timber, the cleanest and widest of the seven.",
    ambient: [
      { layer: "far", duration: 20, kind: "drift", amount: 2.0 },
      { layer: "mid", duration: 16, kind: "breathe", amount: 1.1 },
    ],
    bladeSweep: true,
  },
  "gur-tombik": {
    slug: "gur-tombik",
    sky: "/images/hero/scenes/gur-tombik-sky.webp",
    far: "/images/hero/scenes/gur-tombik-far.webp",
    mid: "/images/hero/scenes/gur-tombik-mid.webp",
    surface: "/images/hero/scenes/gur-tombik-surface.webp",
    fore: "/images/hero/scenes/gur-tombik-fore.webp",
    surfaceY: 0.635,
    seat: 1.8,
    lightX: 0.71,
    lightY: 0.33,
    lightStrength: 0.28,
    accent: "#b87333",
    surfaceTone: "#4f4334",
    summary:
      "The second flagship: shaded creek green, water-darkened wood, reflected light moving in the background.",
    ambient: [
      { layer: "mid", duration: 14, kind: "shimmer", amount: 1.6 },
      { layer: "far", duration: 19, kind: "drift", amount: 1.4 },
      { layer: "micro", duration: 17, kind: "breathe", amount: 1 },
    ],
    bladeSweep: true,
  },
};

export function getHeroScene(slug: string): HeroSceneDef | undefined {
  return SCENES[slug];
}

export const HERO_SCENE_SLUGS = Object.keys(SCENES);
