/** Original 8-point star motif — geometric, not copied tile work */
export function TorosEmblem({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4 L28 16 L40 20 L28 24 L24 36 L20 24 L8 20 L20 16 Z"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M24 12 L26 18 L32 20 L26 22 L24 28 L22 22 L16 20 L22 18 Z"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.4"
      />
      <circle cx="24" cy="20" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/** Mountain / tor silhouette — emblem shape */
export function TorosMountain({ className = "h-6 w-16" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 24" fill="none" aria-hidden="true">
      <path
        d="M0 24 L16 8 L28 18 L40 4 L52 14 L64 24 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <path d="M0 24 H64" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
