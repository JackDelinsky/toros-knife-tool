"use client";

import { useState } from "react";

/**
 * The newsletter, folded into the footer.
 *
 * It used to be a full-width band of its own on the homepage, which made the
 * page end twice. One field and a button is all it ever needed.
 */
export function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div className="footer-news">
      <h2 className="footer-title">Next run</h2>
      {submitted ? (
        <p className="footer-news-done" role="status">
          You&apos;re on the list.
        </p>
      ) : (
        <>
          <p className="t-meta footer-news-note">
            Small batches sell out quietly. We write when there is something new on the bench.
          </p>
          <form onSubmit={handleSubmit} className="footer-news-form">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="field"
            />
            <button type="submit" className="btn btn--secondary">
              Join
            </button>
          </form>
        </>
      )}
    </div>
  );
}
