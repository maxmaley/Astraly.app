"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/navigation";
import { createClient } from "@/lib/supabase/client";

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(t("errorGeneric"));
      return;
    }

    setDone(true);
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      {/* Background glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[100px]" />
        <div className="absolute right-1/4 top-1/4 h-[280px] w-[280px] rounded-full bg-nebula-500/6 blur-[80px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        {/* Logo */}
        <Link href="/" locale={locale} className="flex items-center text-xl font-bold tracking-tight">
          <span className="font-display text-[var(--foreground)]">Astraly</span>
          <span className="font-display text-cosmic-400">.app</span>
        </Link>

        {/* Card */}
        <div className="relative w-full">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/25 to-transparent blur-xl" />

          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 shadow-[0_4px_40px_rgba(139,92,246,0.10)] backdrop-blur-xl">
            {done ? (
              /* Success state */
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">
                  ✓
                </div>
                <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                  {t("passwordUpdated")}
                </h1>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {t("passwordUpdatedDesc")}
                </p>
                <Link
                  href="/login"
                  locale={locale}
                  className="mt-5 inline-block text-sm font-medium text-cosmic-400 transition-colors hover:text-cosmic-300"
                >
                  {t("backToLogin")}
                </Link>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="mb-5">
                  <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                    {t("resetPasswordTitle")}
                  </h1>
                  <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                    {t("resetPasswordSubtitle")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder={t("newPasswordPlaceholder")}
                    required
                    autoComplete="new-password"
                    className={inputCls}
                  />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(null); }}
                    placeholder={t("confirmPasswordPlaceholder")}
                    required
                    autoComplete="new-password"
                    className={inputCls}
                  />

                  {error && (
                    <p className="text-sm text-red-400" role="alert">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading && <Spinner />}
                      {t("resetPasswordButton")}
                    </span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
