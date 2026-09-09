"use client";

import { useState } from "react";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";

/**
 * The closing line. One sentence, one field, one link — the newsletter is not
 * a section with its own hero.
 */
export function NewsletterClose() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="close" aria-labelledby="close-heading">
      <div className="page-container editorial editorial--even editorial--center">
        <div>
          <h2 id="close-heading" className="t-h3">
            Hear about the next run
          </h2>
          <p className="t-meta close-note">
            Small batches sell out quietly. We write when something new is on the bench, and
            not otherwise. Day to day, the shop posts on{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="link">
              Instagram
            </a>
            .
          </p>
        </div>

        {submitted ? (
          <p className="close-success" role="status">
            You&apos;re on the list — we&apos;ll be in touch at the next drop.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="close-form">
            <label htmlFor="close-email" className="sr-only">
              Email address
            </label>
            <input
              id="close-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="field"
            />
            <button type="submit" className="btn btn--secondary">
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
