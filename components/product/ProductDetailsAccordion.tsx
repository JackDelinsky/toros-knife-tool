"use client";

import { useState } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface ProductDetailsAccordionProps {
  items: AccordionItem[];
}

export function ProductDetailsAccordion({ items }: ProductDetailsAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section className="product-accordion" aria-label="Shipping, returns, and care">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="product-accordion-item">
            <button
              type="button"
              className="product-accordion-trigger"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              aria-controls={`product-accordion-${item.id}`}
            >
              <span>{item.title}</span>
              <span className="product-accordion-icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={`product-accordion-${item.id}`}
              className={`product-accordion-panel${isOpen ? " product-accordion-panel--open" : ""}`}
              hidden={!isOpen}
            >
              <p>{item.content}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
