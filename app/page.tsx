import { CollectionNavigator } from "@/components/home/CollectionNavigator";
import { FeaturedEditorial } from "@/components/home/FeaturedEditorial";
import { Hero } from "@/components/home/Hero";
import { JellybeanDrop } from "@/components/home/JellybeanDrop";
import { MakerStory } from "@/components/home/MakerStory";
import { NewsletterClose } from "@/components/home/NewsletterClose";

/**
 * The homepage reads as one journey: the carousel, then where to go, then what
 * is on the bench, then who made it, then the one offer worth interrupting for,
 * then a quiet close.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <CollectionNavigator />
      <FeaturedEditorial />
      <MakerStory />
      <JellybeanDrop />
      <NewsletterClose />
    </>
  );
}
