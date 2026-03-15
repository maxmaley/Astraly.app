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

    const { data: userData } = await db
      .from("users")
      .select("email")
      .eq("id", user.id)
      .single();

    const email = userData?.email ?? user.email;
    if (!email) {
      return NextResponse.json({ error: "No email found for user" }, { status: 400 });
    }

    // Search Paddle customers by email
    const custRes = await fetch(
      `${paddleBase()}/customers?email=${encodeURIComponent(email)}`,
      { headers: paddleHeaders() },
    );

    if (!custRes.ok) {
      console.error("[cancel] Paddle customers lookup failed:", custRes.status);
      return NextResponse.json({ error: "Failed to look up subscription" }, { status: 502 });
    }

    const custBody = await custRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customers = (custBody.data ?? []) as Array<Record<string, any>>;

    // Find active or canceled subscription across all matching customers
    for (const customer of customers) {
      const subsRes = await fetch(
        `${paddleBase()}/subscriptions?customer_id=${customer.id}`,
        { headers: paddleHeaders() },
      );

      if (!subsRes.ok) continue;

      const subsBody = await subsRes.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subs = (subsBody.data ?? []) as Array<Record<string, any>>;
      // Prefer active, but also accept past_due
      const found = subs.find((s) => s.status === "active" || s.status === "past_due");

      if (found) {
        paddleSubscriptionId = found.id as string;
        console.log(`[cancel] Found Paddle subscription via API: ${paddleSubscriptionId}`);
        break;
      }

      // Check if already canceled in Paddle
      const alreadyCanceled = subs.find((s) => s.status === "canceled");
      if (alreadyCanceled) {
        const expiresAt =
          alreadyCanceled.scheduled_change?.effective_at ??
          alreadyCanceled.current_billing_period?.ends_at ??
          new Date().toISOString();

        // Sync cancelled state to local DB
        await syncCancelledToDb(db, user.id, alreadyCanceled.id as string, expiresAt);

        return NextResponse.json(
          { ok: true, effective_from: expiresAt, already_cancelled_in_paddle: true },
        );
      }
    }

    if (!paddleSubscriptionId) {
      return NextResponse.json(
        { error: "No active Paddle subscription found" },
        { status: 404 },
      );
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

    // If Paddle says subscription is already canceled, sync that state
    if (res.status === 409 || res.status === 400) {
      // Try to fetch subscription status to sync
      const subRes = await fetch(
        `${paddleBase()}/subscriptions/${paddleSubscriptionId}`,
        { headers: paddleHeaders() },
      );

      if (subRes.ok) {
        const subBody = await subRes.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subData = subBody.data as Record<string, any>;
        if (subData?.status === "canceled") {
          const expiresAt =
            subData.scheduled_change?.effective_at ??
            subData.current_billing_period?.ends_at ??
            new Date().toISOString();

          await syncCancelledToDb(db, user.id, paddleSubscriptionId, expiresAt);

          return NextResponse.json({ ok: true, effective_from: expiresAt, synced_from_paddle: true });
        }
      }
    }

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
