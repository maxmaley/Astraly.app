import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, PLAN_ORDER }  from "@/lib/plans";
import type { SubscriptionTier } from "@/types/database";
import Link from "next/link";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-bold text-[var(--foreground)]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{sub}</p>}
    </div>
  );
}

function pct(n: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard({
  params,
}: {
  params: { locale: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  type UserRecent = { id: string; name: string | null; email: string; subscription_tier: SubscriptionTier; created_at: string };

  const now     = Date.now();
  const dayAgo  = new Date(now - 86_400_000).toISOString();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();

  const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

  // All queries run in parallel; count queries fetch zero rows from the network.
  const [
    { count: total },
    { count: newToday },
    { count: newWeek },
    { count: cntFree },
    { count: cntMoonlight },
    { count: cntSolar },
    { count: cntCosmic },
    { data: recentUsers },
    // Engagement metrics
    { count: msgToday },
    { count: msgWeek },
    { count: chartsTotal },
    { count: horoscopesToday },
    { count: activeSubs },
  ] = await Promise.all([
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).gte("created_at", dayAgo),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).gte("created_at", weekAgo),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).eq("subscription_tier", "free"),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).eq("subscription_tier", "moonlight"),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).eq("subscription_tier", "solar"),
    admin.from("users").select("*", { count: "exact", head: true }).neq("is_test", true).eq("subscription_tier", "cosmic"),
    admin.from("users")
      .select("id, name, email, subscription_tier, created_at")
      .order("created_at", { ascending: false })
      .limit(8) as Promise<{ data: UserRecent[] | null }>,
    // Messages today & this week
    admin.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", dayAgo),
    admin.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
    // Total charts
    admin.from("natal_charts").select("*", { count: "exact", head: true }),
    // Horoscopes generated today
    admin.from("daily_horoscopes").select("*", { count: "exact", head: true }).eq("date", today),
    // Active subscriptions
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const byPlan: Record<SubscriptionTier, number> = {
    free:      cntFree      ?? 0,
    moonlight: cntMoonlight ?? 0,
    solar:     cntSolar     ?? 0,
    cosmic:    cntCosmic    ?? 0,
  };
  const totalN = total ?? 0;
  const paid   = byPlan.moonlight + byPlan.solar + byPlan.cosmic;

  return (
    <div className="px-8 py-8 max-w-5xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <StatCard label="Total users"   value={fmt(totalN)}         sub={`${fmt(paid)} paid`}  />
        <StatCard label="Paid users"    value={fmt(paid)}            sub={pct(paid, totalN)}    />
        <StatCard label="New today"     value={fmt(newToday ?? 0)}   sub="last 24 h"            />
        <StatCard label="New this week" value={fmt(newWeek ?? 0)}    sub="last 7 days"          />
      </div>

      {/* Engagement stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 mb-8">
        <StatCard label="Messages today"    value={fmt(msgToday ?? 0)}         sub={`${fmt(msgWeek ?? 0)} this week`} />
        <StatCard label="Total charts"      value={fmt(chartsTotal ?? 0)}      />
        <StatCard label="Horoscopes today"  value={fmt(horoscopesToday ?? 0)}  />
        <StatCard label="Active subs"       value={fmt(activeSubs ?? 0)}       />
        <StatCard label="Conversion"        value={pct(paid, totalN)}          sub={`${fmt(paid)} of ${fmt(totalN)}`} />
      </div>

      {/* Plan breakdown + Recent sign-ups */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Plan breakdown */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="border-b border-[var(--border)] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              Users by plan
            </p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {PLAN_ORDER.map(tier => {
              const plan  = PLANS[tier];
              const count = byPlan[tier];
              const ratio = totalN ? count / totalN : 0;
              return (
                <div key={tier} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-xl leading-none">{plan.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${plan.color}`}>{plan.name}</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{fmt(count)}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-[var(--muted-foreground)]">
                    {pct(count, totalN)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent sign-ups */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              Recent sign-ups
            </p>
            <Link
              href={`/${params.locale}/admin/users`}
              className="text-xs text-cosmic-400 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentUsers?.map(u => {
              const plan = PLANS[u.subscription_tier];
              const initials = (u.name ?? u.email)[0]?.toUpperCase() ?? "?";
              const date = new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <Link
                  key={u.id}
                  href={`/${params.locale}/admin/users/${u.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--muted)] transition-colors"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {u.name ?? u.email}
                    </p>
                    {u.name && (
                      <p className="truncate text-xs text-[var(--muted-foreground)]">{u.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs ${plan.color}`}>{plan.icon}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{date}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
