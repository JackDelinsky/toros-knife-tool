import { TorosLogo } from "@/components/ui/TorosLogo";

export function MosaicDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1 engraved-rule" />
      <TorosLogo size="xs" className="opacity-80" />
      <div className="h-px flex-1 engraved-rule" />
    </div>
  );
}

/** Interlocking diamond mosaic line */
export function GeometricBorder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-3 w-full pattern-engraved opacity-60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function PatternBackground({
  children,
  className = "",
  variant = "mosaic",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "mosaic" | "none";
}) {
  return (
    <div className={`relative ${className}`}>
      {variant === "mosaic" && (
        <div className="pointer-events-none absolute inset-0 pattern-mosaic opacity-[0.35]" aria-hidden="true" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
