"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  SORTS,
  activeCount,
  type FilterOptions,
  type FilterState,
} from "@/lib/shop-filters";

interface ShopToolbarProps {
  options: FilterOptions;
  filters: FilterState;
  resultCount: number;
}

/**
 * Filters and sort, kept in the URL.
 *
 * Every control writes a query parameter and the server re-renders the grid
 * from it, so a filtered view can be linked, bookmarked and reached with the
 * Back button. Nothing here holds a private copy of the results.
 *
 * On a narrow screen the same controls become a sheet, because a row of six
 * filter groups across 360px is a row nobody can use.
 */
export function ShopToolbar({ options, filters, resultCount }: ShopToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const active = activeCount(filters);

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString());
      if (value === undefined) next.delete(key);
      else next.set(key, value);
      // A filter change is a new result set, not a new position in the old one.
      next.delete("look");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams();
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  // The sheet is a layer over the page, so the page behind it must not scroll.
  useEffect(() => {
    if (!sheetOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const groups = (
    <>
      <FilterGroup
        label="Steel"
        options={options.steels}
        value={filters.steel}
        onChange={(v) => setParam("steel", v)}
      />
      <FilterGroup
        label="Handle"
        options={options.handles}
        value={filters.handle}
        onChange={(v) => setParam("handle", v)}
      />
      {options.prices.length ? (
        <FilterGroup
          label="Price"
          options={options.prices}
          value={filters.maxPrice === undefined ? undefined : String(filters.maxPrice)}
          onChange={(v) => setParam("price", v)}
        />
      ) : null}
      {options.outOfStock > 0 ? (
        <div className="sfilter">
          <p className="sfilter-label">Availability</p>
          <div className="sfilter-opts">
            <button
              type="button"
              className="sfilter-pill"
              aria-pressed={filters.inStockOnly}
              onClick={() => setParam("availability", filters.inStockOnly ? undefined : "in-stock")}
            >
              In stock only
            </button>
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <div className="stoolbar">
      <div className="stoolbar-row">
        <p className="stoolbar-count" aria-live="polite">
          {resultCount} {resultCount === 1 ? "blade" : "blades"}
        </p>

        <div className="stoolbar-right">
          <button
            type="button"
            className="stoolbar-sheet-open"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
          >
            Filters{active > 0 ? ` (${active})` : ""}
          </button>

          <label className="stoolbar-sort">
            <span className="sfilter-label">Sort</span>
            <select
              value={filters.sort}
              onChange={(e) => setParam("sort", e.target.value === "catalogue" ? undefined : e.target.value)}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          {active > 0 ? (
            <button type="button" className="stoolbar-clear" onClick={clearAll}>
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      <div className="stoolbar-groups">{groups}</div>

      {sheetOpen ? (
        <div className="ssheet" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            className="ssheet-scrim"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
          />
          <div className="ssheet-body">
            <div className="ssheet-head">
              <h2 className="t-h3">Filters</h2>
              <button type="button" className="ssheet-close" onClick={() => setSheetOpen(false)}>
                Done
              </button>
            </div>
            {groups}
            <div className="ssheet-foot">
              <p>
                {resultCount} {resultCount === 1 ? "blade" : "blades"}
              </p>
              {active > 0 ? (
                <button type="button" className="stoolbar-clear" onClick={clearAll}>
                  Clear all
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FilterOptions["steels"];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  if (options.length < 2) return null;
  return (
    <div className="sfilter">
      <p className="sfilter-label">{label}</p>
      <div className="sfilter-opts">
        {options.map((option) => {
          const on = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className="sfilter-pill"
              aria-pressed={on}
              onClick={() => onChange(on ? undefined : option.value)}
            >
              {option.label}
              <span className="sfilter-n">{option.count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
