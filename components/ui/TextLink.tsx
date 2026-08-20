import Link from "next/link";
import type { ReactNode } from "react";

interface TextLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export function TextLink({ href, children, className = "", external }: TextLinkProps) {
  const classes = `link-arrow inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-toros-brass transition-colors hover:text-toros-brass-light ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
