/**
 * GET /api/subscription/billing
 *
 * Fetches the current user's Paddle subscription details including
 * management URLs (update payment method) and next billing date.
 */

import { NextResponse }       from "next/server";
import { cookies }            from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient }  from "@/lib/supabase/admin";
import type { Database }      from "@/types/database";

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
      { error: "No active subscription found" },
      { status: 404 },
    );
  }

  // ── Fetch from Paddle API ─────────────────────────────────────────────────
  const paddleApiKey = process.env.PADDLE_API_KEY;
  if (!paddleApiKey) {
    console.error("[billing] PADDLE_API_KEY not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
    ? "https://api.paddle.com"
    : "https://sandbox-api.paddle.com";

  const res = await fetch(
    `${paddleEnv}/subscriptions/${sub.paddle_subscription_id}`,
    {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("[billing] Paddle API error:", res.status, body);
    return NextResponse.json(
      { error: "Failed to fetch subscription details" },
      { status: 502 },
    );
  }

  const paddle = await res.json();
  const data = paddle.data;

  return NextResponse.json({
    update_payment_method_url: data?.management_urls?.update_payment_method ?? null,
    next_billed_at:            data?.next_billed_at ?? data?.current_billing_period?.ends_at ?? sub.expires_at,
    billing_cycle_interval:    data?.billing_cycle?.interval ?? null,
    status:                    sub.status,
  });
}
