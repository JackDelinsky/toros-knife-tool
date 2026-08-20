import Link from "next/link";
import type { ReactNode } from "react";

interface SimplePageProps {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}

export function SimplePage({ title, eyebrow, children }: SimplePageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      {eyebrow ? <p className="eyebrow text-toros-brass-light">{eyebrow}</p> : null}
      <h1 className="mt-2 font-display text-4xl font-bold text-toros-parchment sm:text-5xl">{title}</h1>
      <div className="mt-6 max-w-xl space-y-4 text-base leading-relaxed text-toros-sand/85">{children}</div>
    </div>
  );
}

export function SimplePageLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-toros-brass transition-colors hover:text-toros-brass-light">
      {children}
    </Link>
  );
}
