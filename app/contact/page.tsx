import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach Toros Knife & Tool for orders, custom builds, and workshop inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 lg:items-start">
        <div>
          <p className="eyebrow text-toros-brass-light">Company</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-toros-parchment sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-toros-sand/85">
            Questions about a blade, a custom build, or an order? Send us a message and Murat and
            Aydin will get back to you from the workshop.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-toros-steel">
            You can also follow forge updates and reach us directly on Instagram.
          </p>
          <p className="mt-4">
            <Link
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-toros-brass transition-colors hover:text-toros-brass-light"
            >
              @toros_knife on Instagram
            </Link>
          </p>
          <div className="engraved-rule mt-8 max-w-[11rem]" aria-hidden="true" />
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
