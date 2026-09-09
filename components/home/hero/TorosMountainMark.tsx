interface TorosMountainMarkProps {
  className?: string;
  /** Stroke colour; defaults to the brass token via currentColor. */
  tone?: string;
  title?: string;
}

/**
 * Toros/Taurus mountain mark — an abstract twin-ridge contour crossed by a
 * restrained Anatolian eight-point division. Built to work small (index
 * marker, divider) and large (quiet background), in line only, no fill.
 */
export function TorosMountainMark({ className = "", tone, title }: TorosMountainMarkProps) {
  return (
    <svg
      viewBox="0 0 64 40"
      fill="none"
      stroke={tone ?? "currentColor"}
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      {/* Twin ridge — the taller summit offset right, as Toros reads on the horizon. */}
      <path d="M2 34 L18 16 L26 24 L38 8 L52 26 L62 34" />
      {/* Secondary ridge, set back. */}
      <path d="M10 34 L22 22 L30 28" opacity="0.45" />
      {/* Eight-point division centred on the summit — Anatolian geometry, kept minimal. */}
      <path d="M38 8 L38 2 M38 8 L43 5 M38 8 L33 5" opacity="0.55" />
      <path d="M2 34 L62 34" opacity="0.3" />
    </svg>
  );
}
