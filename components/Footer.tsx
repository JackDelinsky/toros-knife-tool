import Link from "next/link";
import { TorosLogo } from "@/components/ui/TorosLogo";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";

const SHOP_LINKS = [
  { href: "/shop", label: "All products" },
  { href: "/shop?category=fixed-blades", label: "Fixed blades" },
  { href: "/shop?category=custom-knives", label: "Custom knives" },
  { href: "/shop?category=folding-knives", label: "Folding knives" },
  { href: "/shop?category=neck-knives", label: "Neck knives" },
  { href: "/mystery-bag", label: "Mystery Jellybean bags" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
  { href: "/cart", label: "Cart" },
];

/**
 * The closing composition.
 *
 * Only links that resolve and claims the repository can support. The previous
 * footer carried "Privacy" and "Terms" as plain text because neither page
 * exists, and a row of trust badges nothing here substantiates — both are gone
 * rather than dressed up.
 */
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container site-footer-inner">
        <div className="footer-brand">
          <TorosLogo size="md" className="footer-mark" />
          <p className="footer-word">Toros Knife &amp; Tool</p>
          <p className="t-meta footer-blurb">
            A father-and-son workshop in Georgia, working Turkish steel and material for
            American field use.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="link footer-social"
          >
            @toros_knife on Instagram
          </a>
        </div>

        <div className="footer-links">
          {[
            { title: "Shop", links: SHOP_LINKS },
            { title: "Company", links: COMPANY_LINKS },
            { title: "Account", links: ACCOUNT_LINKS },
          ].map((group) => (
            <div key={group.title}>
              <h2 className="footer-title">{group.title}</h2>
              <ul className="footer-list">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="page-container footer-base">
        <p>© {new Date().getFullYear()} Toros Knife &amp; Tool</p>
        <p>Demo storefront — no payment is taken on this site.</p>
      </div>
    </footer>
  );
}
