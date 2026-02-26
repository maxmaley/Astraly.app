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

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard({
  params,
}: {
  params: { locale: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  type UserStat    = { subscription_tier: SubscriptionTier; created_at: string };
  type UserRecent  = { id: string; name: string | null; email: string; subscription_tier: SubscriptionTier; created_at: string };

  // Fetch all users (compact — only fields needed for stats)
  const { data: allUsers }    = await admin
    .from("users")
    .select("subscription_tier, created_at") as { data: UserStat[] | null };

  // Fetch recent sign-ups (last 8)
  const { data: recentUsers } = await admin
    .from("users")
    .select("id, name, email, subscription_tier, created_at")
    .order("created_at", { ascending: false })
    .limit(8) as { data: UserRecent[] | null };

  const total   = allUsers?.length ?? 0;
  const now     = Date.now();
  const dayAgo  = new Date(now - 86_400_000).toISOString();
  const weekAgo = new Date(now - 7 * 86_400_000).toISOString();

  const newToday = allUsers?.filter(u => u.created_at >= dayAgo).length   ?? 0;
  const newWeek  = allUsers?.filter(u => u.created_at >= weekAgo).length  ?? 0;

  const byPlan = PLAN_ORDER.reduce((acc, t) => { acc[t] = 0; return acc; }, {} as Record<SubscriptionTier, number>);
  allUsers?.forEach(u => { byPlan[u.subscription_tier]++; });
  const paid = byPlan.moonlight + byPlan.solar + byPlan.cosmic;

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
        <StatCard label="Total users"  value={total}    sub={`${paid} paid`}           />
        <StatCard label="Paid users"   value={paid}     sub={pct(paid, total)}          />
        <StatCard label="New today"    value={newToday} sub="last 24 h"                 />
        <StatCard label="New this week" value={newWeek} sub="last 7 days"               />
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
              const ratio = total ? count / total : 0;
              return (
                <div key={tier} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="text-xl leading-none">{plan.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${plan.color}`}>{plan.name}</span>
                      <span className="text-sm font-semibold text-[var(--foreground)]">{count}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500"
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs text-[var(--muted-foreground)]">
                    {pct(count, total)}
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
