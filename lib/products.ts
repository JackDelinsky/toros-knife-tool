import { products } from "@/data/products";
import { MYSTERY_BAG_SLUG } from "@/lib/image-paths";
import type { Product, ProductCategory } from "@/types/product";

export function getAllProducts(): Product[] {
  return products;
}

export function getShopProducts(): Product[] {
  return products.filter((p) => p.slug !== MYSTERY_BAG_SLUG);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByTag(tag: string): Product[] {
  return getShopProducts().filter((p) => p.tags.includes(tag));
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}

export function getMysteryBagProduct(): Product | undefined {
  return getProductBySlug(MYSTERY_BAG_SLUG);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
