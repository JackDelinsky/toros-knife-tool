import Image from "next/image";
import Link from "next/link";
import { JELLYBEAN_IMAGE_PATHS } from "@/lib/image-paths";
import { getMysteryBagProduct, formatPrice } from "@/lib/products";

/**
 * The Mystery Jellybean bag, as one image and one idea.
 *
 * The previous version of this section left roughly a screen of empty black
 * between a headline and a floating-knife visual that never really landed. The
 * three isolated colourways are real cutouts of real knives, so they can simply
 * be shown at size.
 */
export function JellybeanDrop() {
  const bag = getMysteryBagProduct();

  const knives = [
    { src: JELLYBEAN_IMAGE_PATHS.red, alt: "Jellybean neck knife with a red resin handle" },
    { src: JELLYBEAN_IMAGE_PATHS.blue, alt: "Jellybean neck knife with a blue resin handle" },
    { src: JELLYBEAN_IMAGE_PATHS.green, alt: "Jellybean neck knife with a green resin handle" },
  ];

  return (
    <section className="drop" aria-labelledby="drop-heading">
      <div className="page-container editorial editorial--reverse editorial--center">
        <div className="drop-copy">
          <p className="eyebrow">Mystery Jellybean Series</p>
          <h2 id="drop-heading" className="t-display drop-heading">
            One bag.
            <br />
            One knife.
            <br />
            No choosing.
          </h2>
          <p className="t-lead drop-lead">
            A sealed run of ultra-compact neck knives. Colourway, burl pattern and paracord
            stay unknown until you open it — and what is in the bag is drawn from whatever is
            left in the run.
          </p>
          <div className="drop-actions">
            <Link href="/mystery-bag" className="btn btn--primary">
              Open a bag{bag ? ` — ${formatPrice(bag.price)}` : ""}
            </Link>
            <Link href="/shop?category=neck-knives" className="btn btn--quiet">
              See the series
            </Link>
          </div>
        </div>

        <div className="drop-visual" aria-hidden="false">
          {knives.map((knife, index) => (
            <div key={knife.src} className="drop-knife" data-slot={index}>
              <Image
                src={knife.src}
                alt={knife.alt}
                width={420}
                height={1200}
                sizes="(max-width: 900px) 28vw, 16vw"
                className="drop-knife-img"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
