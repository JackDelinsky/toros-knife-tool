import { CategoryExperience } from "@/components/home/category/CategoryExperience";
import { Hero } from "@/components/home/Hero";
import { HeroStage } from "@/components/home/HeroStage";
import { QuickInspectProvider } from "@/components/product/QuickInspectProvider";
import { getShopProducts } from "@/lib/products";

/**
 * The carousel, then the family selector it hands you to.
 *
 * The homepage deliberately stops there. It used to continue into the whole
 * eighteen-knife catalogue, which made it a second shop page and removed any
 * reason to choose a category — the categories were decoration above a grid
 * that already showed everything. Picking a family now opens a curated few
 * and sends you to the shop for the rest.
 *
 * One closer-look dialog wraps all three, so a knife opened from the hero and
 * the same knife opened from a card below are the same experience.
 */
export default function Home() {
  return (
    <QuickInspectProvider products={getShopProducts()}>
      <HeroStage>
        <Hero />
      </HeroStage>
      <CategoryExperience />
    </QuickInspectProvider>
  );
}
