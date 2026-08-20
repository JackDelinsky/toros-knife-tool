"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const INPUT_CLASS =
  "w-full rounded-sm border border-toros-border bg-toros-surface/80 px-4 py-3 text-sm text-toros-parchment placeholder:text-toros-steel focus:border-toros-brass/50 focus:outline-none focus:ring-1 focus:ring-toros-brass/30";

const LABEL_CLASS = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-toros-tan";

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
      <div className="rounded-sm border border-toros-brass/30 bg-toros-brass/10 px-6 py-8">
        <p className="font-display text-xl font-semibold text-toros-brass-light">Message sent.</p>
        <p className="mt-2 text-sm leading-relaxed text-toros-sand/80">
          Murat and Aydin will review your note and get back to you soon. For urgent questions, you
          can also message us on Instagram.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 text-xs font-bold uppercase tracking-wider text-toros-brass transition-colors hover:text-toros-brass-light"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-toros-border bg-toros-charcoal/40 p-6 sm:p-8"
    >
      <p className="font-display text-lg font-semibold text-toros-parchment">Send a message</p>
      <p className="mt-1 text-sm text-toros-steel">
        Share a few details and we&apos;ll follow up from the workshop.
      </p>

      <div className="mt-6 space-y-5">
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

        <div className="grid gap-5 sm:grid-cols-2">
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
              Phone <span className="font-normal normal-case tracking-normal text-toros-steel">(optional)</span>
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
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-toros-charcoal">
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
            className={`${INPUT_CLASS} resize-y min-h-[8rem]`}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-toros-oxblood-light" role="alert">{error}</p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? "Sending…" : "Send Message"}
        </Button>
        <p className="text-[10px] text-toros-steel-dark">
          We typically respond within a few business days.
        </p>
      </div>
    </form>
  );
}
