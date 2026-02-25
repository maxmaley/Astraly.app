"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useLocale } from "next-intl";

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

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
  });
  const [errors, setErrors] = useState<Partial<BirthData>>({});

  function validate() {
    const e: Partial<BirthData> = {};
    if (!form.name.trim()) e.name = t("heroFormErrorName");
    if (!form.birthDate) e.birthDate = t("heroFormErrorDate");
    if (!form.birthCity.trim()) e.birthCity = t("heroFormErrorCity");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    sessionStorage.setItem("astraly_birth_data", JSON.stringify(form));
    startTransition(() => {
      router.push("/register", { locale });
    });
  }

  function handleChange(field: keyof BirthData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Ambient outer glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-cosmic-500/50 via-nebula-500/25 to-transparent blur-md"
      />

      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 shadow-[0_8px_64px_rgba(139,92,246,0.18)] backdrop-blur-2xl"
      >
        {/* Top gradient accent */}
        <div className="h-[3px] w-full bg-gradient-to-r from-cosmic-500 via-nebula-400 to-cosmic-400" />

        {/* Card header */}
        <div className="px-6 pb-5 pt-6 text-center">
          <div className="mb-1 flex items-center justify-center gap-2">
            <span className="text-base text-cosmic-400">✦</span>
            <span className="font-display text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {t("heroFormTitle")}
            </span>
            <span className="text-base text-cosmic-400">✦</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {t("heroFormSubtitle")}
          </p>
        </div>

        {/* Hairline divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

        {/* Form fields */}
        <div className="flex flex-col gap-3.5 px-6 pb-5 pt-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wider text-[var(--muted-foreground)]">
              {t("heroFormName")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("heroFormNamePlaceholder")}
                className={`w-full rounded-xl border bg-[var(--input)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
                  errors.name ? "border-red-500" : "border-[var(--border)]"
                }`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-[var(--muted-foreground)]">
                {t("heroFormDate")}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className={`w-full rounded-xl border bg-[var(--input)] py-3 pl-10 pr-2 text-sm text-[var(--foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
                    errors.birthDate ? "border-red-500" : "border-[var(--border)]"
                  }`}
                />
              </div>
              {errors.birthDate && <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium tracking-wider text-[var(--muted-foreground)]">
                {t("heroFormTime")}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => handleChange("birthTime", e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] py-3 pl-10 pr-2 text-sm text-[var(--foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20"
                />
              </div>
            </div>
          </div>

          {/* City */}
          <div>
            <label className="mb-1.5 block text-xs font-medium tracking-wider text-[var(--muted-foreground)]">
              {t("heroFormCity")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <input
                type="text"
                value={form.birthCity}
                onChange={(e) => handleChange("birthCity", e.target.value)}
                placeholder={t("heroFormCityPlaceholder")}
                className={`w-full rounded-xl border bg-[var(--input)] py-3 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
                  errors.birthCity ? "border-red-500" : "border-[var(--border)]"
                }`}
              />
            </div>
            {errors.birthCity && <p className="mt-1 text-xs text-red-400">{errors.birthCity}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="group relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Shimmer overlay on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
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
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {/* Trust footer bar */}
        <div className="flex items-center justify-center gap-3 border-t border-[var(--border)] bg-[var(--muted)]/20 px-6 py-3">
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {t("heroFormTrustSecure")}
          </span>
          <span className="h-3 w-px bg-[var(--border)]" />
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            {t("heroFormTrustFast")}
          </span>
          <span className="h-3 w-px bg-[var(--border)]" />
          <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
            <span className="text-cosmic-400 text-[10px]">✦</span>
            {t("heroFormFree")}
          </span>
        </div>
      </form>
    </div>
  );
}
