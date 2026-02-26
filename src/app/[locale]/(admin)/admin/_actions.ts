"use server";

import { cookies }      from "next/headers";
import { redirect }     from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS }        from "@/lib/plans";
import type { SubscriptionTier, Database } from "@/types/database";

// Supabase TypeScript inference returns 'never' for columns added after
// the initial schema generation. Cast to any to bypass — consistent with
// the rest of this codebase (settings/page.tsx, pricing/page.tsx).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adminDb = () => createAdminClient() as any;

// ── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthenticated");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single() as { data: { is_admin: boolean } | null };

  if (!profile?.is_admin) throw new Error("Forbidden");
}

// ── Change subscription plan ──────────────────────────────────────────────────

export async function changePlanAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const locale  = formData.get("locale")  as string;
  const tier    = formData.get("tier")    as SubscriptionTier;

  const { monthlyTokens } = PLANS[tier];
  const tokens_left = monthlyTokens === -1 ? 999_999 : monthlyTokens;

  await adminDb()
    .from("users")
    .update({ subscription_tier: tier, tokens_left })
    .eq("id", userId);

  redirect(`/${locale}/admin/users/${userId}?msg=plan`);
}

// ── Reset tokens to plan limit ────────────────────────────────────────────────

export async function resetTokensAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const locale  = formData.get("locale")  as string;

  const db = adminDb();
  const { data: user } = await db
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (user) {
    const { monthlyTokens } = PLANS[user.subscription_tier as SubscriptionTier];
    const tokens_left = monthlyTokens === -1 ? 999_999 : monthlyTokens;
    await db.from("users").update({ tokens_left }).eq("id", userId);
  }

  redirect(`/${locale}/admin/users/${userId}?msg=reset`);
}

// ── Grant extra tokens ────────────────────────────────────────────────────────

export async function grantTokensAction(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const locale  = formData.get("locale")  as string;
  const amount  = Number(formData.get("amount") ?? 0);

  if (amount <= 0) redirect(`/${locale}/admin/users/${userId}`);

  const db = adminDb();
  const { data: user } = await db
    .from("users")
    .select("tokens_left")
    .eq("id", userId)
    .single();

  if (user) {
    await db
      .from("users")
      .update({ tokens_left: (user.tokens_left as number) + amount })
      .eq("id", userId);
  }

  redirect(`/${locale}/admin/users/${userId}?msg=grant`);
}

// ── Toggle account suspension ─────────────────────────────────────────────────

export async function toggleBanAction(formData: FormData) {
  await requireAdmin();

  const userId    = formData.get("userId") as string;
  const locale    = formData.get("locale") as string;
  const is_banned = formData.get("ban") === "true";

  await adminDb()
    .from("users")
    .update({ is_banned })
    .eq("id", userId);

  revalidatePath(`/${locale}/admin/users/${userId}`);
  redirect(`/${locale}/admin/users/${userId}?msg=ban`);
}

// ── Grant / revoke admin role ─────────────────────────────────────────────────

export async function toggleAdminAction(formData: FormData) {
  await requireAdmin();

  const userId   = formData.get("userId") as string;
  const locale   = formData.get("locale") as string;
  const is_admin = formData.get("grant") === "true";

  await adminDb()
    .from("users")
    .update({ is_admin })
    .eq("id", userId);

  redirect(`/${locale}/admin/users/${userId}?msg=admin`);
}
