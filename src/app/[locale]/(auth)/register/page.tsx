"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/navigation";
import { createClient } from "@/lib/supabase/client";

interface BirthData {
  name: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15";

const Background = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
    <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-[100px]" />
    <div className="absolute left-1/4 bottom-1/3 h-[280px] w-[280px] rounded-full bg-nebula-500/6 blur-[80px]" />
  </div>
);

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();

  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const isLoading = loading || googleLoading;

  useEffect(() => {
    const stored = sessionStorage.getItem("astraly_birth_data");
    if (stored) {
      setBirthData(JSON.parse(stored) as BirthData);
      // Persist to localStorage so it survives the Google OAuth redirect
      localStorage.setItem("astraly_birth_data", stored);
    }
  }, []);

  function mapError(msg: string): string {
    if (msg.includes("User already registered")) return t("errorEmailExists");
    if (msg.includes("already registered")) return t("errorEmailExists");
    if (msg.includes("Password should be at least")) return t("errorWeakPassword");
    return t("errorGeneric");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: birthData?.name ?? "" },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);

    if (error) { setError(mapError(error.message)); return; }

    if (!data.session) {
      // Supabase requires email confirmation
      setSentTo(email);
      setEmailSent(true);
      return;
    }

    // Session ready — go to chart page
    window.location.replace(`/${locale}/app/chart`);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    document.cookie = `astraly-locale=${locale}; path=/; max-age=300; SameSite=Lax`;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  // ── Email confirmation sent state ──────────────────────────
  if (emailSent) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <Background />
        <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
          <Link href="/" locale={locale} className="flex items-center text-xl font-bold tracking-tight">
            <span className="font-display text-[var(--foreground)]">Astraly</span>
            <span className="font-display text-cosmic-400">.app</span>
          </Link>
          <div className="relative w-full">
            <div aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/25 to-transparent blur-xl" />
            <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-6 text-center shadow-[0_4px_40px_rgba(139,92,246,0.10)] backdrop-blur-xl">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cosmic-500/15 text-2xl">
                  ✉️
                </div>
              </div>
              <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                {t("checkEmailTitle")}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {t("checkEmail", { email: sentTo })}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]/70">
                {t("checkEmailHint")}
              </p>
              <Link
                href="/login"
                locale={locale}
                className="mt-5 inline-block text-sm font-medium text-cosmic-400 transition-colors hover:text-cosmic-300"
              >
                {t("backToLogin")} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main register form ─────────────────────────────────────
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
      <Background />

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
            {/* Header */}
            <div className="mb-5">
              <h1 className="font-display text-xl font-semibold text-[var(--foreground)]">
                {t("registerTitle")}
              </h1>
              <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                {t("registerSubtitle")}
              </p>
            </div>

            {/* Birth data preview */}
            {birthData && (
              <div className="mb-4 rounded-xl border border-cosmic-500/20 bg-cosmic-500/5 px-4 py-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-cosmic-500 dark:text-cosmic-400">
                  {t("birthDataLabel")}
                </p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {birthData.name}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {formatDate(birthData.birthDate)}
                  {birthData.birthTime && ` · ${birthData.birthTime}`}
                  {" · "}
                  {birthData.birthCity}
                </p>
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--input)] py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {googleLoading ? <Spinner /> : <GoogleIcon />}
              {t("googleButton")}
            </button>

            {/* Divider */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-foreground)]">{t("divider")}</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder={t("emailPlaceholder")}
                required
                autoComplete="email"
                className={inputCls}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder={t("passwordPlaceholder")}
                required
                autoComplete="new-password"
                minLength={6}
                className={inputCls}
              />

              {error && (
                <p className="text-sm text-red-400" role="alert">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative mt-1 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading && <Spinner />}
                  {t("registerButton")}
                </span>
              </button>
            </form>

            {/* Switch to login */}
            <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                locale={locale}
                className="font-medium text-cosmic-400 transition-colors hover:text-cosmic-300"
              >
                {t("loginButton")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
