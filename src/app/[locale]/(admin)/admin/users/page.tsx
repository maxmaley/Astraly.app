import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, PLAN_ORDER }  from "@/lib/plans";
import type { SubscriptionTier } from "@/types/database";
import Link from "next/link";

const PAGE_SIZE = 25;

// ── Plan badge ────────────────────────────────────────────────────────────────

function PlanBadge({ tier }: { tier: SubscriptionTier }) {
  const plan = PLANS[tier];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${plan.color} bg-[var(--muted)]`}>
      {plan.icon} {plan.name}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string; plan?: string; page?: string };
}) {
  const q    = searchParams.q?.trim() ?? "";
  const plan = searchParams.plan ?? "";
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;

  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin
    .from("users")
    .select("id, name, email, subscription_tier, tokens_left, is_admin, is_banned, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q)    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  if (plan) query = query.eq("subscription_tier", plan as SubscriptionTier);

  const { data: users, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const locale = params.locale;

  function pageUrl(p: number) {
    const sp = new URLSearchParams();
    if (q)    sp.set("q", q);
    if (plan) sp.set("plan", plan);
    sp.set("page", String(p));
    return `/${locale}/admin/users?${sp.toString()}`;
  }

  return (
    <div className="px-8 py-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Users</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            {count ?? 0} total
          </p>
        </div>
      </div>

      {/* Search + filter */}
      <form className="mb-6 flex flex-wrap gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email or name…"
          className="h-9 w-64 rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-cosmic-500/40"
        />

        {/* Plan filter tabs */}
        <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--card)] p-0.5">
          {[{ value: "", label: "All" }, ...PLAN_ORDER.map(t => ({ value: t, label: PLANS[t].name }))].map(opt => (
            <button
              key={opt.value}
              name="plan"
              value={opt.value}
              type="submit"
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                plan === opt.value
                  ? "bg-cosmic-500 text-white shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Hidden q reset when plan tab is clicked */}
        <input type="hidden" name="q" value={q} />
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">User</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Plan</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Tokens</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Joined</th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">Flags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
            {users?.map((u: {
              id: string;
              name: string | null;
              email: string;
              subscription_tier: SubscriptionTier;
              tokens_left: number;
              is_admin: boolean;
              is_banned: boolean;
              created_at: string;
            }) => {
              const initials  = (u.name ?? u.email)[0]?.toUpperCase() ?? "?";
              const planCfg   = PLANS[u.subscription_tier];
              const tokenLim  = planCfg.monthlyTokens;
              const tokenPct  = tokenLim === -1 ? 100 : Math.min(100, Math.round((u.tokens_left / tokenLim) * 100));
              const joined    = new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

              return (
                <tr key={u.id} className="hover:bg-[var(--muted)] transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/${locale}/admin/users/${u.id}`} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500 to-nebula-500 text-xs font-bold text-white">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--foreground)]">
                          {u.name ?? <span className="italic text-[var(--muted-foreground)]">—</span>}
                        </p>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{u.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <PlanBadge tier={u.subscription_tier} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cosmic-500 to-nebula-500"
                          style={{ width: `${tokenPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {tokenLim === -1 ? "∞" : u.tokens_left.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[var(--muted-foreground)]">
                    {joined}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      {u.is_admin && (
                        <span className="rounded-full bg-cosmic-500/15 px-2 py-0.5 text-[10px] font-medium text-cosmic-400">
                          admin
                        </span>
                      )}
                      {u.is_banned && (
                        <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                          banned
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!users || users.length === 0) && (
          <div className="py-12 text-center text-sm text-[var(--muted-foreground)]">
            No users found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-[var(--muted-foreground)]">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageUrl(page + 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
