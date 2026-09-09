"use client";

import { useState } from "react";

const INPUT_CLASS = "field";
const LABEL_CLASS = "field-label";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General inquiry" },
  { value: "custom", label: "Custom knife commission" },
  { value: "order", label: "Order question" },
  { value: "product", label: "Product information" },
  { value: "other", label: "Something else" },
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  subject: "general",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch {
      setError("Unable to send your message right now. Please try again or reach out on Instagram.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="cform cform--sent" role="status">
        <p className="t-h3">Message sent.</p>
        <p className="t-meta cform-sent-note">
          Murat and Aydin will read it and get back to you. For anything urgent, a direct message
          on Instagram reaches the same two people.
        </p>
        <button type="button" onClick={() => setSubmitted(false)} className="btn btn--quiet">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="cform" noValidate={false}>
      <div className="cform-fields">
        <div>
          <label htmlFor="contact-name" className={LABEL_CLASS}>Full name</label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            autoComplete="name"
            placeholder="Your name"
            className={INPUT_CLASS}
          />
        </div>

        <div className="cform-pair">
          <div>
            <label htmlFor="contact-email" className={LABEL_CLASS}>Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="contact-phone" className={LABEL_CLASS}>
              Phone <span className="field-optional">(optional)</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              autoComplete="tel"
              placeholder="(555) 555-5555"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label htmlFor="contact-subject" className={LABEL_CLASS}>Topic</label>
          <select
            id="contact-subject"
            name="subject"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            required
            className={INPUT_CLASS}
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="cform-option">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className={LABEL_CLASS}>Message</label>
          <textarea
            id="contact-message"
            name="message"
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            required
            rows={5}
            placeholder="Tell us about the knife you're looking for, your order, or any questions..."
            className={`${INPUT_CLASS} cform-textarea`}
          />
        </div>
      </div>

      {error ? (
        <p className="field-error cform-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="cform-foot">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
        </button>
        <p className="t-meta">Usually answered within a few business days.</p>
      </div>
    </form>
  );
}
