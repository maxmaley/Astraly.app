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

    // Save birth data to sessionStorage for the register page
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
    <form
      onSubmit={handleSubmit}
      className="glass-card w-full max-w-md rounded-2xl p-6 shadow-cosmic"
    >
      <h3 className="mb-5 text-center font-display text-lg font-semibold text-[var(--foreground)]">
        ✦ {t("heroFormTitle")}
      </h3>

      <div className="flex flex-col gap-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            {t("heroFormName")}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder={t("heroFormNamePlaceholder")}
            className={`w-full rounded-xl border bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
              errors.name ? "border-red-500" : "border-[var(--border)]"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("heroFormDate")}
            </label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full rounded-xl border bg-[var(--input)] px-3 py-3 text-sm text-[var(--foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
                errors.birthDate ? "border-red-500" : "border-[var(--border)]"
              }`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-xs text-red-400">{errors.birthDate}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              {t("heroFormTime")}
            </label>
            <input
              type="time"
              value={form.birthTime}
              onChange={(e) => handleChange("birthTime", e.target.value)}
              placeholder={t("heroFormTimePlaceholder")}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-3 text-sm text-[var(--foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20"
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            {t("heroFormCity")}
          </label>
          <input
            type="text"
            value={form.birthCity}
            onChange={(e) => handleChange("birthCity", e.target.value)}
            placeholder={t("heroFormCityPlaceholder")}
            className={`w-full rounded-xl border bg-[var(--input)] px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition-all focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/20 ${
              errors.birthCity ? "border-red-500" : "border-[var(--border)]"
            }`}
          />
          {errors.birthCity && (
            <p className="mt-1 text-xs text-red-400">{errors.birthCity}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="group mt-1 w-full rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {t("heroFormLoading")}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {t("heroFormSubmit")}
            </span>
          )}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
        {t("heroFormFree")}
      </p>
    </form>
  );
}
