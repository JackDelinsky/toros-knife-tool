"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSpin } from "@/components/home/hero/hero-knives";

interface SpinViewerProps {
  spin: HeroSpin;
  /** Describes the product once — not once per frame. */
  alt: string;
  className?: string;
  /** Fired on a click that was not a drag, so the knife can still be opened. */
  onTap?: () => void;
  /** Shown until the first frames arrive, so the hero never paints empty. */
  poster?: string;
}

/** Frames loaded before the viewer becomes interactive, spread evenly. */
const FIRST_PASS = 8;

/**
 * Pixels of horizontal travel for one complete turn.
 *
 * Deliberately a fixed distance rather than the element's width: tying it to
 * the width meant a full rotation needed a drag from one edge of the viewer to
 * the other, so you ran out of screen — and out of mousepad — before getting
 * the knife all the way round.
 */
const PX_PER_TURN = 340;

/** Movement under this is a click, not a drag. */
const TAP_SLOP = 5;

function frameSrc(spin: HeroSpin, index: number): string {
  return `${spin.dir}/frame-${String(index).padStart(3, "0")}.${spin.ext ?? "webp"}`;
}

/**
 * The visitor drags and the knife moves.
 *
 * It plays frames rather than rendering a model. A model of a knife is an
 * object nobody made: it would invent the grind, the tang, the pin placement
 * and the hammer marks. Frames can only ever show what was really there.
 *
 * Two kinds feed it, and `spin.arc` is what tells them apart. A full 360 comes
 * from a real turntable shoot and wraps. A shorter arc is derived from the one
 * product photograph by estimating thickness from the silhouette — the same
 * pixels, genuinely re-projected, but only far enough to feel solid. It clamps,
 * and it never pretends to reach the far side, because nothing photographed it.
 *
 * There is no autoplay and no momentum: the knife moves exactly as far as the
 * pointer does and stops when it stops. Nothing moves on its own, which also
 * means there is nothing for `prefers-reduced-motion` to suppress.
 */
export function SpinViewer({ spin, alt, className = "", onTap, poster }: SpinViewerProps) {
  // A sweep opens at its middle frame, which is the undistorted photograph —
  // frame 0 is one extreme, and resting there would show every visitor a
  // tilted knife instead of the picture that was actually taken.
  const [index, setIndex] = useState(() =>
    (spin.arc ?? 360) >= 360 ? 0 : Math.floor((spin.frames - 1) / 2),
  );
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Which frames have arrived. State rather than a ref: render reads this to
  // pick the nearest available frame, and reading a ref during render is not
  // safe under concurrent rendering.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);

  // Coarse pass first, so the viewer is usable in a fraction of the bytes, then
  // fill in the rest in the background.
  useEffect(() => {
    let cancelled = false;
    const order: number[] = [];
    const stride = Math.max(1, Math.round(spin.frames / FIRST_PASS));
    for (let i = 0; i < spin.frames; i += stride) order.push(i);
    for (let i = 0; i < spin.frames; i++) if (!order.includes(i)) order.push(i);

    let firstPassRemaining = Math.min(FIRST_PASS, order.length);

    order.forEach((i) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setLoaded((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
        firstPassRemaining -= 1;
        if (firstPassRemaining <= 0) setReady(true);
      };
      img.onerror = () => {
        if (cancelled) return;
        firstPassRemaining -= 1;
        if (firstPassRemaining <= 0) setReady(true);
      };
      img.src = frameSrc(spin, i);
    });

    return () => {
      cancelled = true;
    };
  }, [spin]);

  /** The nearest frame that has actually arrived, so it never flashes empty. */
  let resolved = index;
  if (!loaded.has(index)) {
    for (let d = 1; d <= spin.frames; d++) {
      const before = (index - d + spin.frames) % spin.frames;
      const after = (index + d) % spin.frames;
      if (loaded.has(before)) { resolved = before; break; }
      if (loaded.has(after)) { resolved = after; break; }
      resolved = 0;
    }
  }

  // A full turntable wraps; a limited sweep clamps, so it settles at each end
  // instead of snapping back to the opposite extreme.
  const arc = spin.arc ?? 360;
  const wraps = arc >= 360;

  const clamp = useCallback(
    (i: number) =>
      wraps
        ? ((i % spin.frames) + spin.frames) % spin.frames
        : Math.min(spin.frames - 1, Math.max(0, i)),
    [spin.frames, wraps],
  );

  const step = useCallback((delta: number) => setIndex((i) => clamp(i + delta)), [clamp]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!ready) return;
      surface.current?.setPointerCapture(e.pointerId);
      drag.current = { x: e.clientX, from: index, moved: false };
      setDragging(true);
    },
    [index, ready],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      const travel = e.clientX - d.x;
      if (Math.abs(travel) > TAP_SLOP) d.moved = true;
      // The pointer is captured, so this keeps counting past the element's
      // edges and the knife keeps turning as long as the pointer moves.
      // A short sweep gets a slower mapping: it is a fine inspection, not a
      // spin, and it should not shoot end to end in a flick.
      const perFrame = wraps ? PX_PER_TURN / spin.frames : 20;
      setIndex(clamp(d.from + Math.round(travel / perFrame)));
    },
    [wraps, spin.frames, clamp],
  );

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d) return;
      surface.current?.releasePointerCapture?.(e.pointerId);
      drag.current = null;
      setDragging(false);
      // A press that never moved is a click on the product, not a rotation.
      if (!d.moved) onTap?.();
    },
    [onTap],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        step(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        step(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(wraps ? 0 : Math.floor((spin.frames - 1) / 2));
      } else if ((e.key === "Enter" || e.key === " ") && onTap) {
        e.preventDefault();
        onTap();
      }
    },
    [step, onTap, wraps, spin.frames],
  );

  const degrees = wraps
    ? Math.round((index / spin.frames) * 360)
    : Math.round(-arc / 2 + (index / Math.max(spin.frames - 1, 1)) * arc);

  return (
    <div className="spin-wrap">
      <div
        ref={surface}
        className={`spin ${className}`}
        data-dragging={dragging || undefined}
        data-ready={ready || undefined}
        style={{ aspectRatio: `${spin.width} / ${spin.height}` }}
        role="slider"
        tabIndex={0}
        aria-label={`${wraps ? "Rotate" : "Tilt"} ${alt}`}
        aria-valuemin={wraps ? 0 : Math.round(-arc / 2)}
        aria-valuemax={wraps ? 359 : Math.round(arc / 2)}
        aria-valuenow={degrees}
        aria-valuetext={`${wraps ? "Rotated" : "Tilted"} ${degrees} degrees`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
      {/* eslint-disable-next-line @next/next/no-img-element -- the frame src
          changes many times a second while dragging; next/image would remount
          and re-request on every step. These are pre-sized, pre-optimised
          frames that the loader above has already warmed. */}
        <img
          src={ready ? frameSrc(spin, resolved) : (poster ?? frameSrc(spin, resolved))}
          alt={alt}
          width={spin.width}
          height={spin.height}
          className="spin-frame"
          draggable={false}
        />
      </div>

      {/* Below the frame rather than floating over it: overlaid, it landed on
          whatever followed the viewer once the panel got short. */}
      {ready ? (
        <p className="spin-hint" aria-hidden="true">
          {wraps ? "Drag to turn" : "Drag to tilt"}
        </p>
      ) : (
        <p className="spin-loading" role="status">
          Loading views…
        </p>
      )}
    </div>
  );
}
