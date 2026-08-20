const TRUST_ITEMS = [
  { label: "Hand-Forged", detail: "Workshop finished" },
  { label: "Premium Steels", detail: "N690 · Carbon · Damascus" },
  { label: "Small Batch", detail: "Never mass-made" },
  { label: "Field Ready", detail: "Hunt · camp · carry" },
];

export function TrustStrip() {
  return (
    <div className="border-b border-toros-border/50 bg-toros-charcoal/95">
      <div className="page-container">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-3 sm:justify-between sm:py-3.5">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className="h-1 w-1 rounded-full bg-toros-brass/70" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-toros-parchment">
                  {item.label}
                </p>
                <p className="hidden text-[9px] text-toros-steel sm:block">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
