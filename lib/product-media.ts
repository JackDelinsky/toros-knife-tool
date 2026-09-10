import type { Product } from "@/types/product";

/**
 * How a product can be looked at, and what it is honestly allowed to claim.
 *
 * One typed table, read by every viewer in the site. Product-specific
 * behaviour is decided here and nowhere else — no component branches on a
 * slug, and no component decides for itself whether something is a 360.
 *
 * The modes are ordered by how much of the real object they can show:
 *
 *   model   a measured 3D model. Free orbit; every angle is real geometry.
 *   spin    a photographed turntable. Every frame is a photograph.
 *   angles  several real stills. Only the angles someone actually shot.
 *   single  one photograph. Inspection movement only, never a rotation.
 *
 * Today every Toros product is `single`. The other three are typed, resolved
 * and rendered, but no product has the assets for them, and none is faked to
 * fill the gap. `docs/toros-product-data-gaps.md` lists what each one needs.
 */
export type ViewerMode = "model" | "spin" | "angles" | "single";

/** A measured 3D model. No product has one; see the capture guide. */
export interface ViewerModel {
  /** Optimised GLB, lazy-loaded only when the viewer is actually opened. */
  src: string;
  /** Named camera positions offered as buttons. */
  presets: readonly ViewerPreset[];
  /** Mesh or material group names, when the model separates. */
  bladeMesh?: string;
  handleMesh?: string;
}

export interface ViewerPreset {
  key: "front" | "reverse" | "spine" | "handle" | "blade";
  label: string;
  /** Degrees of yaw and pitch from the model's rest pose. */
  yaw: number;
  pitch: number;
}

/**
 * A real turntable sequence: `frames` photographs at even angles around one
 * horizontal rotation, named `frame-000` upward.
 *
 * `arc` is 360 for a complete turn. Nothing else may be called a 360.
 */
export interface ViewerSpin {
  dir: string;
  frames: number;
  width: number;
  height: number;
  ext?: string;
  arc: number;
  /** Elevation of the ring in degrees, when more than one was shot. */
  elevation?: number;
}

/**
 * A pre-rendered parallax sweep derived from the product's own photograph.
 *
 * Thickness is estimated from the silhouette and the same pixels are
 * re-projected, so the movement is real parallax rather than a CSS flip — but
 * it is generated from one viewpoint and cannot show the far side. It is a
 * property of `single`, never of `spin`, it is labelled "tilt" and never
 * "rotate", and its arc is deliberately small enough that no geometry breaks.
 */
export interface ReliefSweep {
  dir: string;
  frames: number;
  width: number;
  height: number;
  ext?: string;
  /** Total degrees covered, centred on the undistorted photograph. */
  arc: number;
}

export interface ViewerAngle {
  key: "front" | "reverse" | "spine" | "handle" | "blade" | "detail";
  label: string;
  src: string;
  width: number;
  height: number;
}

/** The single real photograph every product has. */
export interface ViewerSingle {
  src: string;
  width: number;
  height: number;
  /**
   * The same photograph cropped to its content box and filled to 4:3 by
   * `scripts/normalize-product-photos.py`. The sources are 900x1200 with the
   * knife letterboxed into a band in the middle, so anywhere the picture is
   * shown whole this is the one to use — it removes black bars, not pixels.
   */
  card?: { src: string; width: number; height: number };
  /** Background-erased copy of the same photograph, when one exists. */
  cutout?: { src: string; width: number; height: number };
  relief?: ReliefSweep;
}

/**
 * Where the blade stops and the handle starts, as a straight cut across the
 * product's own cutout.
 *
 * Deliberately geometry and not a pair of exported images: the two parts are
 * the *same* file, clipped. That makes it impossible for a cutout artefact to
 * appear on one part and not the other, impossible for the halves to drift out
 * of colour or scale, and impossible for either to be quietly redrawn.
 *
 * `point` is on the cut line in normalised image coordinates; `cross` is the
 * unit vector along the line; `axis` points from the handle toward the tip.
 * All three are measured from the silhouette and then checked by eye.
 */
