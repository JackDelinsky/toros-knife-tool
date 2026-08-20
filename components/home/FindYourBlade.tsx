import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";
import { JELLYBEAN_IMAGE_PATHS, productMainImage } from "@/lib/image-paths";

const BLADE_CATEGORIES = [
  {
    title: "Fixed Blades",
    description: "Field & hunt",
    href: "/shop?category=fixed-blades",
    image: productMainImage("bos-stag-golden-horn"),
    alt: "BOS Stag Golden Horn fixed blade knife",
    imageClass: "find-blade-img find-blade-img--product",
  },
  {
    title: "Custom Knives",
    description: "One-of-one builds",
    href: "/shop?category=custom-knives",
    image: productMainImage("gur-tuva"),
    alt: "GUR Tuva custom knife with deer antler handle",
    imageClass: "find-blade-img find-blade-img--product",
  },
  {
    title: "Folding Knives",
    description: "Everyday carry",
    href: "/shop?category=folding-knives",
    image: productMainImage("kam-ram"),
    alt: "Kam Ram folding knife",
    imageClass: "find-blade-img find-blade-img--product",
  },
  {
    title: "Jellybean Series",
    description: "Compact collectible neck knives",
    href: "/shop?category=neck-knives",
    image: JELLYBEAN_IMAGE_PATHS.group,
    alt: "Toros Jellybean neck knives",
    imageClass: "find-blade-img find-blade-img--jellybean",
  },
] as const;

export function FindYourBlade() {
  return (
    <section
      className="border-t border-toros-border/60 bg-toros-black section-pad"
      aria-labelledby="find-your-blade-heading"
    >
      <div className="page-container">
        <Reveal>
          <div className="max-w-xl">
            <p className="eyebrow">Shop</p>
            <h2
              id="find-your-blade-heading"
              className="mt-2 font-display text-2xl font-bold leading-tight text-toros-parchment sm:text-3xl"
            >
              Find Your Blade
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
          {BLADE_CATEGORIES.map((category, index) => (
            <Reveal key={category.href} delay={index * 60}>
              <Link
                href={category.href}
                className="collection-card group block overflow-hidden rounded-sm"
              >
                <div className="find-blade-card-media relative bg-toros-black">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    className={`transition-transform duration-700 ease-out group-hover:scale-[1.03] ${category.imageClass}`}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-toros-black via-toros-black/10 to-transparent"
                    aria-hidden="true"
                  />
                </div>
                <div className="border-t border-toros-border/50 px-4 py-4 sm:px-5 sm:py-5">
                  <h3 className="font-display text-lg font-semibold text-toros-parchment transition-colors group-hover:text-toros-brass-light sm:text-xl">
                    {category.title}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-toros-steel transition-colors group-hover:text-toros-sand/90">
                    {category.description}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-8">
            <TextLink href="/shop">
              View All Categories
              <span aria-hidden="true">→</span>
            </TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
