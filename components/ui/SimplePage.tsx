import Link from "next/link";
import type { ReactNode } from "react";

interface SimplePageProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}

/**
 * The shared frame for the account and cart states.
 *
 * These pages are honest placeholders — there is no authentication or payment
 * behind them — so they say so plainly in the site's own type rather than
 * sitting in a bordered panel pretending to be a feature.
 */
export function SimplePage({ eyebrow, title, children }: SimplePageProps) {
  return (
    <div className="simple">
      <div className="page-container page-container--narrow">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="t-h1 simple-title">{title}</h1>
        <div className="simple-body">{children}</div>
      </div>
    </div>
  );
}

export function SimplePageLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="link">
      {children}
    </Link>
  );
}
