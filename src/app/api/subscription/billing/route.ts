/**
 * GET /api/subscription/billing
 *
 * Fetches the current user's Paddle subscription details including
 * management URLs (update payment method) and next billing date.
 * Looks up the subscription via Paddle API by email (no local paddle_subscription_id needed).
 */

import { NextResponse }       from "next/server";
import { cookies }            from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient }  from "@/lib/supabase/admin";
import type { Database }      from "@/types/database";

function paddleBase(): string {
  return process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";
}

function paddleHeaders(): HeadersInit {
  return { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` };
}

export async function GET() {
  // ── Auth ──────────────────────────────────────────────────────────────────
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
    console.error("[billing] PADDLE_API_KEY not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // ── Get user email ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: userData } = await db
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  const email = userData?.email ?? user.email;
  if (!email) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  // ── Find active Paddle subscription by email ────────────────────────────
  const custRes = await fetch(
    `${paddleBase()}/customers?email=${encodeURIComponent(email)}`,
    { headers: paddleHeaders() },
  );
  if (!custRes.ok) {
    return NextResponse.json({ error: "Paddle API error" }, { status: 502 });
  }
  const customers = ((await custRes.json()).data ?? []) as Array<{ id: string }>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let activeSub: Record<string, any> | null = null;
  for (const c of customers) {
    const subsRes = await fetch(
      `${paddleBase()}/subscriptions?customer_id=${c.id}&status=active`,
      { headers: paddleHeaders() },
    );
    if (!subsRes.ok) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subs = ((await subsRes.json()).data ?? []) as Array<Record<string, any>>;
    const found = subs.find((s) => s.status === "active");
    if (found) { activeSub = found; break; }
  }

  if (!activeSub) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
  }

  // ── Fetch full subscription details ─────────────────────────────────────
  const detailRes = await fetch(
    `${paddleBase()}/subscriptions/${activeSub.id}`,
    { headers: paddleHeaders() },
  );

  if (!detailRes.ok) {
    const body = await detailRes.text();
    console.error("[billing] Paddle API error:", detailRes.status, body);
    return NextResponse.json({ error: "Failed to fetch subscription details" }, { status: 502 });
  }

  const data = (await detailRes.json()).data;

  // ── Get local subscription status ───────────────────────────────────────
  const { data: sub } = await db
    .from("subscriptions")
    .select("status, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // Detect scheduled cancellation from Paddle (may not be in local DB due to missed webhooks)
  const scheduledChange = data?.scheduled_change as { action?: string; effective_at?: string } | null;
  const isScheduledCancel = scheduledChange?.action === "cancel";

  // If Paddle shows scheduled cancellation but local DB doesn't, sync it
  if (isScheduledCancel && sub?.status !== "cancelled") {
    const expiresAt = scheduledChange?.effective_at
      ?? data?.current_billing_period?.ends_at
      ?? null;
    if (expiresAt) {
      const existing = await db
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing?.data) {
        await db.from("subscriptions").update({
          status: "cancelled",
          expires_at: expiresAt,
          paddle_subscription_id: activeSub.id,
        }).eq("id", existing.data.id);
      } else {
        await db.from("subscriptions").insert({
          user_id: user.id,
          status: "cancelled",
          expires_at: expiresAt,
          paddle_subscription_id: activeSub.id,
          started_at: new Date().toISOString(),
        });
      }
      console.log(`[billing] Synced scheduled cancellation to DB for user ${user.id}`);
    }
  }

  return NextResponse.json({
    update_payment_method_url: data?.management_urls?.update_payment_method ?? null,
    next_billed_at:            data?.next_billed_at ?? data?.current_billing_period?.ends_at ?? sub?.expires_at,
    billing_cycle_interval:    data?.billing_cycle?.interval ?? null,
    status:                    isScheduledCancel ? "cancelled" : (sub?.status ?? "active"),
    scheduled_cancel_at:       isScheduledCancel ? (scheduledChange?.effective_at ?? null) : null,
  });
}
