import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-toros-cream">
        Page Not Found
      </h1>
      <p className="mt-4 text-toros-cream/60">
        This blade may have moved, or never existed.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-flex rounded-md bg-toros-gold px-6 py-3 font-semibold text-toros-charcoal hover:bg-toros-gold-light transition-colors"
      >
        Browse the Shop
      </Link>
    </div>
  );
}
