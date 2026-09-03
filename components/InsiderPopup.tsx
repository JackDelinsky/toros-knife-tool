"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MosaicDivider } from "@/components/ui/GeometricAccents";
import { TorosLogo } from "@/components/ui/TorosLogo";

const SESSION_KEY = "toros-insider-dismissed";

// Immersive, scroll-driven pages where a popup would interrupt the experience.
const SUPPRESSED_PATHS = ["/craftsmanship"];

export function InsiderPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const suppressed = SUPPRESSED_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    if (suppressed || sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [suppressed]);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      sessionStorage.setItem(SESSION_KEY, "1");
      setTimeout(() => setVisible(false), 2000);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-toros-black/75 backdrop-blur-sm"
        onClick={dismiss}
        aria-label="Close popup"
      />

      <div
        className="relative w-full max-w-md overflow-hidden rounded-sm border border-toros-brass/30 bg-toros-charcoal shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_40px_rgba(168,137,74,0.12)] popup-enter"
        role="dialog"
        aria-labelledby="insider-title"
        aria-modal="true"
      >
        <div className="pointer-events-none absolute inset-0 pattern-mosaic opacity-20" />

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-sm text-toros-sand/60 transition-colors hover:bg-toros-surface hover:text-toros-parchment"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative border-b border-toros-brass/20 bg-toros-oxblood/20 px-6 py-5">
          <TorosLogo size="md" />
          <h2
            id="insider-title"
            className="mt-3 font-display text-2xl font-bold text-toros-parchment"
          >
            Join the Toros Insider List
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-toros-sand/80">
            Enter for giveaways, limited drops, and first access to new blades.
          </p>
        </div>

        <div className="relative px-6 py-5">
          <MosaicDivider className="mb-5" />

          {submitted ? (
            <div className="rounded-sm border border-toros-brass/30 bg-toros-brass/10 px-4 py-4 text-center">
              <p className="font-semibold text-toros-brass-light">You&apos;re on the list.</p>
              <p className="mt-1 text-xs text-toros-sand/70">Good luck in upcoming giveaways.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full rounded-sm border border-toros-border bg-toros-surface px-4 py-3 text-sm text-toros-parchment placeholder:text-toros-steel focus:border-toros-brass/50 focus:outline-none focus:ring-1 focus:ring-toros-brass/30"
              />
              <button
                type="submit"
                className="w-full rounded-sm bg-toros-brass px-4 py-3 text-sm font-bold uppercase tracking-wider text-toros-black transition-colors hover:bg-toros-brass-light"
              >
                Join & Enter
              </button>
            </form>
          )}

          <p className="mt-4 text-center text-[10px] text-toros-steel">
            Family-owned. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}
