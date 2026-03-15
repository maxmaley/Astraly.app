/**
 * POST /api/subscription/sync
 *
 * "Restore purchase" — looks up the user's email in Paddle, finds an active
 * subscription, and syncs it to the local DB.  Handles the case where the
 * webhook was lost or never arrived.
 *
 * Returns:
 *   { ok: true, plan, status }           — subscription synced
 *   { ok: false, reason: "not_found" }   — no Paddle subscription for this email
 *   { ok: false, reason: "already_active" } — already in sync
 */

import { NextResponse }                      from "next/server";
import { cookies }                           from "next/headers";
import { createServerClient }                from "@supabase/ssr";
import { createAdminClient }                 from "@/lib/supabase/admin";
import { tierFromPriceId, getMonthlyTokens } from "@/lib/plans";
import type { Database }                     from "@/types/database";
import type { SubscriptionTier }             from "@/types/database";

// ── Paddle API helpers ────────────────────────────────────────────────────────

function paddleBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

function paddleHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

interface PaddleCustomer {
  id: string;
  email: string;
}

interface PaddleSubscription {
  id: string;
  status: string;
  customer_id: string;
  items: Array<{ price?: { id?: string } }>;
  custom_data?: Record<string, string>;
  current_billing_period?: { starts_at: string; ends_at: string };
  billing_cycle?: { interval: string };
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST() {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const paddleApiKey = process.env.PADDLE_API_KEY;
  if (!paddleApiKey) {
    console.error("[sync] PADDLE_API_KEY not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // ── Check if already synced ─────────────────────────────────────────────
  const { data: existingSub } = await db
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", user.id)
    .single();

  if (existingSub?.status === "active") {
    return NextResponse.json({
      ok: false,
      reason: "already_active",
      plan: existingSub.plan,
    });
  }

  // ── Get user email ──────────────────────────────────────────────────────
  const { data: userData } = await db
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  const email = userData?.email ?? user.email;
  if (!email) {
    return NextResponse.json({ ok: false, reason: "no_email" }, { status: 400 });
  }

  // ── Search Paddle customers by email ────────────────────────────────────
  const customersRes = await fetch(
    `${paddleBase()}/customers?email=${encodeURIComponent(email)}`,
    { headers: paddleHeaders() },
  );

  if (!customersRes.ok) {
    console.error("[sync] Paddle customers API error:", customersRes.status);
    return NextResponse.json({ error: "Paddle API error" }, { status: 502 });
  }

  const customersBody = await customersRes.json();
  const customers: PaddleCustomer[] = customersBody.data ?? [];

  if (customers.length === 0) {
    return NextResponse.json({ ok: false, reason: "not_found" });
  }

  // ── Find active subscription across all matching customers ──────────────
  let activeSub: PaddleSubscription | null = null;

  for (const customer of customers) {
    const subsRes = await fetch(
      `${paddleBase()}/subscriptions?customer_id=${customer.id}&status=active`,
      { headers: paddleHeaders() },
    );

    if (!subsRes.ok) continue;

    const subsBody = await subsRes.json();
    const subs: PaddleSubscription[] = subsBody.data ?? [];

    // Take the first active subscription
    const found = subs.find(s => s.status === "active");
    if (found) {
      activeSub = found;
      break;
    }
  }

  if (!activeSub) {
    return NextResponse.json({ ok: false, reason: "not_found" });
  }

  // ── Resolve plan from price ID ──────────────────────────────────────────
  const priceId = activeSub.items?.[0]?.price?.id;
  const plan: SubscriptionTier | null =
    (activeSub.custom_data?.plan as SubscriptionTier) ??
    (priceId ? tierFromPriceId(priceId) : null);

  if (!plan) {
    console.error("[sync] Could not resolve plan from subscription:", activeSub.id);
    return NextResponse.json({ ok: false, reason: "unknown_plan" }, { status: 500 });
  }

  // ── Sync to local DB (same logic as webhook handler) ────────────────────
  const tokens = getMonthlyTokens(plan);
  const expiresAt = activeSub.current_billing_period?.ends_at ?? null;

  // Upsert subscription record
  const { error: subErr } = await db.from("subscriptions").upsert({
    user_id: user.id,
    plan,
    status: "active",
    paddle_subscription_id: activeSub.id,
    started_at: new Date().toISOString(),
    expires_at: expiresAt,
  }, { onConflict: "user_id" });

  if (subErr) {
    console.error("[sync] subscriptions.upsert error:", subErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  // Upgrade user tier + reset tokens
  const { error: userErr } = await db.from("users").update({
    subscription_tier: plan,
    tokens_left: tokens,
    tokens_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).eq("id", user.id);

  if (userErr) {
    console.error("[sync] users.update error:", userErr);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  console.log(`[sync] Restored subscription for user ${user.id}: plan=${plan}, paddle_sub=${activeSub.id}`);

  return NextResponse.json({ ok: true, plan, status: "active" });
}
