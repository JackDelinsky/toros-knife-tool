import { getRailCategories } from "@/components/home/category/category-data";
import { CategoryRail } from "@/components/home/category/CategoryRail";

/**
 * Everything below the hero.
 *
 * The homepage used to be five unrelated bands stacked on top of each other.
 * It is now one destination: the visitor leaves the carousel, the categories
 * rise into view, and picking one opens its products in place. Server
 * component — the catalogue is read once here and handed down.
 */
export function CategoryExperience() {
  const categories = getRailCategories();
  if (categories.length === 0) return null;

  return <CategoryRail categories={categories} />;
}
