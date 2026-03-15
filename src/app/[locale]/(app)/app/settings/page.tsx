"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslations, useLocale }                         from "next-intl";
import { usePathname, useRouter }                             from "@/navigation";
import { createClient }                                       from "@/lib/supabase/client";
import { useTheme }                                           from "@/components/shared/ThemeProvider";
import type { SubscriptionTier }                              from "@/types/database";
import type { Locale }                                        from "@/routing";
import { Link }                                               from "@/navigation";

// ── Types ──────────────────────────────────────────────────────────────────

interface UserSettings {
  id:                 string;
  email:              string;
  name:               string | null;
  subscription_tier:  SubscriptionTier;
  tokens_left:        number;
  lang:               string;
  theme:              string;
  notify_email:       boolean;
}

interface SubStatus {
  status:                   string | null;
  expires_at:               string | null;
  paddle_subscription_id:   string | null;
}

// ── Plan display config ────────────────────────────────────────────────────

const PLAN: Record<SubscriptionTier, {
  icon:        string;
  label:       string;
  color:       string;
  ring:        string;
  tokenLimit:  number;
}> = {
  free:      { icon: "⭐", label: "Starlight",    color: "text-slate-400",   ring: "ring-slate-400/30",   tokenLimit: 10_000     },
  moonlight: { icon: "🌙", label: "Moonlight",    color: "text-blue-400",    ring: "ring-blue-400/30",    tokenLimit: 500_000    },
  solar:     { icon: "☀️", label: "Solar Oracle", color: "text-amber-400",   ring: "ring-amber-400/30",   tokenLimit: 1_000_000  },
  cosmic:    { icon: "🌌", label: "Cosmic Mind",  color: "text-cosmic-400",  ring: "ring-cosmic-400/30",  tokenLimit: 1_500_000  },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function initials(name: string | null | undefined, email: string): string {
  const src = name?.trim() || email;
  return src[0]?.toUpperCase() ?? "?";
}

// ── Toggle switch ──────────────────────────────────────────────────────────

function Toggle({
  checked, onChange, disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent",
        "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-500/50",
        checked ? "bg-cosmic-500" : "bg-[var(--border)]",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      ].join(" ")}
    >
      <span className={[
        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow",
        "transition duration-200",
        checked ? "translate-x-5" : "translate-x-0",
      ].join(" ")} />
    </button>
  );
}

// ── Section card ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          {title}
        </p>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────────────────

