import { CategoryExperience } from "@/components/home/category/CategoryExperience";
import { HomeShop } from "@/components/home/category/HomeShop";
import { Hero } from "@/components/home/Hero";
import { HeroStage } from "@/components/home/HeroStage";
import { QuickInspectProvider } from "@/components/product/QuickInspectProvider";
import { getShopProducts } from "@/lib/products";

/**
 * The carousel, the family selector it hands you to, then the shop itself.
 * Three steps, each a way further in — not six unrelated bands.
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
      <HomeShop />
    </QuickInspectProvider>
  );
}
