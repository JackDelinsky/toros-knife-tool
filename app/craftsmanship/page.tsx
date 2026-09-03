import type { Metadata } from "next";
import { ScrollExpandMedia } from "@/components/ui/ScrollExpandMedia";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "Scroll through the making of a Toros blade — Turkish steel, walnut, and generations of bladesmithing skill.",
};

export default function CraftsmanshipPage() {
  return (
    <ScrollExpandMedia
      mediaType="image"
      mediaSrc="/images/products/gur-mizrak/hero-crop.jpg"
      bgImageSrc="/images/brand/hero.png"
      title="GUR Mızrak"
      date="Custom Knives · Turkish Walnut"
      scrollToExpand="Scroll to see it up close"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-2xl font-bold text-toros-cream sm:text-3xl">
          Built on Generations of Skill
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-toros-sand/80 sm:text-base">
          Turkish makers have shaped steel for centuries, crafting survival tools,
          Ottoman-era weaponry, and knives built to last. The GUR Mızrak carries
          that tradition forward: a walnut handle with natural grain, a distinct
          black spacer for contrast, and a clean, refined profile forged in
          1075 carbon steel.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-toros-sand/80 sm:text-base">
          Toros hand-selects blades like this one directly from Turkish
          bladesmiths, building on generations of skill and materials sourced
          the same way they always have been.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button href="/products/gur-mizrak" variant="primary" size="lg">
            View This Knife
          </Button>
          <Button href="/shop?category=custom-knives" variant="secondary" size="lg">
            Shop Custom Knives
          </Button>
        </div>
      </div>
    </ScrollExpandMedia>
  );
}
