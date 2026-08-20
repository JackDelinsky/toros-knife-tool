import Image from "next/image";
import Link from "next/link";
import { GeometricBorder } from "@/components/ui/GeometricAccents";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JELLYBEAN_IMAGE_PATHS, productMainImage } from "@/lib/image-paths";

type FeaturedCollection = {
  title: string;
  description: string;
  href: string;
  image: string;
  alt: string;
  containPadding?: string;
};

const COLLECTIONS: FeaturedCollection[] = [
  {
    title: "Fixed Blades",
    description: "Full-size hunting and field knives with full tang strength and heirloom handles.",
    href: "/shop?category=fixed-blades",
    image: productMainImage("bos-stag-golden-horn"),
    alt: "Toros fixed blade knife — full profile with stag handle and sheath",
  },
  {
    title: "Custom Knives",
    description: "One-of-a-kind commissions and small-batch blades shaped to your vision.",
    href: "/shop?category=custom-knives",
    image: productMainImage("toros-ceviz"),
    alt: "Toros custom knife — handcrafted walnut handle and forged steel",
  },
  {
    title: "Jellybean Series",
    description: "Compact neck knives in bold colors — lightweight carry with Toros forge quality.",
    href: "/shop?category=neck-knives",
    image: JELLYBEAN_IMAGE_PATHS.group,
    alt: "Toros Jellybean neck knives — complete silhouettes in signature colors",
    containPadding: "p-4 sm:p-6",
  },
];

export function FeaturedCollections() {
  return (
    <section className="section-pad border-t border-toros-border/60 bg-toros-charcoal">
      <div className="page-container">
        <Reveal>
          <SectionHeader
            eyebrow="The Forge"
            title="Featured Collections"
            description="Editorial knife lines — each silhouette shown in full, from tip to handle."
            align="center"
            size="large"
          />
        </Reveal>

        <GeometricBorder className="mx-auto mt-8 mb-12 max-w-2xl opacity-40" />

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {COLLECTIONS.map((collection, index) => (
            <Reveal key={collection.title} delay={index * 80}>
              <Link href={collection.href} className="collection-card group block overflow-hidden rounded-sm">
                <div className="relative aspect-[4/5] bg-toros-black">
                  <Image
                    src={collection.image}
                    alt={collection.alt}
                    fill
                    className={`object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] ${collection.containPadding ?? "p-5 sm:p-8"}`}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-toros-black via-toros-black/20 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="border-t border-toros-border/50 px-5 py-5 sm:px-6 sm:py-6">
                  <h3 className="font-display text-2xl font-semibold text-toros-parchment transition-colors group-hover:text-toros-brass-light">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-toros-steel">{collection.description}</p>
                  <span className="link-arrow mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-toros-brass transition-colors group-hover:text-toros-brass-light">
                    Explore Collection
                    <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
