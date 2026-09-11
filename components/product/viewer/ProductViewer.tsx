"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { ProductMedia, ViewerAngle } from "@/lib/product-media";
import { showsEveryAngle, viewerLabel } from "@/lib/product-media";
import { frameSrc, useFrameSequence } from "@/lib/use-frame-sequence";
import { useCoarsePointer } from "@/lib/use-input-kind";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

interface ProductViewerProps {
  media: ProductMedia;
  /**
   * Share of the stage's width the *visible silhouette* should occupy, 0-1.
   *
   * Sizing by the file rectangle is what made the hero knives look like
   * thumbnails: the cutouts have different aspect ratios and different
   * amounts of empty margin, so one shared max-width rendered a wide knife at
   * half the height of a tall one. When this is set the viewer solves for the
   * box that puts the silhouette at the requested width instead.
   */
  fill?: number;
  /** Degrees of resting rotation, where the real cutout supports the pose. */
  rotate?: number;
  /** Describes the product once — never once per frame. */
  alt: string;
  className?: string;
  /** Fired on a press that was not a drag, so the product can still be opened. */
  onTap?: () => void;
  /** Larger stages get a longer drag throw and a bigger zoom ceiling. */
  size?: "compact" | "full";
}

/** Pixels of horizontal travel for one complete turn of a real turntable. */
const PX_PER_TURN = 340;
/** A short sweep is a fine inspection, not a spin: it gets a slower mapping. */
const PX_PER_RELIEF_FRAME = 20;
/** Movement under this is a press, not a drag. */
const TAP_SLOP = 5;
/** Degrees of restrained pitch on a flat photograph. */
const MAX_PITCH = 9;
const MAX_YAW = 11;
const ZOOM_STEPS = [1, 1.5, 2.25] as const;
/** Stable placeholder for a product with no sequence: a new object literal
    here would give the loader a new dependency on every render. */
const NO_FRAMES = { dir: "", frames: 0 } as const;

/**
 * One viewer for every product, in whatever mode its real assets support.
 *
 * The mode is decided in `lib/product-media.ts` and never here, so no component
 * can talk itself into presenting a product as more photographed than it is.
 * What changes between modes is only how movement is produced:
 *
 *   spin    scrubs photographs of a real turntable. A full turn wraps.
 *   angles  crossfades between stills someone actually shot.
 *   single  moves the one photograph — as re-projected parallax frames where
 *           those exist, otherwise as a restrained tilt — and says "inspect",
 *           never "360".
 *
 * Nothing autoplays and nothing carries momentum: the product moves exactly as
 * far as the pointer does and stops when it stops.
 */
