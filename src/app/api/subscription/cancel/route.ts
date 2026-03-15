/**
 * POST /api/subscription/cancel
 *
 * Cancels the current user's Paddle subscription at the end of the billing period.
 * If no local subscription record exists, looks up the subscription via Paddle API.
 * After successful cancellation, updates local DB (doesn't rely solely on webhook).
 * Returns { ok: true, effective_from: string } on success.
 */

import { NextResponse }                   from "next/server";
import { cookies }                        from "next/headers";
import { createServerClient }             from "@supabase/ssr";
import { createAdminClient }              from "@/lib/supabase/admin";
import type { Database }                  from "@/types/database";

// ── Paddle API helpers ───────────────────────────────────────────────────────

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

export async function POST() {
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
    console.error("[cancel] PADDLE_API_KEY not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  // ── Find Paddle subscription ID ────────────────────────────────────────────
  const { data: sub } = await db
    .from("subscriptions")
    .select("paddle_subscription_id, status, expires_at")
    .eq("user_id", user.id)
    .single();

  if (sub?.status === "cancelled") {
    return NextResponse.json(
      { error: "Subscription is already cancelled", expires_at: sub.expires_at },
      { status: 409 },
    );
  }

  let paddleSubscriptionId = sub?.paddle_subscription_id as string | null;

  // If no local record, look up subscription via Paddle API by email
  if (!paddleSubscriptionId) {
    console.log(`[cancel] No local subscription record for user ${user.id}, searching Paddle API...`);

    const foundSub = await findPaddleSubscription(db, user);
    if (!foundSub) {
      return NextResponse.json(
        { error: "No active Paddle subscription found" },
        { status: 404 },
      );
    }

    // If already fully canceled in Paddle, sync and return
    if (foundSub.status === "canceled") {
      const expiresAt =
        foundSub.scheduled_change?.effective_at ??
        foundSub.current_billing_period?.ends_at ??
        new Date().toISOString();
      await syncCancelledToDb(db, user.id, foundSub.id, expiresAt);
      return NextResponse.json({ ok: true, effective_from: expiresAt });
    }

    // If already scheduled for cancellation, just sync and return
    if (foundSub.scheduled_change?.action === "cancel") {
      const expiresAt = foundSub.scheduled_change.effective_at
        ?? foundSub.current_billing_period?.ends_at
        ?? new Date().toISOString();
      console.log(`[cancel] Subscription ${foundSub.id} already scheduled for cancellation at ${expiresAt}`);
      await syncCancelledToDb(db, user.id, foundSub.id, expiresAt);
      return NextResponse.json({ ok: true, effective_from: expiresAt });
    }

    paddleSubscriptionId = foundSub.id as string;
  }

  if (!paddleSubscriptionId) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  // ── Check current Paddle state before cancelling ──────────────────────────
  // The subscription may have been cancelled via Paddle billing portal
  // while our local DB still shows "active" (due to missed webhooks).
  const checkRes = await fetch(
    `${paddleBase()}/subscriptions/${paddleSubscriptionId}`,
    { headers: paddleHeaders() },
  );

  if (checkRes.ok) {
    const checkBody = await checkRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkData = checkBody.data as Record<string, any>;

    // Already fully canceled
    if (checkData?.status === "canceled") {
      const expiresAt =
        checkData.current_billing_period?.ends_at ??
        new Date().toISOString();
      await syncCancelledToDb(db, user.id, paddleSubscriptionId, expiresAt);
      return NextResponse.json({ ok: true, effective_from: expiresAt });
    }

    // Already scheduled for cancellation
    if (checkData?.scheduled_change?.action === "cancel") {
      const expiresAt = checkData.scheduled_change.effective_at
        ?? checkData.current_billing_period?.ends_at
        ?? new Date().toISOString();
      console.log(`[cancel] Subscription ${paddleSubscriptionId} already scheduled for cancellation at ${expiresAt}`);
      await syncCancelledToDb(db, user.id, paddleSubscriptionId, expiresAt);
      return NextResponse.json({ ok: true, effective_from: expiresAt });
    }
  }

  // ── Cancel via Paddle API ─────────────────────────────────────────────────
  const res = await fetch(
    `${paddleBase()}/subscriptions/${paddleSubscriptionId}/cancel`,
    {
      method: "POST",
      headers: paddleHeaders(),
      body: JSON.stringify({
        effective_from: "next_billing_period",
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("[cancel] Paddle API error:", res.status, body);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 502 },
    );
  }

  const paddle = await res.json();
  const effectiveFrom = paddle.data?.scheduled_change?.effective_at
    ?? paddle.data?.current_billing_period?.ends_at
    ?? sub?.expires_at
    ?? new Date().toISOString();

  // ── Update local DB ─────────────────────────────────────────────────────
  await syncCancelledToDb(db, user.id, paddleSubscriptionId, effectiveFrom);

  return NextResponse.json({ ok: true, effective_from: effectiveFrom });
}

// ── Helper: find subscription via Paddle API by email ─────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function findPaddleSubscription(db: any, user: { id: string; email?: string }): Promise<Record<string, any> | null> {
  const { data: userData } = await db
    .from("users")
    .select("email")
    .eq("id", user.id)
    .single();

  const email = userData?.email ?? user.email;
  if (!email) return null;

  const custRes = await fetch(
    `${paddleBase()}/customers?email=${encodeURIComponent(email)}`,
    { headers: paddleHeaders() },
  );
  if (!custRes.ok) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customers = ((await custRes.json()).data ?? []) as Array<Record<string, any>>;

  for (const customer of customers) {
    const subsRes = await fetch(
      `${paddleBase()}/subscriptions?customer_id=${customer.id}`,
      { headers: paddleHeaders() },
    );
    if (!subsRes.ok) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subs = ((await subsRes.json()).data ?? []) as Array<Record<string, any>>;

    // Prefer active/past_due, then canceled
    const active = subs.find((s) => s.status === "active" || s.status === "past_due");
    if (active) {
      // Fetch full details (list endpoint may omit scheduled_change)
      const detailRes = await fetch(
        `${paddleBase()}/subscriptions/${active.id}`,
        { headers: paddleHeaders() },
      );
      if (detailRes.ok) {
        return (await detailRes.json()).data;
      }
      return active;
    }

    const canceled = subs.find((s) => s.status === "canceled");
    if (canceled) return canceled;
  }

  return null;
}

// ── Helper: sync cancelled state to local DB ──────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncCancelledToDb(db: any, userId: string, paddleSubId: string, expiresAt: string) {
  // Check if subscription record exists
  const { data: existingRow } = await db
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingRow) {
    await db.from("subscriptions").update({
      status: "cancelled",
      expires_at: expiresAt,
      paddle_subscription_id: paddleSubId,
    }).eq("id", existingRow.id);
  } else {
    // Create a record so the UI knows it's cancelled
    await db.from("subscriptions").insert({
      user_id: userId,
      status: "cancelled",
      expires_at: expiresAt,
      paddle_subscription_id: paddleSubId,
      started_at: new Date().toISOString(),
    });
  }

  console.log(`[cancel] Synced cancelled state to DB for user ${userId}, expires_at=${expiresAt}`);
}
