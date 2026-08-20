import Link from "next/link";
import { HeroFeaturedKnife } from "@/components/home/HeroFeaturedKnife";
import { HeroMountains } from "@/components/home/HeroMountains";
import { ShopKnivesButton } from "@/components/ui/ShopKnivesButton";

const HERO_TRUST = [
  "Handmade",
  "Small Batch",
  "Turkish Heritage",
  "Ships from Georgia",
];

export function Hero() {
  return (
    <section className="relative min-h-[82vh] overflow-hidden lg:min-h-[94vh]">
      <div
        className="absolute inset-0 bg-gradient-to-b from-toros-black via-[#0a0a0a] to-toros-black"
        aria-hidden="true"
      />

      <div className="hero-geometry-texture pointer-events-none absolute inset-0" aria-hidden="true" />

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_58%_40%,rgba(168,137,74,0.06),transparent_55%)] lg:bg-[radial-gradient(ellipse_at_62%_42%,rgba(168,137,74,0.07),transparent_58%)]"
        aria-hidden="true"
      />

      <HeroMountains />

      <div className="relative z-10 page-container min-h-[82vh] py-10 sm:py-12 lg:min-h-[94vh] lg:py-14">
        <div className="flex min-h-[72vh] flex-col justify-center lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-6 lg:min-h-0">
          <div className="text-center lg:col-span-5 lg:text-left">
            <p className="eyebrow text-toros-brass-light">Handcrafted Knives</p>
            <h1 className="mt-4 font-display text-[2.75rem] font-bold leading-[1.02] text-toros-parchment sm:text-5xl lg:text-[3.75rem] xl:text-[4rem]">
              Forge Your Own Path
            </h1>

            <div className="mt-8 hidden lg:block">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <ShopKnivesButton size="lg" />
                <Link
                  href="/about"
                  className="text-[11px] font-bold uppercase tracking-[0.22em] text-toros-steel transition-colors hover:text-toros-brass-light"
                >
                  Our story →
                </Link>
              </div>

              <ul className="hero-trust-list mt-7">
                {HERO_TRUST.map((item) => (
                  <li key={item} className="hero-trust-item">
                    <span className="hero-trust-check" aria-hidden="true">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative mt-8 w-full sm:mt-10 lg:col-span-6 lg:col-start-6 lg:mt-0">
            <HeroFeaturedKnife />
          </div>

          <div className="mt-8 text-center lg:col-span-5 lg:hidden">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <ShopKnivesButton size="lg" />
              <Link
                href="/about"
                className="text-[11px] font-bold uppercase tracking-[0.22em] text-toros-steel transition-colors hover:text-toros-brass-light"
              >
                Our story →
              </Link>
            </div>

            <ul className="hero-trust-list mx-auto mt-6 sm:mt-7">
              {HERO_TRUST.map((item) => (
                <li key={item} className="hero-trust-item">
                  <span className="hero-trust-check" aria-hidden="true">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
