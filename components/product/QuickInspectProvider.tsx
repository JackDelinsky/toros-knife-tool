"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence } from "framer-motion";
import { QuickInspect } from "@/components/product/QuickInspect";
import { demoCartAdapter } from "@/lib/demo-cart";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import type { Product } from "@/types/product";

interface QuickInspectApi {
  open: (slug: string) => void;
  close: () => void;
  openSlug: string | null;
}

const Ctx = createContext<QuickInspectApi | null>(null);

/** The query parameter the open product is recorded in. */
const PARAM = "look";

/**
 * Owns the one closer-look dialog for a page.
 *
 * The open product is written into the URL as `?look=<slug>` with
 * `history.pushState`, so Back closes the dialog, Forward reopens it, and a
 * copied link opens on the same knife. That is deliberately done with the
 * History API rather than by routing: `/products/<slug>` already renders a
 * complete page on its own, and rewriting navigation to animate a panel would
 * make a real route depend on a transition.
 */
export function QuickInspectProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [addState, setAddState] = useState<"idle" | "added">("idle");

  const bySlug = useMemo(() => new Map(products.map((p) => [p.slug, p])), [products]);

  // Open on first paint when the URL already names a product, and follow the
  // Back and Forward buttons after that. Reading the URL in an effect rather
  // than during render keeps the server and first client render identical.
  useEffect(() => {
    const fromUrl = () => {
      const slug = new URLSearchParams(window.location.search).get(PARAM);
      setOpenSlug(slug && bySlug.has(slug) ? slug : null);
    };
    fromUrl();
    window.addEventListener("popstate", fromUrl);
    return () => window.removeEventListener("popstate", fromUrl);
  }, [bySlug]);

  const open = useCallback(
    (slug: string) => {
      if (!bySlug.has(slug)) return;
      setOpenSlug(slug);
      setAddState("idle");
      const url = new URL(window.location.href);
      url.searchParams.set(PARAM, slug);
      window.history.pushState({ [PARAM]: slug }, "", url);
    },
    [bySlug],
  );

  const close = useCallback(() => {
    setOpenSlug(null);
    if (new URLSearchParams(window.location.search).has(PARAM)) {
      // Step back rather than pushing a cleaned URL, so opening and closing a
      // dialog does not leave a trail of history entries to click through.
      window.history.back();
    }
  }, []);

  const product = openSlug ? bySlug.get(openSlug) : undefined;

  const addToCart = useCallback(() => {
    if (!product?.inStock) return;
    demoCartAdapter.add({
      slug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity: 1,
    });
    setAddState("added");
  }, [product]);

  const api = useMemo<QuickInspectApi>(() => ({ open, close, openSlug }), [open, close, openSlug]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <AnimatePresence>
        {product ? (
          <QuickInspect
            key={product.slug}
            product={product}
            reducedMotion={reducedMotion}
            addState={addState}
            onAddToCart={addToCart}
            onClose={close}
          />
        ) : null}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

/**
 * The closer look, from anywhere inside the provider.
 *
 * Returns `null` outside one so a card can be rendered on a page that has no
 * dialog — it falls back to its ordinary product link instead of throwing.
 */
export function useQuickInspect(): QuickInspectApi | null {
  return useContext(Ctx);
}
