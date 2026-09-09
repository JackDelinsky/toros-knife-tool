"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { CATEGORY_LABELS } from "@/types/product";
import type { ProductCategory } from "@/types/product";
import { TorosLogo } from "@/components/ui/TorosLogo";

const PRODUCT_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "Fixed Blades", href: "/shop?category=fixed-blades" },
  { label: "Neck Knives", href: "/shop?category=neck-knives" },
  { label: "Foldable Knives", href: "/shop?category=folding-knives" },
  { label: "Custom Knives", href: "/shop?category=custom-knives" },
  { label: "Misty Series", href: "/shop?tag=misty" },
  { label: "Mystery Jellybean Bags", href: "/mystery-bag" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/cart", label: "Cart" },
];

type NavDropdownId = "products" | "account";

const NAV_LINK_CLASS =
  "rounded-sm px-3 py-2 text-xs font-medium uppercase tracking-wider text-toros-sand/70 transition-colors hover:text-toros-brass-light";

const DROPDOWN_ITEM_CLASS =
  "block px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-toros-sand/80 transition-colors hover:bg-toros-surface hover:text-toros-brass-light";

const LEAVE_DELAY_MS = 140;

function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 transition-transform duration-300 ease-out ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.73a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeaderNavDropdown({
  id,
  label,
  links,
  align = "left",
  staggerItems = false,
  activeDropdown,
  onOpen,
  onScheduleClose,
  onCancelClose,
}: {
  id: NavDropdownId;
  label: string;
  links: { href: string; label: string }[];
  align?: "left" | "right";
  staggerItems?: boolean;
  activeDropdown: NavDropdownId | null;
  onOpen: (id: NavDropdownId) => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const open = activeDropdown === id;

  function handleEnter() {
    onCancelClose();
    onOpen(id);
  }

  function handleLeave() {
    onScheduleClose();
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`${NAV_LINK_CLASS} inline-flex items-center gap-1`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {label}
        <ChevronIcon open={open} />
      </button>

      <div
        className={`nav-dropdown-flyout absolute top-full z-[60] min-w-[13rem] pt-2 ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "nav-dropdown-flyout--open" : ""}`}
      >
        <div
          className={`nav-dropdown-panel py-1.5 ${open ? "nav-dropdown-panel--open" : ""}`}
          role="menu"
        >
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${staggerItems ? "nav-dropdown-stagger-item" : ""} ${DROPDOWN_ITEM_CLASS} ${
                open && staggerItems ? "nav-dropdown-stagger-item--open" : ""
              }`}
              style={staggerItems ? ({ "--nav-item-index": index } as CSSProperties) : undefined}
              role="menuitem"
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<NavDropdownId | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  function cancelDropdownClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleDropdownClose() {
    cancelDropdownClose();
    closeTimerRef.current = window.setTimeout(() => setActiveDropdown(null), LEAVE_DELAY_MS);
  }

  function openDropdown(id: NavDropdownId) {
    setActiveDropdown(id);
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobileAccountOpen(false);
  }

  const backdropOpen = activeDropdown !== null;

  return (
    <>
      <div
        className={`nav-dropdown-backdrop fixed inset-x-0 bottom-0 top-14 z-40 sm:top-15 ${
          backdropOpen ? "nav-dropdown-backdrop--open" : ""
        }`}
        onMouseEnter={scheduleDropdownClose}
        aria-hidden="true"
      />

      <header className="sticky top-0 z-50 border-b border-toros-border/60 bg-toros-black/92 backdrop-blur-md shadow-[0_1px_0_rgba(168,137,74,0.06)]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-15 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            onClick={closeMobileMenu}
          >
            <TorosLogo size="sm" priority linked={false} className="transition-opacity group-hover:opacity-90" />
            <span className="hidden font-display text-lg font-bold tracking-[0.22em] text-toros-parchment transition-colors group-hover:text-toros-brass-light sm:inline">
              TOROS
            </span>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-toros-steel md:inline">
              Knife & Tool
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            <Link href="/" className={NAV_LINK_CLASS}>Home</Link>

            <HeaderNavDropdown
              id="products"
              label="Products"
              links={PRODUCT_LINKS}
              staggerItems
              activeDropdown={activeDropdown}
              onOpen={openDropdown}
              onScheduleClose={scheduleDropdownClose}
              onCancelClose={cancelDropdownClose}
            />

            <Link href="/about" className={NAV_LINK_CLASS}>About Us</Link>
            <Link href="/contact" className={NAV_LINK_CLASS}>Contact Us</Link>

            <HeaderNavDropdown
              id="account"
              label="Account"
              links={ACCOUNT_LINKS}
              align="right"
              activeDropdown={activeDropdown}
              onOpen={openDropdown}
              onScheduleClose={scheduleDropdownClose}
              onCancelClose={cancelDropdownClose}
            />
          </nav>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-toros-parchment lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-toros-border bg-toros-black px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-0.5">
              <Link
                href="/"
                className="rounded-sm px-3 py-2.5 text-sm font-medium text-toros-sand hover:bg-toros-surface hover:text-toros-brass"
                onClick={closeMobileMenu}
              >
                Home
              </Link>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium text-toros-sand hover:bg-toros-surface hover:text-toros-brass"
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                aria-expanded={mobileProductsOpen}
              >
                Products
                <ChevronIcon open={mobileProductsOpen} />
              </button>
              {mobileProductsOpen && (
                <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-toros-border/60 pl-3">
                  {PRODUCT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-sm px-3 py-2 text-sm text-toros-steel hover:bg-toros-surface hover:text-toros-brass"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/about"
                className="rounded-sm px-3 py-2.5 text-sm font-medium text-toros-sand hover:bg-toros-surface hover:text-toros-brass"
                onClick={closeMobileMenu}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="rounded-sm px-3 py-2.5 text-sm font-medium text-toros-sand hover:bg-toros-surface hover:text-toros-brass"
                onClick={closeMobileMenu}
              >
                Contact Us
              </Link>

              <button
                type="button"
                className="flex w-full items-center justify-between rounded-sm px-3 py-2.5 text-sm font-medium text-toros-sand hover:bg-toros-surface hover:text-toros-brass"
                onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                aria-expanded={mobileAccountOpen}
              >
                Account
                <ChevronIcon open={mobileAccountOpen} />
              </button>
              {mobileAccountOpen && (
                <div className="mb-1 ml-2 flex flex-col gap-0.5 border-l border-toros-border/60 pl-3">
                  {ACCOUNT_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-sm px-3 py-2 text-sm text-toros-steel hover:bg-toros-surface hover:text-toros-brass"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

export function CategoryNav({ active }: { active?: ProductCategory }) {
  const categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/shop"
        className={`rounded-sm px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
          !active
            ? "bg-toros-brass text-toros-black"
            : "border border-toros-border text-toros-steel hover:border-toros-brass/40 hover:text-toros-brass"
        }`}
      >
        All
      </Link>
      {categories.map(([key, label]) => (
        <Link
          key={key}
          href={`/shop?category=${key}`}
          className={`rounded-sm px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
            active === key
              ? "bg-toros-brass text-toros-black"
              : "border border-toros-border text-toros-steel hover:border-toros-brass/40 hover:text-toros-brass"
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
