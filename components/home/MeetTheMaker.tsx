import { BrandImage } from "@/components/BrandImage";
import { TextLink } from "@/components/ui/TextLink";
import { TorosLogo } from "@/components/ui/TorosLogo";
import { BRAND_IMAGES } from "@/lib/brand-images";

const PILLARS = [
  { label: "Hand-Finished", detail: "Every edge by hand" },
  { label: "Small-Batch", detail: "Quality over volume" },
  { label: "Direct Shop", detail: "From our bench to you" },
];

export function MeetTheMaker() {
  return (
    <section
      id="maker"
      className="relative overflow-hidden border-t border-toros-border bg-toros-charcoal section-pad"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(92,26,31,0.14),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_20%,rgba(168,137,74,0.09),transparent_50%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 pattern-mosaic opacity-[0.18]" aria-hidden="true" />

      <div className="relative page-container">
        <div className="mx-auto max-w-2xl text-center">
          <TorosLogo size="lg" className="mx-auto opacity-95" />
          <p className="eyebrow mt-5">Meet the Maker</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-toros-parchment sm:text-4xl">
            A Family Shop, Two Homelands
          </h2>
          <div className="engraved-rule mx-auto mt-5 w-28" aria-hidden="true" />
        </div>

        <div className="mt-10 grid items-center gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="relative">
              <div
                className="absolute -inset-px rounded-sm bg-gradient-to-br from-toros-brass/35 via-toros-border/80 to-toros-oxblood/25"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-sm border border-toros-border/90 bg-toros-black shadow-[0_28px_80px_rgba(0,0,0,0.65)]">
                <BrandImage
                  src={BRAND_IMAGES.maker}
                  alt="Murat and Aydin showcasing handcrafted knives at the Toros workshop"
                  className="aspect-[4/5] sm:aspect-[16/11] lg:aspect-[16/10]"
                  overlay="none"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-toros-black/85 via-toros-black/10 to-toros-black/25"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 border-t border-toros-brass/15 bg-toros-black/80 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-toros-brass">
                        Murat & Aydin Toros
                      </p>
                      <p className="mt-1 text-xs text-toros-sand/75">
                        Father-son founders · Georgia workshop
                      </p>
                    </div>
                    <TorosLogo size="sm" className="opacity-90 shrink-0" />
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none absolute -left-2 -top-2 h-14 w-14 border-l border-t border-toros-brass/35"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-2 -right-2 h-14 w-14 border-b border-r border-toros-brass/35"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <blockquote className="font-display text-xl font-medium leading-snug text-toros-cream/95 sm:text-2xl">
              <span className="text-toros-brass/80">&ldquo;</span>
              Every blade passes through the same hands, from steel selection to final edge.
              <span className="text-toros-brass/80">&rdquo;</span>
            </blockquote>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-toros-sand/80 sm:text-base">
              <p>
                Toros Knife & Tool is a family workshop, not a factory line. Our story crosses continents:
                Turkish roots that honor skilled metalwork, and American backcountry where a knife has to earn
                its place in the kit.
              </p>
              <p>
                That tension between heritage and hard use is what defines every Toros blade. When you order from us,
                you support a small shop that chooses quality over volume and stands behind every piece that
                leaves the bench.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-sm border border-toros-border bg-toros-surface/50">
              <div className="grid grid-cols-3 divide-x divide-toros-border">
                {PILLARS.map((item) => (
                  <div key={item.label} className="px-3 py-4 text-center sm:px-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-toros-brass sm:text-[11px]">
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-snug text-toros-steel sm:text-xs">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <TextLink href="/about">
              Read our full story
              <span aria-hidden="true">→</span>
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
