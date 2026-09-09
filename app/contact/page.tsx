import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

const INSTAGRAM_URL = "https://www.instagram.com/toros_knife";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Toros Knife & Tool about an order, a custom build, or a question.",
};

/**
 * Reasons to write, then the form. Only the channels that actually exist in
 * the repository are listed — there is no phone number or postal address here
 * because there isn't one recorded anywhere.
 */
const REASONS = [
  {
    title: "A knife you've seen",
    body: "Questions about steel, handle material, size or what a blade is actually good at. Murat and Aydin answer these themselves.",
  },
  {
    title: "A custom build",
    body: "Aydin makes one-of-a-kind pieces in Georgia. Tell us roughly what you want and he'll say whether it's something he can make.",
  },
  {
    title: "An order",
    body: "Anything about something already on its way, or a knife you'd like held at a show.",
  },
];

export default function ContactPage() {
  return (
    <div className="contact">
      <div className="page-container">
        <header className="contact-head">
          <p className="eyebrow">Contact</p>
          <h1 className="t-h1 contact-title">Ask us anything about a blade</h1>
          <p className="t-lead contact-lead">
            Messages go to the workshop, not a queue. Expect a reply from Murat or Aydin.
          </p>
        </header>

        <div className="editorial editorial--reverse contact-body">
          <ContactForm />

          <div className="contact-side">
            <ul className="contact-reasons">
              {REASONS.map((reason) => (
                <li key={reason.title} className="contact-reason">
                  <h2 className="contact-reason-title">{reason.title}</h2>
                  <p className="t-meta">{reason.body}</p>
                </li>
              ))}
            </ul>

            <p className="t-meta contact-social">
              Day to day, the shop posts on{" "}
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="link">
                @toros_knife
              </a>
              . A direct message there reaches the same two people.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
