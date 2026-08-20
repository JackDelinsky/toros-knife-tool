import Link from "next/link";
import { JellybeanKnivesVisual } from "@/components/home/JellybeanKnivesVisual";
import { Reveal } from "@/components/ui/Reveal";
import { TextLink } from "@/components/ui/TextLink";

export function MysteryKnifeBag() {
  return (
    <section
      className="jellybean-drop-section relative overflow-x-hidden border-t border-toros-border/40 section-pad bg-toros-black"
      aria-labelledby="jellybean-drop-heading"
    >
      <div className="pointer-events-none absolute inset-0 mystery-section-fog" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 jellybean-drop-vignette"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 mystery-title-section-mist"
        aria-hidden="true"
      />

      <div className="page-container relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="max-w-md lg:max-w-lg">
              <div className="jellybean-drop-tags">
                <span className="jellybean-drop-tag">Limited Drop</span>
                <span className="jellybean-drop-tag jellybean-drop-tag--series">Series 01</span>
              </div>

              <div className="relative mt-5 inline-block">
                <div className="mystery-title-mist mystery-title-mist-1" aria-hidden="true" />
                <div className="mystery-title-mist mystery-title-mist-2" aria-hidden="true" />
                <h2
                  id="jellybean-drop-heading"
                  className="relative font-display text-3xl font-bold leading-[1.05] text-toros-parchment sm:text-4xl lg:text-[2.75rem]"
                >
                  The Jellybean Drop
                </h2>
              </div>

              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-toros-steel/70">
                Mystery Jellybean Series
              </p>

              <p className="mt-5 text-sm leading-relaxed text-toros-sand/75 sm:text-[15px] sm:leading-[1.7]">
                A sealed run of ultra-compact neck knives. Each bag holds one Jellybean — colorway,
                burl pattern, and paracord unknown until the wrap is broken.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-toros-sand/55 sm:text-[15px] sm:leading-[1.7]">
                Small-batch stock only. No catalog guarantees. What arrives is drawn from what
                remains in the run.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link href="/mystery-bag" className="btn-jellybean-drop inline-flex items-center justify-center">
                  Enter the Drop
                </Link>
                <TextLink href="/mystery-bag">
                  Drop details
                  <span aria-hidden="true">→</span>
                </TextLink>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <JellybeanKnivesVisual />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
