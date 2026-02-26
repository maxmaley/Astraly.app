"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export interface CityOption {
  name: string;      // display label, e.g. "Москва, Россия"
  city: string;      // just the city name to store, e.g. "Москва"
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string, geo?: { lat: number; lng: number }) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
  type: string;
  class: string;
}

export function CityAutocomplete({ value, onChange, placeholder, error, className }: Props) {
  const [query, setQuery] = useState(value);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value reset
  useEffect(() => { setQuery(value); }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setOptions([]); return; }
    setLoading(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "6");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("featuretype", "city,town,village,municipality");
      url.searchParams.set("accept-language", "ru,uk,en");

      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "Astraly.app/1.0 (contact@astraly.app)" },
      });
      if (!res.ok) return;
      const results = await res.json() as NominatimResult[];

      const opts: CityOption[] = [];
      for (const r of results) {
        // Skip non-settlement results
        if (!["city", "town", "village", "hamlet", "municipality"].includes(r.type) &&
            r.class !== "place") continue;

        const cityName = r.address.city ?? r.address.town ?? r.address.village ?? r.address.municipality ?? r.name;
        if (!cityName) continue;

        const parts = [cityName, r.address.state, r.address.country].filter(Boolean);

        if (!opts.find((o) => o.city.toLowerCase() === cityName.toLowerCase())) {
          opts.push({
            name: parts.join(", "),
            city: cityName,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          });
        }
        if (opts.length >= 5) break;
      }
      setOptions(opts);
      setOpen(opts.length > 0);
    } catch {
      // Nominatim unavailable — user can still type manually
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    setSelected(false);
    onChange(v);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length >= 2) {
      timerRef.current = setTimeout(() => search(v), 400);
    } else {
      setOptions([]);
      setOpen(false);
    }
  }

  function handleSelect(opt: CityOption) {
    setQuery(opt.city);
    setSelected(true);
    setOpen(false);
    setOptions([]);
    onChange(opt.city, { lat: opt.lat, lng: opt.lng });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  const inputCls = `w-full rounded-xl border bg-[var(--input)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15 ${
    error ? "border-red-500" : "border-[var(--border)]"
  } ${className ?? ""}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Pin icon */}
      <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--muted-foreground)]/50">
        {loading ? (
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )}
      </span>

      <input
        type="text"
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (options.length && !selected) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        className={inputCls}
        aria-autocomplete="list"
        aria-haspopup="listbox"
      />

      {/* Dropdown */}
      {open && options.length > 0 && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl"
        >
          {options.map((opt, i) => (
            <li
              key={i}
              role="option"
              aria-selected={false}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(opt);
              }}
              className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-[var(--muted)] first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="mt-0.5 shrink-0 text-[var(--muted-foreground)]/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[var(--foreground)]">
                  {opt.city}
                </span>
                {opt.name !== opt.city && (
                  <span className="block truncate text-xs text-[var(--muted-foreground)]">
                    {opt.name.slice(opt.city.length + 2)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
