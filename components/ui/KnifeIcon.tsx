/** Handcrafted fixed-blade silhouette — Toros brand motif */
export function KnifeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 18.2h5.8l.9-3.6 1.9.4.7-2.6h8.6c1.3 0 2.3.9 2.6 2.2l.5 2.4c.2.9-.4 1.7-1.3 1.7H7.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 15.8h4.2M6.8 13.2h3.4M7.4 10.8h2.6"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M21.2 11.8l4.8 1.1-.9 3.8-2.8-.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
