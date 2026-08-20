import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatPrice, getMysteryBagProduct } from "@/lib/products";
import { BRAND_IMAGE_PATHS } from "@/lib/image-paths";

export const metadata: Metadata = {
  title: "Mystery Jellybean Knife Bag",
  description:
    "Purchase a sealed surprise bag containing one Jellybean-style knife. Colors and handle styles vary.",
};

export default function MysteryBagPage() {
  const product = getMysteryBagProduct();

  if (!product) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden bg-toros-black">
      <div className="pointer-events-none absolute inset-0 mystery-section-fog" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Surprise Jellybean Series</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-toros-parchment sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-toros-sand/75">
            {product.shortDescription}
          </p>
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="jellybean-visual relative flex items-center justify-center">
            <div className="jellybean-visual-mist jellybean-visual-mist-1 absolute inset-0" aria-hidden="true" />
            <div className="jellybean-visual-mist jellybean-visual-mist-2 absolute inset-0" aria-hidden="true" />
            <div className="jellybean-visual-glow absolute inset-0" aria-hidden="true" />
            <Image
              src={BRAND_IMAGE_PATHS.jellybeanKnives}
              alt="Toros Jellybean neck knives"
              width={900}
              height={863}
              priority
              className="jellybean-knife-img jellybean-float-group relative z-10 h-auto w-full max-h-[320px] object-contain sm:max-h-[380px]"
              sizes="(max-width: 1024px) 90vw, 480px"
            />
          </div>

          <div className="card-premium rounded-sm border border-toros-brass/15 p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-toros-tan">
              Mystery Bag
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold text-toros-parchment">
              What you receive
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-toros-sand/75">
              {product.longDescription}
            </p>

            <ul className="mt-5 space-y-2 text-sm text-toros-sand/70">
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-toros-brass/80" />
                One sealed Jellybean-style knife only
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-toros-brass/80" />
                Random color, handle pattern, and finish
              </li>
              <li className="flex gap-2.5">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-toros-brass/80" />
                Valued above purchase price
              </li>
            </ul>

            <div className="mt-6 border-t border-toros-border/60 pt-6">
              <p className="text-3xl font-bold tracking-tight text-toros-brass-light">
                {formatPrice(product.price)}
              </p>
              <p className="mt-1 text-xs text-toros-steel">Per mystery bag · Jellybean knives only</p>
              <div className="mt-5">
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
