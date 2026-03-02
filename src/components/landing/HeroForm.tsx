"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";
import { CityAutocomplete } from "@/components/shared/CityAutocomplete";

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat?: number;
  lng?: number;
}

const inputCls = (err?: string) =>
  `w-full rounded-xl border bg-[var(--input)] py-2.5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15 ${
    err ? "border-red-500" : "border-[var(--border)]"
  }`;

export function HeroForm() {
  const t = useTranslations("landing");
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<BirthData>({
    name: "",
    birthDate: "",
    birthTime: "",
    birthCity: "",
    lat: undefined,
    lng: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BirthData, string>>>({});

  function validate() {
    const e: Partial<Record<keyof BirthData, string>> = {};
    if (!form.name.trim()) e.name = t("heroFormErrorName");
    if (!form.birthDate) e.birthDate = t("heroFormErrorDate");
    if (!form.birthCity.trim()) e.birthCity = t("heroFormErrorCity");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const serialized = JSON.stringify(form);
    sessionStorage.setItem("astraly_birth_data", serialized);
    // Also persist to localStorage so logged-in users who get redirected
    // past /register still have their birth data available on /app/chart
    localStorage.setItem("astraly_birth_data", serialized);
    startTransition(() => {
      router.push("/register", { locale });
    });
  }

  function handleChange(field: keyof BirthData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleCityChange(value: string, geo?: { lat: number; lng: number }) {
    setForm((f) => ({
      ...f,
      birthCity: value,
      lat: geo?.lat,
      lng: geo?.lng,
    }));
    if (errors.birthCity) setErrors((e) => ({ ...e, birthCity: undefined }));
  }

  return (
    <div className="relative w-full max-w-sm">
      {/* Subtle outer glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/25 to-transparent blur-xl"
      />

      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-[0_4px_40px_rgba(139,92,246,0.10)] backdrop-blur-xl"
      >
        <p className="mb-4 font-display text-sm font-semibold text-[var(--foreground)]">
          {t("heroFormTitle")}
        </p>

        <div className="flex flex-col gap-2.5">
          {/* Name */}
          <div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/50">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("heroFormName")}
                className={inputCls(errors.name)}
              />
            </div>
            {errors.name && <p className="mt-1 text-[11px] text-red-400">{errors.name}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-[3fr_2fr] gap-2">
            <div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/50">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={inputCls(errors.birthDate)}
                />
              </div>
              {errors.birthDate && <p className="mt-1 text-[11px] text-red-400">{errors.birthDate}</p>}
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/50">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <input
                type="time"
                value={form.birthTime}
                onChange={(e) => handleChange("birthTime", e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] py-2.5 pl-9 pr-1 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15"
              />
            </div>
          </div>

          {/* City with autocomplete */}
          <div>
            <CityAutocomplete
              value={form.birthCity}
              onChange={handleCityChange}
              placeholder={t("heroFormCity")}
              error={errors.birthCity}
            />
            {errors.birthCity && <p className="mt-1 text-[11px] text-red-400">{errors.birthCity}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-0.5 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
            {isPending ? (
              <span className="relative flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("heroFormLoading")}
              </span>
            ) : (
              <span className="relative flex items-center justify-center gap-2">
                {t("heroFormSubmit")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            )}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-[var(--muted-foreground)]">
          🔒 {t("heroFormFree")}
        </p>
      </form>
    </div>
  );
}