function Row({
  label, desc, children,
}: {
  label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {desc && (
          <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{desc}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ── Segmented control ─────────────────────────────────────────────────────

function Segment<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-xl border border-[var(--border)] p-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
            value === opt.value
              ? "bg-cosmic-500 text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Inline name editor ────────────────────────────────────────────────────

function NameEditor({
  value: initialValue,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(initialValue);
  const [busy,    setBusy]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync when parent value changes (e.g. after optimistic update)
  useEffect(() => { if (!editing) setDraft(initialValue); }, [initialValue, editing]);

  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  async function commit() {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed === initialValue || !trimmed) { setDraft(initialValue); return; }
    setBusy(true);
    try { await onSave(trimmed); }
    finally { setBusy(false); }
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter")  { e.preventDefault(); commit(); }
    if (e.key === "Escape") { setEditing(false); setDraft(initialValue); }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        disabled={busy}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKey}
        placeholder={placeholder}
        className={[
          "w-44 rounded-lg border border-cosmic-500/50 bg-[var(--input)]",
          "px-3 py-1.5 text-sm text-[var(--foreground)]",
          "focus:outline-none focus:ring-2 focus:ring-cosmic-500/30",
        ].join(" ")}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 text-sm text-[var(--foreground)] hover:text-cosmic-400 transition-colors"
    >
      {initialValue || (
        <span className="italic text-[var(--muted-foreground)]">—</span>
      )}
      {/* Pencil icon — visible on hover */}
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[var(--border)]/50 ${className ?? ""}`} />;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      {[3, 2, 2, 2].map((rows, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="border-b border-[var(--border)] px-5 py-3.5">
            <SkeletonBlock className="h-3 w-20" />
          </div>
          {Array.from({ length: rows }).map((_, j) => (
            <div key={j} className="flex items-center justify-between px-5 py-4">
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-28" />
                {j > 0 && <SkeletonBlock className="h-3 w-44" />}
              </div>
              <SkeletonBlock className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Cancel confirmation modal ─────────────────────────────────────────────

function CancelModal({
  open, busy, onConfirm, onClose, planLabel,
}: {
  open: boolean; busy: boolean;
  onConfirm: () => void; onClose: () => void;
  planLabel: string;
}) {
  const t = useTranslations("settings");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          {t("cancelTitle")}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {t("cancelDesc", { plan: planLabel })}
        </p>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={busy}
            className="h-9 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
          >
            {t("cancelKeep")}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="h-9 rounded-xl bg-rose-500 px-4 text-sm font-medium text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
          >
            {busy ? t("cancellingBtn") : t("cancelConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t       = useTranslations("settings");
  const locale  = useLocale() as Locale;
  const pathname = usePathname();
  const router  = useRouter();
  const { theme, setTheme } = useTheme();

  const supabase = useMemo(() => createClient(), []);

  const [user,    setUser]    = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [pwLinkSent, setPwLinkSent]   = useState(false);
  const [pwLinkBusy, setPwLinkBusy]   = useState(false);

  // Subscription cancel state
  const [subStatus, setSubStatus]             = useState<SubStatus | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBusy, setCancelBusy]           = useState(false);
  const [cancelledUntil, setCancelledUntil]   = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const { data: { user: auth } } = await supabase.auth.getUser();
      if (!auth) { router.replace("/login"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase
        .from("users")
        .select("id, email, name, subscription_tier, tokens_left, lang, theme, notify_email")
        .eq("id", auth.id)
        .single() as { data: UserSettings | null; error: unknown };

      if (data) {
        setUser(data);
        // Check if user has email/password identity
        const identities = auth.identities ?? [];
        setHasPassword(identities.some(i => i.provider === "email"));
        // Sync theme from DB if no local override
        const stored = typeof window !== "undefined" ? localStorage.getItem("astraly-theme") : null;
        if (!stored && data.theme) setTheme(data.theme as "dark" | "light");

        // Fetch subscription record for cancel flow
        if (data.subscription_tier !== "free") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: sub } = await (supabase as any)
            .from("subscriptions")
            .select("status, expires_at, paddle_subscription_id")
            .eq("user_id", auth.id)
            .single() as { data: SubStatus | null; error: unknown };
          if (sub) {
            setSubStatus(sub);
            if (sub.status === "cancelled" && sub.expires_at) {
              setCancelledUntil(sub.expires_at);
            }
          }
        }
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Optimistic patch ──────────────────────────────────────────────────────

  const patch = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (updates: Partial<UserSettings>) => {
      if (!user) return;
      setUser(prev => prev ? { ...prev, ...updates } : prev);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("users") as any).update(updates).eq("id", user.id);
    },
    [user, supabase],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function saveName(name: string) { await patch({ name }); }

  async function applyTheme(t: "dark" | "light") {
    setTheme(t);
    await patch({ theme: t });
  }

  async function switchLang(next: Locale) {
    await patch({ lang: next });
    router.replace(pathname, { locale: next });
  }

  async function sendPasswordLink() {
    if (pwLinkBusy) return;
    setPwLinkBusy(true);
    await supabase.auth.resetPasswordForEmail(user!.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
    });
    setPwLinkSent(true);
    setPwLinkBusy(false);
  }

  async function cancelSubscription() {
    setCancelBusy(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.effective_from) {
        setCancelledUntil(data.effective_from);
        setSubStatus(prev => prev ? { ...prev, status: "cancelled" } : prev);
      } else if (res.status === 409 && data.expires_at) {
        // Already cancelled
        setCancelledUntil(data.expires_at);
      }
    } catch (err) {
      console.error("[cancel]", err);
    } finally {
      setCancelBusy(false);
      setShowCancelModal(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10 space-y-4">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-cosmic-400 text-xl">✦</span>
          <SkeletonBlock className="h-7 w-32" />
        </div>
        <SettingsSkeleton />
      </div>
    );
  }

  if (!user) return null;

  const plan   = PLAN[user.subscription_tier];
  const isFree = user.subscription_tier === "free";
  const isTop  = user.subscription_tier === "cosmic";
  const avatar = initials(user.name, user.email);

  // Energy bar: ratio relative to plan limit (capped at 100 %)
  const tokenRatio  = Math.min(1, user.tokens_left / plan.tokenLimit);
  const energyPct   = Math.round(tokenRatio * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10 space-y-4">

      {/* Page title */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-cosmic-400 text-xl">✦</span>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">{t("title")}</h1>
      </div>

      {/* ── Account ── */}
      <Section title={t("account")}>

        {/* Avatar + name row */}
        <div className="flex items-center gap-4 px-5 py-5">
          {/* Gradient avatar */}
          <div className={[
            "flex h-14 w-14 shrink-0 select-none items-center justify-center",
            "rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500",
            "text-xl font-bold text-white shadow-md ring-4",
            plan.ring,
          ].join(" ")}>
            {avatar}
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              {t("name")}
            </p>
            <NameEditor
              value={user.name ?? ""}
              placeholder={t("namePlaceholder")}
              onSave={saveName}
            />
          </div>
        </div>

        {/* Email — readonly */}
        <Row label={t("email")}>
          <span className="text-sm text-[var(--muted-foreground)] tabular-nums">
            {user.email}
          </span>
        </Row>
      </Section>

      {/* ── Plan ── */}
      <Section title={t("plan")}>
        <div className="px-5 py-5 space-y-4">

          {/* Tier header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{plan.icon}</span>
              <div>
                <p className={`text-base font-bold leading-tight ${plan.color}`}>
                  {plan.label}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {`${energyPct}% ${t("energyLeft")}`}
                </p>
              </div>
            </div>

            {isTop ? (
              <p className="text-xs font-medium text-cosmic-400">{t("topPlan")}</p>
            ) : (
              <Link
                href="/app/pricing"
                className={[
                  "rounded-xl bg-gradient-to-r from-cosmic-500 to-nebula-500",
                  "px-4 py-2 text-xs font-semibold text-white",
                  "hover:opacity-90 active:opacity-75 transition-opacity",
                ].join(" ")}
              >
                {t("upgradeCta")}
              </Link>
            )}
          </div>

          {/* Cancelled banner */}
          {cancelledUntil && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <p className="text-sm font-medium text-amber-400">
                {t("cancelledBanner", {
                  date: new Date(cancelledUntil).toLocaleDateString(locale, {
                    month: "long", day: "numeric", year: "numeric",
                  }),
                })}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t("cancelledBannerSub")}
              </p>
            </div>
          )}

          {/* Token progress bar */}
          <div>
            <div className="mb-1.5 flex justify-between">
              <span className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
                {t("energyBalance")}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                {energyPct}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500 transition-all duration-700"
                style={{ width: `${tokenRatio * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--muted-foreground)]">
              {t("energyReset")}
            </p>
          </div>

          {/* Cancel subscription */}
          {!isFree && subStatus?.paddle_subscription_id && !cancelledUntil && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-xs text-[var(--muted-foreground)] hover:text-rose-400 transition-colors"
            >
              {t("cancelLink")}
            </button>
          )}
        </div>
      </Section>

      {/* Cancel confirmation modal */}
      <CancelModal
        open={showCancelModal}
        busy={cancelBusy}
        onConfirm={cancelSubscription}
        onClose={() => setShowCancelModal(false)}
        planLabel={plan.label}
      />

      {/* ── Appearance ── */}
      <Section title={t("appearance")}>

        <Row label={t("theme")}>
          <Segment
            value={theme as "dark" | "light"}
            onChange={applyTheme}
            options={[
              { value: "light" as const, label: `☀️ ${t("themeLight")}` },
              { value: "dark"  as const, label: `🌑 ${t("themeDark")}` },
            ]}
          />
        </Row>

        <Row label={t("language")}>
          <Segment
            value={locale}
            onChange={switchLang}
            options={[
              { value: "ru" as Locale, label: "RU" },
              { value: "uk" as Locale, label: "UA" },
              { value: "en" as Locale, label: "EN" },
            ]}
          />
        </Row>
      </Section>

      {/* ── Notifications ── */}
      <Section title={t("notifications")}>

        <Row label={t("notifEmail")} desc={t("notifEmailDesc")}>
          <Toggle
            checked={user.notify_email}
            onChange={v => patch({ notify_email: v })}
          />
        </Row>

      </Section>

      {/* ── Security ── */}
      <Section title={t("security")}>
        <Row
          label={t("password")}
          desc={hasPassword ? t("changePasswordDesc") : t("setPasswordDesc")}
        >
          {pwLinkSent ? (
            <span className="text-xs font-medium text-emerald-400">
              {t("passwordLinkSent")}
            </span>
          ) : (
            <button
              onClick={sendPasswordLink}
              disabled={pwLinkBusy}
              className={[
                "rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                "border border-[var(--border)] text-[var(--foreground)]",
                "hover:border-cosmic-400/50 hover:text-cosmic-400",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {hasPassword ? t("changePassword") : t("setPassword")}
            </button>
          )}
        </Row>
      </Section>

      {/* ── Logout ── */}
      <div className="flex items-center justify-between px-1 pb-2">
        <button
          onClick={logout}
          className="group flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-rose-400 transition-colors"
        >
          {/* Exit icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 transition-opacity">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t("logout")}
        </button>
      </div>

    </div>
  );
}
