"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TorosLogo } from "@/components/ui/TorosLogo";

const SESSION_KEY = "toros-insider-dismissed";

/**
 * Scroll depth at which someone has clearly chosen to keep reading. Asking for
 * an email before that is asking a stranger.
 */
const SCROLL_TRIGGER = 0.55;

/** The homepage opens on the fullscreen carousel; nothing covers that. */
const SUPPRESSED_EXACT = ["/"];

/**
 * Newsletter invitation.
 *
 * It is deliberately *not* on a timer. A popup that lands 1.5s after entry
 * interrupts the page before the visitor has seen anything, which is the
 * single most disliked pattern on a storefront. This one waits until the
 * visitor has read more than half a page — a deliberate signal of interest —
 * and then only once per session.
 */
export function InsiderPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const suppressed = SUPPRESSED_EXACT.includes(pathname ?? "");

  useEffect(() => {
    if (suppressed || sessionStorage.getItem(SESSION_KEY)) return;

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page too short to scroll can't express interest this way, so it
      // simply never asks.
      if (scrollable < 400) return;
      if (window.scrollY / scrollable >= SCROLL_TRIGGER) {
        setVisible(true);
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [suppressed]);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => setVisible(false), 2200);
  }

  if (!visible) return null;

  return (
    <div className="insider" role="dialog" aria-modal="true" aria-labelledby="insider-title">
      <button type="button" className="insider-scrim" onClick={dismiss} aria-label="Close" />

      <div className="insider-panel">
        <button type="button" onClick={dismiss} className="insider-close" aria-label="Close">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <TorosLogo size="sm" />
        <h2 id="insider-title" className="t-h3 mt-4">
          Hear about the next run first
        </h2>
        <p className="t-meta mt-2">
          Small batches sell out quietly. We&apos;ll write when there is something new on the
          bench — not otherwise.
        </p>

        {submitted ? (
          <p className="insider-success">You&apos;re on the list.</p>
        ) : (
          <form onSubmit={handleSubmit} className="insider-form">
            <label htmlFor="insider-email" className="sr-only">
              Email address
            </label>
            <input
              id="insider-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="field"
            />
            <button type="submit" className="btn btn--primary">
              Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
