"use client";

import { useState } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/**
 * Shipping, returns and care.
 *
 * These are collapsed because they are reference material almost nobody reads
 * on the way to a decision — not because collapsing things is a style. The
 * specs and the story stay open.
 */
export function ProductDetailsAccordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="accordion">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="accordion-item">
            <button
              type="button"
              className="accordion-trigger"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`accordion-${item.id}`}
            >
              <span>{item.title}</span>
              <span className="accordion-sign" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div id={`accordion-${item.id}`} className="accordion-panel" hidden={!isOpen}>
              <p className="t-meta">{item.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
