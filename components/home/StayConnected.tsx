"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";
const INSTAGRAM_HANDLE = "@toros_knife";

function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function StayConnected() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  }

  return (
    <section
      className="stay-connected-section"
      aria-labelledby="stay-connected-heading"
    >
      <div className="stay-connected-glow" aria-hidden="true" />
      <div className="stay-connected-line" aria-hidden="true" />

      <div className="page-container stay-connected-wrap">
        <Reveal>
          <header className="stay-connected-header">
            <p className="eyebrow">Community</p>
            <h2 id="stay-connected-heading" className="stay-connected-title">
              Stay Connected
            </h2>
            <p className="stay-connected-lead">
              Follow new blades, workshop moments, and limited drops.
            </p>
          </header>
        </Reveal>

        <div className="stay-connected-body">
          <Reveal delay={50}>
            <div className="stay-connected-col">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="stay-connected-handle"
                aria-label={`${INSTAGRAM_HANDLE} on Instagram`}
              >
                <InstagramIcon className="stay-connected-handle-icon" />
                <span>{INSTAGRAM_HANDLE}</span>
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="stay-connected-ig-cta"
              >
                Follow on Instagram
                <span className="stay-connected-ig-cta-arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>

          <div className="stay-connected-rule" aria-hidden="true" />

          <Reveal delay={90}>
            <div className="stay-connected-col">
              <p className="stay-connected-subhead">Newsletter</p>
              <p className="stay-connected-subcopy">Get drop alerts and workshop updates.</p>

              {submitted ? (
                <p className="stay-connected-success">You&apos;re on the list — we&apos;ll reach out at the next drop.</p>
              ) : (
                <form onSubmit={handleSubmit} className="stay-connected-form">
                  <label htmlFor="stay-connected-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="stay-connected-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="stay-connected-input"
                  />
                  <button type="submit" className="stay-connected-submit">
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
