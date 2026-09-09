import { CategoryExperience } from "@/components/home/category/CategoryExperience";
import { HomeShop } from "@/components/home/category/HomeShop";
import { Hero } from "@/components/home/Hero";
import { HeroStage } from "@/components/home/HeroStage";

/**
 * The carousel, the family selector it hands you to, then the shop itself.
 * Three steps, each a way further in — not six unrelated bands.
 */
export default function Home() {
  return (
    <>
      <HeroStage>
        <Hero />
      </HeroStage>
      <CategoryExperience />
      <HomeShop />
    </>
  );
}