export interface AnatomySplit {
  kind: "split";
  point: readonly [number, number];
  cross: readonly [number, number];
  axis: readonly [number, number];
}

/**
 * A photograph that cannot be separated is simply not given geometry.
 *
 * Nine of the eighteen have none: six show the knife resting on its sheath, so
 * a cut across the knife would tear the sheath in half; two show three knives
 * in one frame; one has no usable cutout. For those, Anatomy still separates
 * the blade's facts from the handle's, but the photograph is left whole and
 * unmarked rather than annotated in a place nobody verified.
 */
export type AnatomyGeometry = AnatomySplit;

export interface ProductMedia {
  mode: ViewerMode;
  /** Always present: what is shown before anything interactive loads. */
  poster: string;
  single: ViewerSingle;
  spin?: ViewerSpin;
  angles?: readonly ViewerAngle[];
  model?: ViewerModel;
  anatomy?: AnatomyGeometry;
}

/** Every viewer's label, derived from the mode so it cannot drift. */
export function viewerLabel(mode: ViewerMode, hasRelief: boolean): string {
  if (mode === "model") return "Drag to orbit";
  if (mode === "spin") return "Drag to turn";
  if (mode === "angles") return "Choose an angle";
  return hasRelief ? "Drag to tilt" : "Drag to inspect";
}

/**
 * Whether the viewer may use the words "360" or "rotate".
 *
 * Only a complete photographed turn or a measured model may. This is a
 * function rather than a comment so that the rule is enforced by the type
 * system's users rather than by everyone remembering it.
 */
export function showsEveryAngle(media: ProductMedia): boolean {
  return media.mode === "model" || (media.mode === "spin" && (media.spin?.arc ?? 0) >= 360);
}

/**
 * Every product's media, keyed by slug.
 *
 * Generated from `scripts/_anatomy_split_report.json` by the measuring pass in
 * `scripts/measure-anatomy-split.py`, so the numbers here are the ones that
 * were measured and then looked at — not retyped from a screenshot.
 *
 * Every entry is `single`, because every Toros product has exactly one
 * photograph. `card.jpg` is that same photograph cropped, and the source
 * screenshots the catalogue was built from are shop listing pages, which carry
 * one image per product. There is no second angle to show, so none is claimed.
 */
