import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice, getMysteryBagProduct } from "@/lib/products";
import { JELLYBEAN_IMAGE_PATHS } from "@/lib/image-paths";

export const metadata: Metadata = {
  title: "Mystery Jellybean knife bag",
  description:
    "A sealed bag containing one Jellybean-style neck knife. Colour and handle pattern vary.",
};

/**
 * The one offer on the site worth its own page.
 *
 * The old version claimed each bag was "valued above purchase price". Nothing
 * in the catalogue substantiates that, so it is gone rather than restated more
 * carefully — the rest of what a buyer gets is stated plainly.
 */
export default function MysteryBagPage() {
  const product = getMysteryBagProduct();
  if (!product) notFound();

  const knives = [
    { src: JELLYBEAN_IMAGE_PATHS.red, alt: "Jellybean neck knife with a red resin handle" },
    { src: JELLYBEAN_IMAGE_PATHS.blue, alt: "Jellybean neck knife with a blue resin handle" },
    { src: JELLYBEAN_IMAGE_PATHS.green, alt: "Jellybean neck knife with a green resin handle" },
  ];

  return (
    <div className="bag">
      <div className="page-container editorial editorial--center">
        <div className="drop-visual bag-visual">
          {knives.map((knife, index) => (
            <div key={knife.src} className="drop-knife" data-slot={index}>
              <Image
                src={knife.src}
                alt={knife.alt}
                width={420}
                height={1200}
                loading="eager"
                sizes="(max-width: 900px) 28vw, 18vw"
                className="drop-knife-img"
              />
            </div>
          ))}
        </div>

        <div className="bag-detail">
          <p className="eyebrow">Mystery Jellybean Series</p>
          <h1 className="t-h1 bag-title">{product.name}</h1>
          <p className="t-lead bag-lead">{product.shortDescription}</p>
          <p className="t-body bag-copy">{product.longDescription}</p>

          <ul className="bag-list">
            <li>One sealed Jellybean-style neck knife</li>
            <li>Colour, handle pattern and finish are chosen at random</li>
            <li>Drawn from whatever is left in the current run</li>
          </ul>

          <div className="bag-buy">
            <p className="t-price">{formatPrice(product.price)}</p>
            <p className="t-meta">Per bag — Jellybean knives only.</p>
            <div className="bag-action">
              <AddToCartButton product={product} />
            </div>
            <p className="t-meta bag-note">
              Demo storefront — the cart lives in your browser and takes no payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
