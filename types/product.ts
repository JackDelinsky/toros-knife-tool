export type ProductCategory =
  | "fixed-blades"
  | "neck-knives"
  | "folding-knives"
  | "custom-knives"
  | "axes-hatchets";

export interface ProductSpecRow {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number;
  shortDescription: string;
  longDescription: string;
  /** Product photos — empty array uses styled placeholder until real assets are added */
  images: string[];
  /** 360 spin frame URLs — reserved for Phase 2 Knife360Viewer */
  spinImages: string[];
  steel: string;
  handleMaterial: string;
  bladeLength: string;
  totalLength: string;
  bestUses: string[];
  inStock: boolean;
  featured: boolean;
  /** Whether custom options / commission flow applies */
  customAvailable: boolean;
  tags: string[];
  craftsmanshipStory: string;
  careInstructions: string;
  /** Shopify Buy Button URL, Stripe Checkout link, or external cart URL */
  checkoutUrl: string;
  /** Optional extended specs for product detail table */
  weight?: string;
  sheath?: string;
  madeIn?: string;
  warranty?: string;
  /** Premium story block on product page — falls back to craftsmanshipStory */
  craftsmanshipBlurb?: string;
  /** Override auto-built spec rows when provided */
  specRows?: ProductSpecRow[];
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "fixed-blades": "Fixed Blades",
  "neck-knives": "Neck Knives",
  "folding-knives": "Folding Knives",
  "custom-knives": "Custom Knives",
  "axes-hatchets": "Axes & Hatchets",
};

export const CATEGORY_KNIFE_TYPES: Record<ProductCategory, string> = {
  "fixed-blades": "Fixed blade",
  "neck-knives": "Neck knife",
  "folding-knives": "Folding knife",
  "custom-knives": "Custom knife",
  "axes-hatchets": "Axe / hatchet",
};

export const CATEGORY_DESCRIPTIONS: Record<ProductCategory, string> = {
  "fixed-blades": "Full-tang field knives built for hunting, bushcraft, and hard use.",
  "neck-knives": "Compact backup blades that stay close when it matters most.",
  "folding-knives": "Everyday carry folders with Turkish-inspired design details.",
  "custom-knives": "One-of-a-kind pieces shaped to your vision and purpose.",
  "axes-hatchets": "Camp axes and hatchets forged for splitting, carving, and fire prep.",
};
