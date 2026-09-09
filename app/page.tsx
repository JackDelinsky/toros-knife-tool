import { CategoryExperience } from "@/components/home/category/CategoryExperience";
import { Hero } from "@/components/home/Hero";
import { HeroStage } from "@/components/home/HeroStage";

/**
 * The homepage is two things now, not six: the carousel, and the catalogue it
 * hands you to. Everything that used to sit between them was a separate band
 * competing for the same scroll.
 */
export default function Home() {
  return (
    <>
      <HeroStage>
        <Hero />
      </HeroStage>
      <CategoryExperience />
    </>
  );
}
