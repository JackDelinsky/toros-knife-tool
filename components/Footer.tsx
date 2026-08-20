import Link from "next/link";
import { MosaicDivider } from "@/components/ui/GeometricAccents";
import { TorosLogo } from "@/components/ui/TorosLogo";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";

const PRODUCT_LINKS = [
  { href: "/shop", label: "All Products" },
  { href: "/shop?category=fixed-blades", label: "Fixed Blades" },
  { href: "/shop?category=neck-knives", label: "Neck Knives" },
  { href: "/shop?category=folding-knives", label: "Foldable Knives" },
  { href: "/shop?category=custom-knives", label: "Custom Knives" },
  { href: "/shop?tag=misty", label: "Misty Series" },
  { href: "/mystery-bag", label: "Mystery Jellybean Bags" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About Us", external: false },
  { href: "/contact", label: "Contact", external: false },
  { href: INSTAGRAM_URL, label: "Instagram", external: true },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/cart", label: "Cart" },
];

const TRUST_BADGES = ["Hand-finished", "Small-batch runs", "Direct from workshop"];

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-toros-tan">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-toros-steel transition-colors hover:text-toros-brass"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[11px] text-toros-steel transition-colors hover:text-toros-brass"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-toros-border bg-toros-black">
      <MosaicDivider className="page-container pt-8" />

      <div className="page-container py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)] lg:gap-14">
          <div className="flex items-start gap-3">
            <TorosLogo size="md" className="mt-0.5 shrink-0 opacity-90" />
            <div className="min-w-0">
              <Link
                href="/"
                className="font-display text-sm font-bold leading-snug tracking-[0.16em] text-toros-parchment sm:text-base"
              >
                TOROS KNIFE & TOOL
              </Link>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-toros-steel">
                Hand-forged blades rooted in Turkish tradition — built for American field, camp, and
                collection.
              </p>
              <div className="engraved-rule mt-5 w-full max-w-[12rem]" aria-hidden="true" />
              <div className="mt-4 flex flex-wrap gap-2">
                {TRUST_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-sm border border-toros-border/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-toros-steel"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <FooterLinkList title="Products" links={PRODUCT_LINKS} />
            <FooterLinkList title="Company" links={COMPANY_LINKS} />
            <FooterLinkList title="Account" links={ACCOUNT_LINKS} />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-toros-border/50 pt-6 sm:flex-row">
          <p className="text-[10px] text-toros-steel-dark">
            © {new Date().getFullYear()} Toros Knife & Tool · All rights reserved
          </p>
          <div className="flex gap-6 text-[10px] text-toros-steel-dark">
            <Link href="/about" className="transition-colors hover:text-toros-brass">
              About Us
            </Link>
            <Link href="/contact" className="transition-colors hover:text-toros-brass">
              Contact
            </Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
