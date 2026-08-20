import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  id?: string;
  size?: "default" | "large";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  size = "default",
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";
  const titleClass =
    size === "large"
      ? "font-display text-3xl font-bold leading-[1.08] text-toros-cream sm:text-4xl lg:text-[2.75rem]"
      : "font-display text-2xl font-bold leading-tight text-toros-cream sm:text-3xl lg:text-4xl";

  return (
    <header id={id} className={alignClass}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={`${titleClass} ${eyebrow ? "mt-3" : ""}`}>{title}</h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-toros-sand/75 sm:text-base">{description}</p>
      ) : null}
    </header>
  );
}
