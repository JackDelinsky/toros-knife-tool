import type { AnatomySplit, ProductMedia } from "@/lib/product-media";
import type { Product } from "@/types/product";

/** A value that is missing is omitted. It is never shown as "N/A". */
function real(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === "N/A" || trimmed.toLowerCase() === "unknown") {
    return undefined;
  }
  return trimmed;
}

export interface AnatomyFact {
  label: string;
  value: string;
}

export interface AnatomyPart {
  key: "blade" | "handle";
  title: string;
  facts: AnatomyFact[];
  /** Longer prose shown under the facts, when the record has any. */
  notes?: string;
  /** Rendered as a link to Contact rather than as a configurator. */
  customisation?: string;
}

/**
 * The blade's verified facts.
 *
 * Only fields the product record actually carries. Thickness, grind, finish,
 * hardness and forging notes are not in the catalogue for any product, so they
 * do not appear — an empty row would read as "this knife has no grind" rather
 * than "nobody has written it down". `docs/toros-product-data-gaps.md` lists
 * what is missing, per product, for whoever collects it.
 */
export function bladeFacts(product: Product): AnatomyPart {
  const facts: AnatomyFact[] = [];
  const steel = real(product.steel);
  const length = real(product.bladeLength);
  if (steel) facts.push({ label: "Steel", value: steel });
  if (length) facts.push({ label: "Blade length", value: length });
  if (product.bestUses.length) {
    facts.push({ label: "Intended use", value: product.bestUses.join(", ") });
  }
  return {
    key: "blade",
    title: "The blade",
    facts,
    notes: real(product.careInstructions),
  };
}

/** The handle's verified facts, with carry in its own subsection. */
export function handleFacts(product: Product): AnatomyPart {
  const facts: AnatomyFact[] = [];
  const material = real(product.handleMaterial);
  const sheath = real(product.sheath);
  if (material) facts.push({ label: "Material", value: material });
  if (sheath) facts.push({ label: "Sheath", value: sheath });
  return {
    key: "handle",
    title: "The handle",
    facts,
    customisation: product.customAvailable
      ? "This one can be built to order — ask about materials and dimensions."
      : undefined,
  };
}

/**
 * Two CSS `polygon()` clips that between them cover the whole image and share
 * one edge: the measured cut across the knife.
 *
 * Both halves are clips of the *same* file, so the blade and the handle can
 * never drift apart in colour, scale or masking quality, and neither can be
 * quietly replaced by something redrawn. The cut is a straight line, so it
 * cannot produce a halo or a ragged edge the way an exported per-part mask can.
 */
export function splitClips(
  split: AnatomySplit,
  width: number,
  height: number,
): { blade: string; handle: string } {
  // The measurement is in pixels; clip-path is in the image's own normalised
  // box, so the direction has to be rescaled by the aspect ratio or the cut
  // lands at the wrong angle on any non-square photograph.
  const nx = split.axis[0] / width;
  const ny = split.axis[1] / height;
  const [px, py] = split.point;
  const side = (x: number, y: number) => (x - px) * nx + (y - py) * ny;

  const corners: Array<[number, number]> = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];

  const blade: Array<[number, number]> = [];
  const handle: Array<[number, number]> = [];

  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const sa = side(a[0], a[1]);
    const sb = side(b[0], b[1]);

    (sa >= 0 ? blade : handle).push(a);

    if ((sa >= 0) !== (sb >= 0)) {
      const t = sa / (sa - sb);
      const crossing: [number, number] = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      blade.push(crossing);
      handle.push(crossing);
    }
  }

  const toPolygon = (points: Array<[number, number]>) =>
    `polygon(${points.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(", ")})`;

  return { blade: toPolygon(blade), handle: toPolygon(handle) };
}

/** Whether this product can actually come apart on screen. */
export function hasSeparation(media: ProductMedia): media is ProductMedia & {
  anatomy: AnatomySplit;
  single: { cutout: { src: string; width: number; height: number } };
} {
  return media.anatomy !== undefined && media.single.cutout !== undefined;
}
