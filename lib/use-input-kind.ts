"use client";

import { useSyncExternalStore } from "react";

const COARSE = "(pointer: coarse)";

function subscribe(callback: () => void) {
  const list = window.matchMedia(COARSE);
  list.addEventListener("change", callback);
  return () => list.removeEventListener("change", callback);
}

/**
 * Whether the primary pointer is a finger.
 *
 * Used only to word the viewer's instruction — "Swipe" reads as wrong on a
 * desktop and "Drag" reads as wrong on a phone. Read through
 * `useSyncExternalStore` so the server and first client render agree, then
 * correct themselves; guessing during render would be a hydration mismatch.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(COARSE).matches,
    () => false,
  );
}
