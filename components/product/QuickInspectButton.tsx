"use client";

import { useQuickInspect } from "@/components/product/QuickInspectProvider";

/**
 * The card's quick-inspect control.
 *
 * Renders nothing when the page has no dialog mounted, rather than offering a
 * button that would do nothing. The card's own link to the product page is
 * always there either way, so no route is ever reachable only through this.
 */
export function QuickInspectButton({ slug, name }: { slug: string; name: string }) {
  const inspect = useQuickInspect();
  if (!inspect) return null;
  return (
    <button
      type="button"
      className="pcard-inspect"
      onClick={(event) => {
        // The card is a link; this control is not part of that navigation.
        event.preventDefault();
        event.stopPropagation();
        inspect.open(slug);
      }}
    >
      Quick look
      <span className="sr-only"> at {name}</span>
    </button>
  );
}
