/**
 * POST /api/subscription/cancel
 *
 * Cancels the current user's Paddle subscription at the end of the billing period.
 * Returns { ok: true, effective_from: string } on success.
 */

import { NextResponse }                   from "next/server";
import { cookies }                        from "next/headers";
import { createServerClient }             from "@supabase/ssr";
import { createAdminClient }              from "@/lib/supabase/admin";
import type { Database }                  from "@/types/database";

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

  // ── Find Paddle subscription ──────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;

  const { data: sub } = await db
    .from("subscriptions")
    .select("paddle_subscription_id, status, expires_at")
    .eq("user_id", user.id)
    .single();

  if (!sub?.paddle_subscription_id) {
    return NextResponse.json(
      { error: "No active Paddle subscription found" },
      { status: 404 },
    );
  }

  if (sub.status === "cancelled") {
    return NextResponse.json(
      { error: "Subscription is already cancelled", expires_at: sub.expires_at },
      { status: 409 },
    );
  }

  // ── Cancel via Paddle API ─────────────────────────────────────────────────
  const paddleApiKey = process.env.PADDLE_API_KEY;
  if (!paddleApiKey) {
    console.error("[cancel] PADDLE_API_KEY not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

  const res = await fetch(
    `${paddleEnv}/subscriptions/${sub.paddle_subscription_id}/cancel`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
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
    ?? sub.expires_at;

  return NextResponse.json({ ok: true, effective_from: effectiveFrom });
}
