"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSpin } from "@/components/home/hero/hero-knives";

interface SpinViewerProps {
  spin: HeroSpin;
  /** Describes the product once — not once per frame. */
  alt: string;
  className?: string;
}

/** Frames loaded before the viewer becomes interactive, spread evenly. */
const FIRST_PASS = 8;

function frameSrc(spin: HeroSpin, index: number): string {
  return `${spin.dir}/frame-${String(index).padStart(3, "0")}.${spin.ext ?? "webp"}`;
}

/**
 * A turntable viewer: the visitor drags and the knife turns.
 *
 * It plays a sequence of photographs rather than rendering a model. That is the
 * whole point — a 3D model of a knife is something nobody made, and it would
 * invent the grind, the tang, the pin placement and the hammer marks. Every
 * frame here is a photograph of the actual object, so turning it can only ever
 * show what is really there.
 *
 * There is no autoplay and no momentum: the knife moves exactly as far as the
 * pointer does and stops when it stops. Nothing spins on its own, which also
 * means there is nothing for `prefers-reduced-motion` to suppress.
 */
export function SpinViewer({ spin, alt, className = "" }: SpinViewerProps) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  // Which frames have arrived. State rather than a ref: render reads this to
  // pick the nearest available frame, and reading a ref during render is not
  // safe under concurrent rendering.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  const surface = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; from: number } | null>(null);

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

  const step = useCallback(
    (delta: number) => setIndex((i) => (((i + delta) % spin.frames) + spin.frames) % spin.frames),
    [spin.frames],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!ready) return;
      surface.current?.setPointerCapture(e.pointerId);
      drag.current = { x: e.clientX, from: index };
      setDragging(true);
    },
    [index, ready],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      const width = surface.current?.clientWidth ?? 1;
      if (!d) return;
      // Roughly one full turn per container width dragged.
      const perFrame = width / spin.frames;
      const moved = Math.round((e.clientX - d.x) / perFrame);
      const next = (((d.from + moved) % spin.frames) + spin.frames) % spin.frames;
      setIndex(next);
    },
    [spin.frames],
  );

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    surface.current?.releasePointerCapture?.(e.pointerId);
    drag.current = null;
    setDragging(false);
  }, []);

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
        setIndex(0);
      }
    },
    [step],
  );

  const degrees = Math.round((index / spin.frames) * 360);

  return (
    <div
      ref={surface}
      className={`spin ${className}`}
      data-dragging={dragging || undefined}
      data-ready={ready || undefined}
      style={{ aspectRatio: `${spin.width} / ${spin.height}` }}
      role="slider"
      tabIndex={0}
      aria-label={`Rotate ${alt}`}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={degrees}
      aria-valuetext={`Rotated ${degrees} degrees`}
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
        src={frameSrc(spin, resolved)}
        alt={alt}
        width={spin.width}
        height={spin.height}
        className="spin-frame"
        draggable={false}
      />

      {ready ? (
        <p className="spin-hint" aria-hidden="true">
          Drag to turn
        </p>
      ) : (
        <p className="spin-loading" role="status">
          Loading views…
        </p>
      )}
    </div>
  );
}
