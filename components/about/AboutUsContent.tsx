import type { ReactNode } from "react";
import Link from "next/link";
import { BrandImage } from "@/components/BrandImage";
import { MosaicDivider, PatternBackground } from "@/components/ui/GeometricAccents";
import { TorosLogo } from "@/components/ui/TorosLogo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BRAND_IMAGES } from "@/lib/brand-images";

function StoryBlock({
  title,
  image,
  imageAlt,
  children,
  imageFirst = true,
}: {
  title: string;
  image: string;
  imageAlt: string;
  children: ReactNode;
  imageFirst?: boolean;
}) {
  return (
    <article className="grid gap-6 lg:grid-cols-2 lg:gap-10 lg:items-center">
      <div className={imageFirst ? "order-1" : "order-1 lg:order-2"}>
        <div className="overflow-hidden rounded-sm border border-toros-border shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <BrandImage
            src={image}
            alt={imageAlt}
            className="aspect-[16/10] sm:aspect-[4/3]"
            overlay="none"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className={imageFirst ? "order-2" : "order-2 lg:order-1"}>
        <h2 className="font-display text-xl font-semibold text-toros-brass sm:text-2xl">{title}</h2>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-toros-sand/80 sm:text-base">
          {children}
        </div>
      </div>
    </article>
  );
}

export function AboutUsContent() {
  return (
    <div className="bg-toros-charcoal pattern-mosaic">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PatternBackground variant="none">
          <div className="mx-auto max-w-2xl text-center">
            <TorosLogo size="lg" className="mx-auto opacity-95" />
            <div className="mt-5">
              <SectionHeader eyebrow="About Us" title="Our Turkish-American Story" align="center" />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-sm border border-toros-border bg-toros-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <BrandImage
              src={BRAND_IMAGES.aboutBanner}
              alt="Murat and Aydin holding the Toros Knife & Tool banner outdoors"
              className="aspect-[3/2] sm:aspect-[16/10]"
              objectFit="contain"
              overlay="none"
              sizes="100vw"
            />
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-toros-sand/80 sm:text-base">
            Toros Knife & Tool is a family-owned business founded by father-son duo, Murat and Aydin,
            with a little behind-the-scenes help from Momma C.
          </p>

          <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-16">
            <StoryBlock
              title="How It Started"
              image={BRAND_IMAGES.aboutBushcraft}
              imageAlt="Aydin, Murat, and Greg at a Georgia Bushcraft event"
            >
              <p>
                Aydin started whittling when he was ten: spoons, small animals, you name it. That hobby
                soon turned into a fascination with knives. He dove in, learning as much as he could
                (thank God for YouTube), and quickly fell in love with the knife community.
              </p>
              <p>
                Murat, an avid supporter of all Aydin&apos;s interests, took him to Georgia Bushcraft
                events, the Atlanta Blade Show, and reconnected with Greg, a close friend with over 30
                years of experience in the knife industry. Greg introduced them to Lee at Olde Towne
                Cutlery, who has also been a huge support from the beginning.
              </p>
              <p>
                Grateful for Greg and Lee&apos;s guidance and the tight-knit knife community that
                welcomed them, they began looking beyond their local circle toward something bigger.
              </p>
            </StoryBlock>

            <StoryBlock
              title="The International Connection"
              image={BRAND_IMAGES.aboutInternational}
              imageAlt="Murat and Aydin showcasing Turkish knives and leather sheaths"
              imageFirst={false}
            >
              <p>
                In towns and villages across Türkiye, bladesmiths have been passing down their skills
                for centuries, crafting survival tools, Ottoman-era weaponry, and knives built to last.
              </p>
              <p>
                In 2023, Murat and Aydin traveled through Türkiye, visiting numerous knife makers and
                hand-selecting the finest products to bring to America.
              </p>
              <p>
                Inspired by that experience, Aydin moved from collecting knives to making them himself
                in his garage.
              </p>
              <p>
                Toros Knife & Tool grew from a desire to share these world-class Turkish knives and the
                history they carry.
              </p>
            </StoryBlock>

            <StoryBlock
              title="How It's Going"
              image={BRAND_IMAGES.aboutJellybeanDisplay}
              imageAlt="Toros Jellybean knives on a wooden display stand"
            >
              <p>
                After sampling dozens of products, Murat and Aydin officially launched Toros Knife &
                Tool in 2025.
              </p>
              <p>
                They partner with experienced makers who take pride in every blade, working with quality
                materials and building on generations of skill. Aydin continues to craft his own knives
                in Georgia, producing one-of-a-kind pieces featuring fresh designs.
              </p>
              <p>
                At its core, Toros is about{" "}
                <strong className="font-semibold text-toros-cream">grit, adaptability, and perseverance</strong>
                : connecting with the outdoors, learning from your surroundings, and putting that knowledge
                to use.
              </p>
            </StoryBlock>
          </div>

          <div className="mt-12 flex justify-center sm:mt-14">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-sm border border-toros-oxblood/60 bg-toros-black/50 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-toros-parchment transition-all hover:border-toros-brass/55 hover:bg-toros-oxblood/35 hover:shadow-[0_0_28px_rgba(168,137,74,0.15)]"
            >
              Shop Our Knives
            </Link>
          </div>

          <MosaicDivider className="mt-12" />
        </PatternBackground>
      </div>
    </div>
  );
}
