/**
 * Local demo commerce boundary.
 *
 * NOTHING HERE IS REAL COMMERCE. No payment is taken, no order is placed and
 * no inventory is reserved. This exists so the hero can express "add to cart"
 * against a typed seam that a real provider can replace later: swap the
 * `CommerceAdapter` implementation for a Shopify Storefront, Stripe Checkout
 * or server cart client and the UI above it does not change.
 */

export interface CartLine {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  /** Reserved: real providers key lines by variant, not product. */
  variantId?: string;
}

export interface CartState {
  lines: CartLine[];
  updatedAt: number;
}

export interface AddToCartInput {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  variantId?: string;
}

export interface CommerceAdapter {
  /** Identifies the implementation in logs and UI copy. */
  readonly kind: "demo" | "shopify" | "stripe";
  read(): CartState;
  add(input: AddToCartInput): CartState;
  clear(): CartState;
  count(state: CartState): number;
}

const STORAGE_KEY = "toros-demo-cart";
const EMPTY: CartState = { lines: [], updatedAt: 0 };

function readStorage(): CartState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed || !Array.isArray(parsed.lines)) return EMPTY;
    return parsed;
  } catch {
    // Private browsing and blocked site data both throw here.
    return EMPTY;
  }
}

function writeStorage(state: CartState): CartState {
  if (typeof window === "undefined") return state;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persisting is a convenience; the in-memory result is still returned.
  }
  return state;
}

/** Client-side only. Swap this out for a real provider without touching the UI. */
export const demoCartAdapter: CommerceAdapter = {
  kind: "demo",

  read() {
    return readStorage();
  },

  add({ slug, name, unitPrice, quantity, variantId }) {
    const current = readStorage();
    const key = variantId ?? slug;
    const lines = [...current.lines];
    const existing = lines.findIndex((line) => (line.variantId ?? line.slug) === key);

    if (existing >= 0) {
      lines[existing] = { ...lines[existing], quantity: lines[existing].quantity + quantity };
    } else {
      lines.push({ slug, name, unitPrice, quantity, variantId });
    }

    return writeStorage({ lines, updatedAt: Date.now() });
  },

  clear() {
    return writeStorage({ lines: [], updatedAt: Date.now() });
  },

  count(state) {
    return state.lines.reduce((total, line) => total + line.quantity, 0);
  },
};