export function ProductViewer({
  media,
  alt,
  className = "",
  onTap,
  size = "full",
  fill,
  rotate = 0,
}: ProductViewerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const coarse = useCoarsePointer();
  const hintId = useId();

  const [zoom, setZoom] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [angle, setAngle] = useState(0);

  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; frame: number; pitch: number; yaw: number; moved: boolean } | null>(null);

  const relief = media.single.relief;
  const spin = media.spin;
  const sequence = spin ?? relief;
  const wraps = spin !== undefined && spin.arc >= 360;

  // Only ever called with a sequence present; the hook needs a stable object
  // either way, so an unused product gets a zero-frame placeholder it exits on.
  const frames = useFrameSequence(sequence ?? NO_FRAMES);
  const [index, setIndex] = useState(() =>
    sequence ? (wraps ? 0 : Math.floor((sequence.frames - 1) / 2)) : 0,
  );

  const usingFrames = sequence !== undefined && frames.ready && !frames.failed;
  const label = viewerLabel(media.mode, relief !== undefined);

  const clampFrame = useCallback(
    (i: number) => {
      if (!sequence) return 0;
      return wraps
        ? ((i % sequence.frames) + sequence.frames) % sequence.frames
        : Math.min(sequence.frames - 1, Math.max(0, i));
    },
    [sequence, wraps],
  );

  const reset = useCallback(() => {
    setPitch(0);
    setYaw(0);
    setZoom(0);
    setIndex(sequence ? (wraps ? 0 : Math.floor((sequence.frames - 1) / 2)) : 0);
  }, [sequence, wraps]);

  const rested = pitch === 0 && yaw === 0 && zoom === 0 &&
    (!sequence || index === (wraps ? 0 : Math.floor((sequence.frames - 1) / 2)));

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      surface.current?.setPointerCapture(e.pointerId);
      drag.current = { x: e.clientX, y: e.clientY, frame: index, pitch, yaw, moved: false };
      setDragging(true);
      setEngaged(true);
    },
    [index, pitch, yaw],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) > TAP_SLOP || Math.abs(dy) > TAP_SLOP) d.moved = true;

      // Horizontal is the product's real movement where real frames exist, and
      // a restrained yaw where they do not. Vertical is always a small tilt:
      // nothing photographed the underside, so it stays a hint of one.
      if (usingFrames && sequence) {
        const perFrame = wraps ? PX_PER_TURN / sequence.frames : PX_PER_RELIEF_FRAME;
        setIndex(clampFrame(d.frame + Math.round(dx / perFrame)));
      } else {
        setYaw(Math.max(-MAX_YAW, Math.min(MAX_YAW, d.yaw + dx / 14)));
      }
      setPitch(Math.max(-MAX_PITCH, Math.min(MAX_PITCH, d.pitch - dy / 16)));
    },
    [usingFrames, sequence, wraps, clampFrame],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      surface.current?.releasePointerCapture?.(e.pointerId);
      drag.current = null;
      setDragging(false);
      // A press that never moved is a click on the product, not a rotation.
      // Anything that moved is a manipulation and must not open anything.
      if (!d.moved) onTap?.();
    },
    [onTap],
  );

  // The wheel belongs to the page until the visitor has deliberately engaged
  // the viewer. Attached natively rather than via onWheel because a passive
  // React listener cannot preventDefault, and stealing the wheel without
  // preventing the scroll would move both the product and the page.
  useEffect(() => {
    const node = surface.current;
    if (!node || !engaged) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      setZoom((z) => Math.max(0, Math.min(ZOOM_STEPS.length - 1, z + (event.deltaY > 0 ? -1 : 1))));
    }
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [engaged]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const nudge = (dx: number, dy: number) => {
        e.preventDefault();
        e.stopPropagation();
        setEngaged(true);
        if (dx !== 0) {
          if (usingFrames) setIndex((i) => clampFrame(i + dx));
          else setYaw((y) => Math.max(-MAX_YAW, Math.min(MAX_YAW, y + dx * 2)));
        }
        if (dy !== 0) setPitch((p) => Math.max(-MAX_PITCH, Math.min(MAX_PITCH, p + dy * 2)));
      };

      if (e.key === "ArrowRight") nudge(1, 0);
      else if (e.key === "ArrowLeft") nudge(-1, 0);
      else if (e.key === "ArrowUp") nudge(0, 1);
      else if (e.key === "ArrowDown") nudge(0, -1);
      else if (e.key === "Home") {
        // Escape is deliberately not handled: it belongs to whatever dialog
        // contains the viewer. Resetting is Home, and the Reset button.
        e.preventDefault();
        e.stopPropagation();
        reset();
      } else if ((e.key === "Enter" || e.key === " ") && onTap) {
        e.preventDefault();
        onTap();
      }
    },
    [usingFrames, clampFrame, reset, onTap],
  );

  const angles = media.angles;
  const current: ViewerAngle | undefined = angles?.[angle];

  // What is actually painted, in order of what is really available.
  const src =
    media.mode === "angles" && current
      ? current.src
      : usingFrames && sequence
        ? frameSrc(sequence, frames.resolve(index))
        : (media.single.cutout?.src ?? media.single.src);
  const box =
    media.mode === "angles" && current
      ? current
      : usingFrames && sequence
        ? sequence
        : (media.single.cutout ?? media.single);

  const degrees =
    sequence && usingFrames
      ? wraps
        ? Math.round((index / sequence.frames) * 360)
        : Math.round(-sequence.arc / 2 + (index / Math.max(sequence.frames - 1, 1)) * sequence.arc)
      : Math.round(yaw);

  const spanMin = sequence && wraps ? 0 : -(sequence ? sequence.arc / 2 : MAX_YAW);
  const spanMax = sequence && wraps ? 359 : sequence ? sequence.arc / 2 : MAX_YAW;
  const scale = ZOOM_STEPS[zoom];
  // A rotated box needs more room than its own width, or the corners clip.
  const rad = (Math.abs(rotate) * Math.PI) / 180;
  const spread = Math.cos(rad) + (box.height / box.width) * Math.sin(rad);
  const fillWidth = fill ? `${Math.min((fill / spread) * 100, 100)}%` : undefined;

  const verb = coarse ? "Swipe" : "Drag";
  const hint = `${label.replace(/^Drag/, verb)} · arrow keys also work`;

  return (
    <div className={`pv ${className}`} data-mode={media.mode} data-size={size}>
      <div
        ref={surface}
        className="pv-stage"
        data-dragging={dragging || undefined}
        data-zoomed={zoom > 0 || undefined}
        style={{
          aspectRatio: `${box.width} / ${box.height}`,
          ...(fillWidth ? { width: fillWidth, maxWidth: fillWidth } : null),
        }}
        role="slider"
        tabIndex={0}
        aria-label={`${showsEveryAngle(media) ? "Rotate" : "Tilt"} ${alt}`}
        aria-describedby={hintId}
        aria-valuemin={Math.round(spanMin)}
        aria-valuemax={Math.round(spanMax)}
        aria-valuenow={degrees}
        aria-valuetext={`${degrees} degrees`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onFocus={() => setEngaged(true)}
        onBlur={() => setEngaged(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- while dragging
            the src changes many times a second; next/image would remount and
            re-request on every step. These frames are pre-sized and already
            warmed by the sequence loader. */}
        <img
          src={src}
          alt={alt}
          width={box.width}
          height={box.height}
          className="pv-img"
          draggable={false}
          style={{
            transform: reducedMotion
              ? `rotate(${rotate}deg) scale(${scale})`
              : `perspective(1400px) rotateX(${pitch}deg) rotateY(${usingFrames ? 0 : yaw}deg) rotate(${rotate}deg) scale(${scale})`,
          }}
        />
      </div>

      <div className="pv-bar">
        {sequence && !frames.ready && !frames.failed ? (
          <p className="pv-status" role="status">
            Loading views…
          </p>
        ) : (
          <p className="pv-hint" id={hintId}>
            {hint}
          </p>
        )}

        <div className="pv-controls">
          {angles && angles.length > 1
            ? angles.map((a, i) => (
                <button
                  key={a.key}
                  type="button"
                  className="pv-preset"
                  aria-pressed={i === angle}
                  onClick={() => setAngle(i)}
                >
                  {a.label}
                </button>
              ))
            : null}

          <button
            type="button"
            className="pv-zoom"
            onClick={() => setZoom((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
            disabled={zoom >= ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="pv-zoom"
            onClick={() => setZoom((z) => Math.max(0, z - 1))}
            disabled={zoom <= 0}
            aria-label="Zoom out"
          >
            −
          </button>
          <button type="button" className="pv-reset" onClick={reset} disabled={rested}>
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
}
