import Image from "next/image";
import Link from "next/link";
import { BRAND_IMAGES } from "@/lib/brand-images";

/**
 * The family, in one paragraph and one photograph.
 *
 * Everything stated here is either visible in the picture or already recorded
 * in the repository. No timeline, no generations, no founding date.
 */
export function MakerStory() {
  return (
    <section className="section-pad maker" aria-labelledby="maker-heading">
      <div className="page-container editorial editorial--center">
        <figure className="maker-figure">
          <div className="media media--landscape">
            <Image
              src={BRAND_IMAGES.maker}
              alt="Murat and Aydin Toros holding finished knives at the workshop bench"
              fill
              sizes="(max-width: 900px) 100vw, 58vw"
              className="maker-img"
            />
          </div>
          <figcaption className="maker-caption">
            Murat and Aydin Toros — father and son, at the bench in Georgia.
          </figcaption>
        </figure>

        <div>
          <p className="eyebrow">The workshop</p>
          <h2 id="maker-heading" className="t-h2 maker-heading">
            Every blade passes through the same hands
          </h2>
          <p className="t-body maker-copy">
            Toros Knife &amp; Tool is a father-and-son workshop, not a production line. The
            knives carry Turkish steel and material knowledge — N690, 1075 and 1084 carbon,
            walnut, antler, burl — and they are finished for American field use, where a knife
            has to earn the space it takes up.
          </p>
          <p className="t-body maker-copy">
            Runs are small because two people can only finish so many edges. When something
            leaves the bench, one of them put the last pass on it.
          </p>
          <Link href="/about" className="link maker-link">
            More about the shop
          </Link>
        </div>
      </div>
    </section>
  );
}
