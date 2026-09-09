"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether the page was opened with `?spin=rig-test`.
 *
 * Read through `useSyncExternalStore` rather than in an effect or a state
 * initialiser: the hero is server-rendered, so the server and the first client
 * render have to agree. This returns `false` for both and then re-renders with
 * the real value, which is exactly the contract that hook exists for.
 */
const subscribe = () => () => {};
const getSnapshot = () =>
  new URLSearchParams(window.location.search).get("spin") === "rig-test";
const getServerSnapshot = () => false;

export function useRigTestMode(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
