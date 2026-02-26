"use server";

import { cookies }   from "next/headers";
import { redirect }  from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS }     from "@/lib/plans";
import type { SubscriptionTier, Database } from "@/types/database";

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

  await createAdminClient()
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

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  if (user) {
    const { monthlyTokens } = PLANS[user.subscription_tier];
    const tokens_left = monthlyTokens === -1 ? 999_999 : monthlyTokens;
    await admin.from("users").update({ tokens_left }).eq("id", userId);
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

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("users")
    .select("tokens_left")
    .eq("id", userId)
    .single();

  if (user) {
    await admin
      .from("users")
      .update({ tokens_left: user.tokens_left + amount })
      .eq("id", userId);
  }

  redirect(`/${locale}/admin/users/${userId}?msg=grant`);
}

// ── Toggle account suspension ─────────────────────────────────────────────────

export async function toggleBanAction(formData: FormData) {
  await requireAdmin();

  const userId   = formData.get("userId")  as string;
  const locale   = formData.get("locale")  as string;
  const is_banned = formData.get("ban") === "true";

  await createAdminClient()
    .from("users")
    .update({ is_banned })
    .eq("id", userId);

  revalidatePath(`/${locale}/admin/users/${userId}`);
  redirect(`/${locale}/admin/users/${userId}?msg=ban`);
}

// ── Grant admin role ──────────────────────────────────────────────────────────

export async function toggleAdminAction(formData: FormData) {
  await requireAdmin();

  const userId   = formData.get("userId")  as string;
  const locale   = formData.get("locale")  as string;
  const is_admin = formData.get("grant") === "true";

  await createAdminClient()
    .from("users")
    .update({ is_admin })
    .eq("id", userId);

  redirect(`/${locale}/admin/users/${userId}?msg=admin`);
}
