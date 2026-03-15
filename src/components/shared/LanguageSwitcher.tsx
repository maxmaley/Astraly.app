"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { routing, type Locale } from "@/routing";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const LANG_LABELS: Record<Locale, string> = {
  ru: "RU",
  uk: "UK",
  en: "EN",
  pl: "PL",
};

const LANG_FULL: Record<Locale, string> = {
  ru: "Русский",
  uk: "Українська",
  en: "English",
  pl: "Polski",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    // Open downward if button is in the top half of the viewport, upward otherwise
    const openDownward = rect.top < window.innerHeight / 2;
    setDropdownStyle(
      openDownward
        ? { position: "fixed", top: rect.bottom + 6, left: rect.left, zIndex: 9999, minWidth: 140 }
        : { position: "fixed", bottom: window.innerHeight - rect.top + 6, left: rect.left, zIndex: 9999, minWidth: 140 }
    );
  }, []);

  function handleOpen() {
    if (!open) {
      updatePosition();
    }
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleScroll() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  function switchLocale(next: Locale) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        {LANG_LABELS[locale]}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-cosmic"
        >
          {routing.locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-[var(--muted)] ${
                l === locale ? "text-cosmic-400 font-medium" : "text-[var(--foreground)]"
              }`}
            >
              <span className="font-mono text-xs opacity-60">{LANG_LABELS[l]}</span>
              {LANG_FULL[l]}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