const MEDIA: Record<string, ProductMedia> = {
  "bos-deri": {
    mode: "single",
    poster: "/images/products/bos-deri/main.jpg",
    single: {
      src: "/images/products/bos-deri/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-deri/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-deri/cutout.png", width: 786, height: 495 },
    },
  },
  "bos-recurve-survivor": {
    mode: "single",
    poster: "/images/products/bos-recurve-survivor/main.jpg",
    single: {
      src: "/images/products/bos-recurve-survivor/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-recurve-survivor/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-recurve-survivor/cutout.png", width: 790, height: 319 },
    },
    anatomy: {
      kind: "split",
      point: [0.5481, 0.5193],
      cross: [-0.3257, -0.9455],
      axis: [-0.9455, 0.3257],
      // measured from the silhouette (steel contrast 0.487), then confirmed by eye
    },
  },
  "bos-stag-frontier": {
    mode: "single",
    poster: "/images/products/bos-stag-frontier/main.jpg",
    single: {
      src: "/images/products/bos-stag-frontier/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-stag-frontier/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-stag-frontier/cutout.png", width: 820, height: 461 },
    },
    anatomy: {
      kind: "split",
      point: [0.5302, 0.4933],
      cross: [-0.4984, -0.867],
      axis: [-0.867, 0.4984],
      // measured from the silhouette (steel contrast 0.414), then confirmed by eye
    },
  },
  "bos-stag-golden-horn": {
    mode: "single",
    poster: "/images/products/bos-stag-golden-horn/main.jpg",
    single: {
      src: "/images/products/bos-stag-golden-horn/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-stag-golden-horn/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-stag-golden-horn/cutout.png", width: 802, height: 508 },
      relief: { dir: "/images/spin/bos-stag-golden-horn", frames: 21, width: 810, height: 516, arc: 90 },
    },
  },
  "bos-tera": {
    mode: "single",
    poster: "/images/products/bos-tera/main.jpg",
    single: {
      src: "/images/products/bos-tera/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-tera/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-tera/cutout.png", width: 812, height: 454 },
    },
    anatomy: {
      kind: "split",
      point: [0.5955, 0.4242],
      cross: [-0.4818, -0.8763],
      axis: [-0.8763, 0.4818],
      // measured from the silhouette (hand-set), then confirmed by eye
    },
  },
  "bos-zirve": {
    mode: "single",
    poster: "/images/products/bos-zirve/main.jpg",
    single: {
      src: "/images/products/bos-zirve/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/bos-zirve/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/bos-zirve/cutout.png", width: 722, height: 557 },
    },
    anatomy: {
      kind: "split",
      point: [0.5296, 0.4972],
      cross: [-0.6002, -0.7998],
      axis: [-0.7998, 0.6002],
      // measured from the silhouette (steel contrast 0.666), then confirmed by eye
    },
  },
  "gur-mizrak": {
    mode: "single",
    poster: "/images/products/gur-mizrak/main.jpg",
    single: {
      src: "/images/products/gur-mizrak/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/gur-mizrak/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/gur-mizrak/cutout.png", width: 738, height: 494 },
    },
  },
  "gur-tombik": {
    mode: "single",
    poster: "/images/products/gur-tombik/main.jpg",
    single: {
      src: "/images/products/gur-tombik/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/gur-tombik/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/gur-tombik/cutout.png", width: 862, height: 534 },
      relief: { dir: "/images/spin/gur-tombik", frames: 21, width: 870, height: 542, arc: 90 },
    },
  },
  "gur-tuva": {
    mode: "single",
    poster: "/images/products/gur-tuva/main.jpg",
    single: {
      src: "/images/products/gur-tuva/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/gur-tuva/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/gur-tuva/cutout.png", width: 865, height: 558 },
      relief: { dir: "/images/spin/gur-tuva", frames: 21, width: 873, height: 566, arc: 90 },
    },
  },
  "kam-ram": {
    mode: "single",
    poster: "/images/products/kam-ram/main.jpg",
    single: {
      src: "/images/products/kam-ram/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/kam-ram/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/kam-ram/cutout.png", width: 657, height: 567 },
    },
    anatomy: {
      kind: "split",
      point: [0.6549, 0.3671],
      cross: [-0.6923, -0.7216],
      axis: [-0.7216, 0.6923],
      // measured from the silhouette (hand-set), then confirmed by eye
    },
  },
  "misty-rebar-shank": {
    mode: "single",
    poster: "/images/products/misty-rebar-shank/main.jpg",
    single: {
      src: "/images/products/misty-rebar-shank/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/misty-rebar-shank/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/misty-rebar-shank/cutout.png", width: 853, height: 462 },
      relief: { dir: "/images/spin/misty-rebar-shank", frames: 21, width: 860, height: 470, arc: 90 },
    },
  },
  "misty-stubby-giraffe": {
    mode: "single",
    poster: "/images/products/misty-stubby-giraffe/main.jpg",
    single: {
      src: "/images/products/misty-stubby-giraffe/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/misty-stubby-giraffe/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/misty-stubby-giraffe/cutout.png", width: 783, height: 339 },
      relief: { dir: "/images/spin/misty-stubby-giraffe", frames: 21, width: 791, height: 347, arc: 90 },
    },
    anatomy: {
      kind: "split",
      point: [0.6267, 0.3926],
      cross: [0.2376, 0.9714],
      axis: [0.9714, -0.2376],
      // measured from the silhouette (steel contrast 0.647), then confirmed by eye
    },
  },
  "sakra-bear-claw-neck-knives": {
    mode: "single",
    poster: "/images/products/sakra-bear-claw-neck-knives/main.jpg",
    single: {
      src: "/images/products/sakra-bear-claw-neck-knives/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/sakra-bear-claw-neck-knives/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/sakra-bear-claw-neck-knives/cutout.png", width: 462, height: 375 },
      relief: { dir: "/images/spin/sakra-bear-claw-neck-knives", frames: 21, width: 361, height: 391, arc: 90 },
    },
  },
  "toros-ceviz": {
    mode: "single",
    poster: "/images/products/toros-ceviz/main.jpg",
    single: {
      src: "/images/products/toros-ceviz/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/toros-ceviz/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/toros-ceviz/cutout.png", width: 763, height: 369 },
    },
    anatomy: {
      kind: "split",
      point: [0.4404, 0.549],
      cross: [-0.4168, -0.909],
      axis: [-0.909, 0.4168],
      // measured from the silhouette (steel contrast 0.569), then confirmed by eye
    },
  },
  "toros-jellybean": {
    mode: "single",
    poster: "/images/products/toros-jellybean/main.jpg",
    single: {
      src: "/images/products/toros-jellybean/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/toros-jellybean/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/toros-jellybean/cutout.png", width: 519, height: 432 },
      relief: { dir: "/images/spin/toros-jellybean", frames: 21, width: 272, height: 866, arc: 90 },
    },
  },
  "toros-ram-horn": {
    mode: "single",
    poster: "/images/products/toros-ram-horn/main.jpg",
    single: {
      src: "/images/products/toros-ram-horn/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/toros-ram-horn/card.jpg", width: 1200, height: 900 },
    },
  },
  "toros-rhino": {
    mode: "single",
    poster: "/images/products/toros-rhino/main.jpg",
    single: {
      src: "/images/products/toros-rhino/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/toros-rhino/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/toros-rhino/cutout.png", width: 754, height: 498 },
    },
    anatomy: {
      kind: "split",
      point: [0.6641, 0.2637],
      cross: [0.472, 0.8816],
      axis: [0.8816, -0.472],
      // measured from the silhouette (steel contrast 0.548), then confirmed by eye
    },
  },
  "toros-shepherd-knife": {
    mode: "single",
    poster: "/images/products/toros-shepherd-knife/main.jpg",
    single: {
      src: "/images/products/toros-shepherd-knife/main.jpg",
      width: 900,
      height: 1200,
      card: { src: "/images/products/toros-shepherd-knife/card.jpg", width: 1200, height: 900 },
      cutout: { src: "/images/products/toros-shepherd-knife/cutout.png", width: 798, height: 470 },
    },
    anatomy: {
      kind: "split",
      point: [0.4822, 0.5208],
      cross: [-0.4995, -0.8663],
      axis: [-0.8663, 0.4995],
      // measured from the silhouette (steel contrast 0.666), then confirmed by eye
    },
  },
};

