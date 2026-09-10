"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { bladeFacts, handleFacts, hasSeparation, splitClips, type AnatomyPart } from "@/lib/anatomy";
import type { ProductMedia } from "@/lib/product-media";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { Product } from "@/types/product";

interface AnatomyProps {
  product: Product;
  media: ProductMedia;
}

/** How far each part travels, as a fraction of the image box. */
const GAP = 0.13;
/** A small sideways offset so the two parts read as separated in depth too. */
const SPREAD = 0.05;

/**
 * The knife, taken apart.
 *
 * The two halves are the same photograph clipped along one measured line, so
 * nothing here is redrawn: the blade you see separated is literally the same
 * pixels as the blade in the assembled photograph. The line was measured from
 * the silhouette's colour and then checked by eye — `lib/product-media.ts`
 * carries the nine that passed.
 *
 * The separation is an editorial view, not a claim about the object: a
 * full-tang fixed blade does not come apart at the guard, and the copy says so.
 * Nine other products have a photograph that cannot be cut honestly — six show
 * the knife lying on its sheath, two show three knives at once, one has no
 * usable cutout — so those keep the whole photograph and get the same facts
 * without the motion, rather than a bad mask forced into the effect.
 */
export function Anatomy({ product, media }: AnatomyProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [apart, setApart] = useState(false);
  const headingId = useId();

  const blade = bladeFacts(product);
  const handle = handleFacts(product);
  const separable = hasSeparation(media);
  // The cropped frame where there is one: the raw file is a tall portrait with
  // black bands above and below the knife.
  const whole = media.single.card ?? media.single;

  return (
    <section className="anat" aria-labelledby={headingId}>
      <div className="anat-head">
        <h3 id={headingId} className="t-h3">
          Blade and handle
        </h3>
        {separable ? (
          <button
            type="button"
            className="btn btn--secondary anat-toggle"
            onClick={() => setApart((v) => !v)}
            aria-pressed={apart}
          >
            {apart ? "Reassemble" : "View anatomy"}
          </button>
        ) : null}
      </div>

      {separable ? (
        <SeparatedStage product={product} media={media} apart={apart} reduced={reducedMotion} />
      ) : (
        <figure className="anat-whole">
          {/* eslint-disable-next-line @next/next/no-img-element -- a plain
              still; next/image adds nothing here and the box is already fixed. */}
          <img
            src={whole.src}
            alt={`${product.name}, whole`}
            width={whole.width}
            height={whole.height}
            className="anat-whole-img"
          />
          <figcaption className="anat-note">
            This product&rsquo;s photograph shows the knife on its sheath or beside others, so it
            cannot be separated cleanly. It is shown whole rather than badly cut.
          </figcaption>
        </figure>
      )}

      <div className="anat-panels">
        <PartPanel part={blade} active={apart && separable} />
        <PartPanel part={handle} active={apart && separable} />
      </div>

      {separable ? (
        <p className="anat-caveat">
          An editorial view. {product.category === "folding-knives"
            ? "The blade does pivot on this folder, but it is shown parted here to label the two, not to show how it opens."
            : "This is a fixed blade: it does not come apart at the guard."}
        </p>
      ) : null}
    </section>
  );
}

function SeparatedStage({
  product,
  media,
  apart,
  reduced,
}: {
  product: Product;
  media: ProductMedia;
  apart: boolean;
  reduced: boolean;
}) {
  const cutout = media.single.cutout;
  const split = media.anatomy;
  if (!cutout || !split) return null;

  const clips = splitClips(split, cutout.width, cutout.height);

  // Travel is along the measured axis, so the gap always opens square to the
  // cut. Pulling both parts straight up instead would slide one across the
  // other on any knife photographed at an angle.
  const [ax, ay] = split.axis;
  const [cx, cy] = split.cross;
  const move = (sign: 1 | -1) => ({
    x: apart ? `${sign * (ax * GAP + cx * SPREAD) * 100}%` : "0%",
    y: apart ? `${sign * (ay * GAP + cy * SPREAD) * 100}%` : "0%",
  });

  const transition = reduced
    ? { duration: 0.18 }
    : { type: "spring" as const, stiffness: 150, damping: 26, mass: 0.8 };

  const alt = `${product.name}: ${product.steel} blade with a ${product.handleMaterial} handle`;

  return (
    <div
      className="anat-stage"
      data-apart={apart || undefined}
      style={{ aspectRatio: `${cutout.width} / ${cutout.height}` }}
    >
      {/* Drawn under both parts, so the gap reads as one object opened rather
          than two unrelated pictures. */}
      <svg className="anat-link" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line
          x1={split.point[0] * 100 - ax * 8}
          y1={split.point[1] * 100 - ay * 8}
          x2={split.point[0] * 100 + ax * 8}
          y2={split.point[1] * 100 + ay * 8}
          className="anat-link-line"
        />
      </svg>

      {(["blade", "handle"] as const).map((part) => (
        <motion.div
          key={part}
          className="anat-part"
          data-part={part}
          animate={move(part === "blade" ? 1 : -1)}
          transition={transition}
          style={{ clipPath: clips[part] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- both halves
              must be the identical file for the parts to stay in register;
              next/image would serve each a separately-resized copy. */}
          <img
            src={cutout.src}
            alt={part === "blade" ? alt : ""}
            width={cutout.width}
            height={cutout.height}
            className="anat-part-img"
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  );
}

function PartPanel({ part, active }: { part: AnatomyPart; active: boolean }) {
  if (part.facts.length === 0 && !part.notes && !part.customisation) return null;
  return (
    <div className="anat-panel" data-part={part.key} data-active={active || undefined}>
      <h4 className="anat-panel-title">{part.title}</h4>
      {part.facts.length ? (
        <dl className="anat-facts">
          {part.facts.map((fact) => (
            <div key={fact.label} className="anat-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {part.notes ? <p className="anat-panel-note">{part.notes}</p> : null}
      {part.customisation ? (
        <p className="anat-panel-note">
          {part.customisation}{" "}
          <a href="/contact" className="link">
            Ask about customization
          </a>
        </p>
      ) : null}
    </div>
  );
}
