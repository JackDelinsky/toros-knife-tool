"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TorosLogo } from "@/components/ui/TorosLogo";

const PRODUCT_LINKS = [
  { label: "All products", href: "/shop" },
  { label: "Fixed blades", href: "/shop?category=fixed-blades" },
  { label: "Custom knives", href: "/shop?category=custom-knives" },
  { label: "Folding knives", href: "/shop?category=folding-knives" },
  { label: "Neck knives", href: "/shop?category=neck-knives" },
  { label: "Misty Series", href: "/shop?tag=misty" },
  { label: "Mystery Jellybean bags", href: "/mystery-bag" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
  { href: "/cart", label: "Cart" },
];

const LEAVE_DELAY_MS = 140;

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg className={`nav-chevron ${open ? "nav-chevron--open" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function NavMenu({
  id,
  label,
  links,
  align = "left",
  openId,
  setOpenId,
}: {
  id: string;
  label: string;
  links: { href: string; label: string }[];
  align?: "left" | "right";
  openId: string | null;
  setOpenId: (id: string | null) => void;
}) {
  const open = openId === id;
  const timer = useRef<number | null>(null);

  function cancel() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }

  useEffect(() => cancel, []);

  return (
    <div
      className="nav-menu"
      onMouseEnter={() => {
        cancel();
        setOpenId(id);
      }}
      onMouseLeave={() => {
        cancel();
        timer.current = window.setTimeout(() => setOpenId(null), LEAVE_DELAY_MS);
      }}
    >
      <button
        type="button"
        className="nav-link nav-link--menu"
        aria-haspopup="true"
        aria-expanded={open}
        // Keyboard users get the same menu without needing a hover.
        onClick={() => setOpenId(open ? null : id)}
      >
        {label}
        <Chevron open={open} />
      </button>

      <div className={`nav-flyout ${align === "right" ? "nav-flyout--right" : ""}`} hidden={!open}>
        <div className="nav-panel" role="menu">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-item"
              role="menuitem"
              onClick={() => setOpenId(null)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  // A route change should never leave a menu hanging open behind the new page.
  // Adjusted during render rather than in an effect: an effect would paint the
  // new route once with the old menu still open, then re-render to close it.
  const [navPath, setNavPath] = useState(pathname);
  if (navPath !== pathname) {
    setNavPath(pathname);
    setMenuOpen(false);
    setOpenId(null);
    setMobileSection(null);
  }

  const isShop = pathname.startsWith("/shop") || pathname.startsWith("/products") || pathname.startsWith("/mystery-bag");

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" aria-label="Toros Knife & Tool — home">
          <TorosLogo size="sm" linked={false} className="brand-mark" />
          <span className="brand-name">Toros</span>
          <span className="brand-sub">Knife &amp; Tool</span>
        </Link>

        <nav className="nav" aria-label="Main">
          <NavMenu
            id="products"
            label="Shop"
            links={PRODUCT_LINKS}
            openId={openId}
            setOpenId={setOpenId}
          />
          <Link
            href="/about"
            className="nav-link"
            aria-current={pathname.startsWith("/about") ? "page" : undefined}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="nav-link"
            aria-current={pathname.startsWith("/contact") ? "page" : undefined}
          >
            Contact
          </Link>
          <NavMenu
            id="account"
            label="Account"
            links={ACCOUNT_LINKS}
            align="right"
            openId={openId}
            setOpenId={setOpenId}
          />
        </nav>

        {/* Shop is the one destination worth a permanent target on mobile. */}
        <Link href="/shop" className="nav-shop-cta" aria-current={isShop ? "page" : undefined}>
          Shop
        </Link>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            {menuOpen ? (
              <path strokeLinecap="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeWidth={1.6} d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <nav id="mobile-nav" className="mobile-nav" aria-label="Main" hidden={!menuOpen}>
        {[
          { id: "shop", label: "Shop", links: PRODUCT_LINKS },
          { id: "account", label: "Account", links: ACCOUNT_LINKS },
        ].map((section) => (
          <div key={section.id}>
            <button
              type="button"
              className="mobile-row mobile-row--button"
              onClick={() => setMobileSection((v) => (v === section.id ? null : section.id))}
              aria-expanded={mobileSection === section.id}
            >
              {section.label}
              <Chevron open={mobileSection === section.id} />
            </button>
            <div className="mobile-sub" hidden={mobileSection !== section.id}>
              {section.links.map((link) => (
                <Link key={link.href} href={link.href} className="mobile-row mobile-row--sub">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <Link href="/about" className="mobile-row">About</Link>
        <Link href="/contact" className="mobile-row">Contact</Link>
      </nav>
    </header>
  );
}
