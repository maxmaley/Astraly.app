import { notFound }          from "next/navigation";
import Link                  from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, PLAN_ORDER, formatPrice } from "@/lib/plans";
import {
  changePlanAction,
  resetTokensAction,
  grantTokensAction,
  toggleBanAction,
  toggleAdminAction,
} from "../../_actions";

// ── Section card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] px-5 py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
          {title}
        </p>
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

// ── Toast message ─────────────────────────────────────────────────────────────

const MSG_MAP: Record<string, { text: string; color: string }> = {
  plan:  { text: "Plan updated successfully.",     color: "text-emerald-400" },
  reset: { text: "Tokens reset to plan limit.",    color: "text-emerald-400" },
  grant: { text: "Tokens granted.",                color: "text-emerald-400" },
  ban:   { text: "Account status updated.",        color: "text-amber-400"   },
  admin: { text: "Admin role updated.",            color: "text-cosmic-400"  },
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams: { msg?: string };
}) {
  const { locale, id } = params;
  const admin = createAdminClient();

  type AdminUser = {
    id: string; name: string | null; email: string;
    subscription_tier: import("@/types/database").SubscriptionTier;
    tokens_left: number; is_admin: boolean; is_banned: boolean;
    created_at: string; updated_at: string; lang: string;
    notify_email: boolean; notify_telegram: boolean;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: user }, { count: chartsCount }] = await Promise.all([
    (admin as any)
      .from("users")
      .select("id, name, email, subscription_tier, tokens_left, is_admin, is_banned, created_at, updated_at, lang, notify_email, notify_telegram")
      .eq("id", id)
      .single() as Promise<{ data: AdminUser | null; error: unknown }>,
    admin
      .from("natal_charts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", id),
  ]);

  if (!user) notFound();

  const plan       = PLANS[user.subscription_tier];
  const tokenLim   = plan.monthlyTokens;
  const tokenPct   = tokenLim === -1 ? 100 : Math.min(100, Math.round((user.tokens_left / tokenLim) * 100));
  const initials   = (user.name ?? user.email)[0]?.toUpperCase() ?? "?";
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const msg        = searchParams.msg ? MSG_MAP[searchParams.msg] : null;

  return (
    <div className="px-8 py-8 max-w-2xl space-y-5">

      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Link href={`/${locale}/admin/users`} className="hover:text-[var(--foreground)] transition-colors">
          Users
        </Link>
        <span>/</span>
        <span className="text-[var(--foreground)] truncate max-w-xs">
          {user.name ?? user.email}
        </span>
      </div>

      {/* Success message */}
      {msg && (
        <div className={`rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium ${msg.color}`}>
          ✓ {msg.text}
        </div>
      )}

      {/* ── Profile card ── */}
      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xl font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-base font-bold text-[var(--foreground)]">
              {user.name ?? <span className="italic text-[var(--muted-foreground)]">No name</span>}
            </p>
            {user.is_admin && (
              <span className="rounded-full bg-cosmic-500/15 px-2 py-0.5 text-[10px] font-medium text-cosmic-400">admin</span>
            )}
            {user.is_banned && (
              <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">suspended</span>
            )}
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">{user.email}</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Joined {joinedDate} · {chartsCount ?? 0} chart{chartsCount === 1 ? "" : "s"} · lang: {user.lang}
          </p>
        </div>
      </div>

      {/* ── Subscription ── */}
      <Section title="Subscription">
        {/* Current plan */}
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{plan.icon}</span>
          <div className="flex-1">
            <p className={`font-bold ${plan.color}`}>{plan.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              ${formatPrice(plan.price.monthly)}/mo
            </p>
          </div>
          {/* Token bar */}
          <div className="text-right">
            <p className="text-xs text-[var(--muted-foreground)]">
              {tokenLim === -1 ? "∞ tokens" : `${user.tokens_left.toLocaleString()} / ${tokenLim.toLocaleString()}`}
            </p>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500"
                style={{ width: `${tokenPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Change plan */}
        <form action={changePlanAction} className="flex items-center gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="locale" value={locale} />
          <select
            name="tier"
            defaultValue={user.subscription_tier}
            className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-cosmic-500/40"
          >
            {PLAN_ORDER.map(tier => (
              <option key={tier} value={tier}>
                {PLANS[tier].icon} {PLANS[tier].name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 rounded-xl bg-cosmic-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Change plan
          </button>
        </form>

        {/* Reset tokens */}
        <form action={resetTokensAction} className="flex items-center justify-between gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="locale" value={locale} />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Reset tokens</p>
            <p className="text-xs text-[var(--muted-foreground)]">Restore to plan limit</p>
          </div>
          <button
            type="submit"
            className="h-9 rounded-xl border border-[var(--border)] px-4 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Reset
          </button>
        </form>
      </Section>

      {/* ── Grant tokens ── */}
      <Section title="Grant tokens">
        <form action={grantTokensAction} className="flex items-center gap-3">
          <input type="hidden" name="userId" value={user.id} />
          <input type="hidden" name="locale" value={locale} />
          <input
            name="amount"
            type="number"
            min="1"
            max="500000"
            placeholder="e.g. 10000"
            className="flex-1 h-9 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-cosmic-500/40"
          />
          <div className="flex gap-2">
            {[1_000, 5_000, 10_000].map(n => (
              <button
                key={n}
                type="submit"
                name="amount"
                value={n}
                className="h-9 rounded-xl border border-[var(--border)] px-3 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                +{(n / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
          <button
            type="submit"
            className="h-9 rounded-xl bg-cosmic-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Grant
          </button>
        </form>
      </Section>

      {/* ── Admin role ── */}
      <Section title="Admin role">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {user.is_admin ? "Admin access granted" : "No admin access"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Admins can access /admin and manage all users.
            </p>
          </div>
          <form action={toggleAdminAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="grant" value={user.is_admin ? "false" : "true"} />
            <button
              type="submit"
              className={[
                "h-9 rounded-xl px-4 text-sm font-medium transition-colors",
                user.is_admin
                  ? "border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]"
                  : "bg-cosmic-500/15 text-cosmic-400 hover:bg-cosmic-500/25",
              ].join(" ")}
            >
              {user.is_admin ? "Revoke admin" : "Grant admin"}
            </button>
          </form>
        </div>
      </Section>

      {/* ── Danger zone ── */}
      <Section title="Danger zone">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              {user.is_banned ? "Account is suspended" : "Suspend account"}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {user.is_banned
                ? "User cannot log in. Lift the suspension to restore access."
                : "Prevents the user from accessing the app."}
            </p>
          </div>
          <form action={toggleBanAction}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="ban" value={user.is_banned ? "false" : "true"} />
            <button
              type="submit"
              className={[
                "h-9 rounded-xl px-4 text-sm font-medium transition-colors",
                user.is_banned
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25",
              ].join(" ")}
            >
              {user.is_banned ? "Lift suspension" : "Suspend"}
            </button>
          </form>
        </div>
      </Section>

    </div>
  );
}
