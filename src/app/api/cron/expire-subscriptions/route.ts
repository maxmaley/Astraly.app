/**
 * Cron job: downgrade expired subscriptions.
 *
 * Runs daily. Finds subscriptions where:
 *   - status = 'cancelled' (or 'active' for admin-set expiry)
 *   - expires_at < NOW()
 *
 * For each: resets user to free tier, marks subscription as expired.
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient }              from "@/lib/supabase/admin";
import { PLANS }                          from "@/lib/plans";

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron sends this header automatically)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const now = new Date().toISOString();

  // Find expired subscriptions (cancelled or active with past expiry)
  const { data: expired, error } = await db
    .from("subscriptions")
    .select("user_id, plan, status")
    .in("status", ["cancelled", "active", "past_due"])
    .lt("expires_at", now);

  if (error) {
    console.error("[cron/expire-subscriptions] Query error:", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ downgraded: 0 });
  }

  let downgraded = 0;

  for (const sub of expired) {
    const userId = sub.user_id as string;

    // Skip test users — they have permanent access
    const { data: usr } = await db
      .from("users")
      .select("is_test")
      .eq("id", userId)
      .single();
    if (usr?.is_test) continue;

    // Downgrade user to free
    await db.from("users").update({
      subscription_tier: "free",
      tokens_left: PLANS.free.monthlyTokens,
    }).eq("id", userId);

    // Mark subscription as expired
    await db.from("subscriptions")
      .update({ status: "expired" })
      .eq("user_id", userId);

    downgraded++;
    console.log(`[cron/expire-subscriptions] Downgraded user ${userId} from ${sub.plan}`);
  }

  return NextResponse.json({ downgraded });
}
