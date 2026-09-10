"use client";

import { useEffect, useState } from "react";

/** Frames loaded before the sequence becomes interactive, spread evenly. */
const FIRST_PASS = 8;

export interface FrameSource {
  dir: string;
  frames: number;
  ext?: string;
}

export function frameSrc(seq: FrameSource, index: number): string {
  return `${seq.dir}/frame-${String(index).padStart(3, "0")}.${seq.ext ?? "webp"}`;
}

export interface FrameSequenceState {
  /** True once enough frames have arrived to drag through the whole range. */
  ready: boolean;
  /** True if every frame request failed — the caller should show its poster. */
  failed: boolean;
  loaded: ReadonlySet<number>;
  /** The nearest frame that has actually arrived, so it never flashes empty. */
  resolve: (index: number) => number;
}

/**
 * Loads a frame sequence coarsely first, then fills in.
 *
 * A sweep is usable long before all of it has arrived: eight frames spread
 * across the range already cover the whole travel, just in bigger steps, so
 * the viewer becomes interactive in a fraction of the bytes and sharpens as
 * the rest land. Nothing waits for the last frame.
 */
export function useFrameSequence(seq: FrameSource): FrameSequenceState {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // State rather than a ref: render reads this to pick the nearest available
  // frame, and reading a ref during render is not safe under concurrent
  // rendering.
  const [loaded, setLoaded] = useState<ReadonlySet<number>>(() => new Set());

  // Clearing on a source change is done during render, not in the effect.
  // Resetting from inside the effect would paint one frame of the previous
  // sequence's progress against the new one, and React rightly rejects it.
  const [source, setSource] = useState(seq);
  if (source !== seq) {
    setSource(seq);
    setReady(false);
    setFailed(false);
    setLoaded(new Set());
  }

  useEffect(() => {
    let cancelled = false;

    const order: number[] = [];
    const stride = Math.max(1, Math.round(seq.frames / FIRST_PASS));
    for (let i = 0; i < seq.frames; i += stride) order.push(i);
    for (let i = 0; i < seq.frames; i++) if (!order.includes(i)) order.push(i);

    let firstPassRemaining = Math.min(FIRST_PASS, order.length);
    let errors = 0;

    const settle = () => {
      firstPassRemaining -= 1;
      if (firstPassRemaining <= 0) setReady(true);
    };

    order.forEach((i) => {
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setLoaded((prev) => new Set(prev).add(i));
        settle();
      };
      img.onerror = () => {
        if (cancelled) return;
        errors += 1;
        // Every frame missing means the sequence is not deployed. Say so, so
        // the viewer can fall back to the poster instead of showing nothing.
        if (errors >= seq.frames) setFailed(true);
        settle();
      };
      img.src = frameSrc(seq, i);
    });

    return () => {
      cancelled = true;
    };
  }, [seq]);

  const resolve = (index: number) => {
    if (loaded.has(index)) return index;
    for (let d = 1; d <= seq.frames; d++) {
      const before = (index - d + seq.frames) % seq.frames;
      const after = (index + d) % seq.frames;
      if (loaded.has(before)) return before;
      if (loaded.has(after)) return after;
    }
    return 0;
  };

  return { ready, failed, loaded, resolve };
}
