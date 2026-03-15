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
  };
}

async function paddleGet(path: string): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${paddleBase()}${path}`;
  console.log(`[sync] GET ${url}`);
  const res = await fetch(url, { headers: paddleHeaders() });
  const body = await res.json().catch(() => null);
  console.log(`[sync] → ${res.status}`, JSON.stringify(body)?.slice(0, 500));
  return { ok: res.ok, status: res.status, data: body?.data ?? null };
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

  console.log(`[sync] Starting sync for user ${user.id}, env=${process.env.NEXT_PUBLIC_PADDLE_ENV}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // ── Check if already synced ─────────────────────────────────────────────
  const { data: existingSub } = await db
    .from("subscriptions")
    .select("status, plan")
    .eq("user_id", user.id)
    .single();

  if (existingSub?.status === "active") {
    console.log(`[sync] Already active: plan=${existingSub.plan}`);
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

  console.log(`[sync] Searching Paddle for email: ${email}`);

  // ── Search Paddle customers by email ────────────────────────────────────
  const customersResult = await paddleGet(`/customers?email=${encodeURIComponent(email)}`);

  if (!customersResult.ok) {
    return NextResponse.json({ error: "Paddle API error", details: customersResult.status }, { status: 502 });
  }

  const customers = (customersResult.data ?? []) as Array<{ id: string; email: string }>;
  console.log(`[sync] Found ${customers.length} customer(s):`, customers.map(c => c.id));

  if (customers.length === 0) {
    console.log(`[sync] No customers found for ${email}`);
    return NextResponse.json({ ok: false, reason: "not_found" });
  }

  // ── Find active subscription across all matching customers ──────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeSub: Record<string, any> | null = null;

  for (const customer of customers) {
    console.log(`[sync] Checking subscriptions for customer ${customer.id}`);
    const subsResult = await paddleGet(`/subscriptions?customer_id=${customer.id}&status=active`);

    if (!subsResult.ok) {
      console.error(`[sync] Failed to list subs for ${customer.id}: ${subsResult.status}`);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subs = (subsResult.data ?? []) as Array<Record<string, any>>;
    console.log(`[sync] Found ${subs.length} subscription(s) for ${customer.id}`);

    const found = subs.find((s) => s.status === "active");
    if (found) {
      activeSub = found;
      break;
    }
  }

  if (!activeSub) {
    console.log(`[sync] No active subscriptions found for ${email}`);
    return NextResponse.json({ ok: false, reason: "not_found" });
  }

  console.log(`[sync] Found active sub: ${activeSub.id}, fetching full details...`);

  // ── Fetch full subscription details (list may omit items/custom_data) ──
  const subDetail = await paddleGet(`/subscriptions/${activeSub.id}`);
  if (subDetail.ok && subDetail.data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeSub = subDetail.data as Record<string, any>;
  }

  // ── Resolve plan — prefer price ID over custom_data ─────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = activeSub.items as Array<Record<string, any>> | undefined;
  const priceId =
    items?.[0]?.price?.id           // nested price object
    ?? items?.[0]?.price            // price might be a string ID
    ?? null;

  console.log(`[sync] Price ID: ${priceId}, custom_data:`, activeSub.custom_data);

  // Trust price ID first (custom_data can be wrong), then fall back to custom_data
  let plan: SubscriptionTier | null =
    (priceId ? tierFromPriceId(String(priceId)) : null)
    ?? (activeSub.custom_data?.plan as SubscriptionTier) ?? null;

  // Validate plan is a known tier
  if (plan && !["free", "moonlight", "solar", "cosmic"].includes(plan)) {
    console.error(`[sync] Unknown plan value: ${plan}`);
    plan = null;
  }

  if (!plan) {
    console.error(`[sync] Could not resolve plan from subscription ${activeSub.id}`);
    return NextResponse.json({ ok: false, reason: "unknown_plan" }, { status: 500 });
  }

  console.log(`[sync] Resolved plan: ${plan}`);

  // ── Sync to local DB (same logic as webhook handler) ────────────────────
  const tokens = getMonthlyTokens(plan);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const billingPeriod = activeSub.current_billing_period as Record<string, string> | undefined;
  const expiresAt = billingPeriod?.ends_at ?? null;

  // Upsert subscription record
  // Note: paddle_subscription_id omitted — column may not exist in production yet
  const { error: subErr } = await db.from("subscriptions").upsert({
    user_id: user.id,
    plan,
    status: "active",
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

  console.log(`[sync] ✓ Restored subscription for user ${user.id}: plan=${plan}, paddle_sub=${activeSub.id}`);

  return NextResponse.json({ ok: true, plan, status: "active" });
}