/** The fallback for a product with no entry: its main photograph, nothing more. */
function fallbackMedia(product: Product): ProductMedia {
  const src = product.images[0] ?? `/images/products/${product.slug}/main.jpg`;
  return { mode: "single", poster: src, single: { src, width: 900, height: 1200 } };
}

export function getProductMedia(product: Product): ProductMedia {
  return MEDIA[product.slug] ?? fallbackMedia(product);
}

/** Whether Anatomy can separate this product, rather than only describe it. */
export function canSeparate(media: ProductMedia): boolean {
  return media.anatomy?.kind === "split" && media.single.cutout !== undefined;
}

/**
 * The calibration target rendered by `scripts/build-spin-rig-test.py`.
 *
 * It exists to prove the viewer — the frame sequence, the drag mapping, the
 * progressive loader — against a real 360 before any knife has been shot on a
 * rig. It is not a product and is never reached in normal use: only
 * `?spin=rig-test` selects it. It is the one thing in the repository allowed
 * to call itself a full turn, because it genuinely is one.
 */
export const RIG_TEST_MEDIA: ProductMedia = {
  mode: "spin",
  poster: "/images/spin/rig-test/frame-000.webp",
  single: { src: "/images/spin/rig-test/frame-000.webp", width: 900, height: 900 },
  spin: { dir: "/images/spin/rig-test", frames: 36, width: 900, height: 900, arc: 360 },
};
