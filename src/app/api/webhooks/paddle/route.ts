/**
 * Paddle webhook handler.
 *
 * Handles subscription lifecycle events:
 *   - subscription.activated  → upgrade user tier, send activation email
 *   - subscription.canceled   → mark subscription canceled, send email
 *   - transaction.payment_failed → send payment failed email
 *
 * Paddle integration details (variant IDs, signature verification)
 * will be wired once Paddle dashboard is configured.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient }              from "@/lib/supabase/admin";
import { sendEmail }                      from "@/lib/email";
import SubscriptionActivated              from "@/emails/SubscriptionActivated";
import SubscriptionCanceled               from "@/emails/SubscriptionCanceled";
import PaymentFailed                      from "@/emails/PaymentFailed";
import type { SubscriptionTier }          from "@/types/database";

// TODO: Replace with Paddle SDK signature verification
// import { verifyPaddleWebhook } from "@/lib/paddle";

type Locale = "ru" | "uk" | "en";

interface PaddleEvent {
  event_type: string;
  data: {
    id: string;
    customer_id?: string;
    custom_data?: {
      user_id?: string;
      plan?: SubscriptionTier;
    };
    status?: string;
    current_billing_period?: {
      ends_at?: string;
    };
    scheduled_change?: {
      action?: string;
      effective_at?: string;
    };
  };
}

const PLAN_NAMES: Record<string, string> = {
  moonlight: "Moonlight",
  solar: "Solar Oracle",
  cosmic: "Cosmic Mind",
};

async function getUser(db: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await db
    .from("users")
    .select("email, lang, subscription_tier")
    .eq("id", userId)
    .single();
  return data as { email: string; lang: string; subscription_tier: SubscriptionTier } | null;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Verify Paddle webhook signature
    // const signature = request.headers.get("paddle-signature");
    // if (!verifyPaddleWebhook(body, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const event = (await request.json()) as PaddleEvent;
    const { event_type, data } = event;

    console.log(`[paddle-webhook] ${event_type}`, data.id);

    const db = createAdminClient();

    switch (event_type) {
      case "subscription.activated": {
        const userId = data.custom_data?.user_id;
        const plan   = data.custom_data?.plan;
        if (!userId || !plan) break;

        // Upgrade user tier
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("users") as any).update({ subscription_tier: plan }).eq("id", userId);

        // Upsert subscription record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any).upsert({
          user_id: userId,
          plan,
          status: "active",
          paddle_subscription_id: data.id,
          started_at: new Date().toISOString(),
          expires_at: data.current_billing_period?.ends_at ?? null,
        }, { onConflict: "user_id" });

        // Send activation email
        const user = await getUser(db, userId);
        if (user) {
          await sendEmail({
            to: user.email,
            subject: "Subscription activated — Astraly ✦",
            react: SubscriptionActivated({
              planName: PLAN_NAMES[plan] ?? plan,
              locale: (user.lang as Locale) ?? "ru",
            }),
          });
        }
        break;
      }

      case "subscription.canceled": {
        const userId = data.custom_data?.user_id;
        if (!userId) break;

        const expiresAt = data.scheduled_change?.effective_at
          ?? data.current_billing_period?.ends_at
          ?? new Date().toISOString();

        // Mark subscription as canceled (access until expires_at)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any)
          .update({ status: "cancelled", expires_at: expiresAt })
          .eq("user_id", userId);

        // Send cancellation email
        const user = await getUser(db, userId);
        if (user) {
          const locale = (user.lang as Locale) ?? "ru";
          const formattedDate = new Date(expiresAt).toLocaleDateString(
            locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
            { day: "numeric", month: "long", year: "numeric" },
          );
          await sendEmail({
            to: user.email,
            subject: "Subscription canceled — Astraly",
            react: SubscriptionCanceled({
              planName: PLAN_NAMES[user.subscription_tier] ?? user.subscription_tier,
              expiresAt: formattedDate,
              locale,
            }),
          });
        }
        break;
      }

      case "transaction.payment_failed": {
        const userId = data.custom_data?.user_id;
        if (!userId) break;

        const user = await getUser(db, userId);
        if (user) {
          // TODO: Generate Paddle update payment URL
          await sendEmail({
            to: user.email,
            subject: "Payment issue — Astraly",
            react: PaymentFailed({
              locale: (user.lang as Locale) ?? "ru",
            }),
          });
        }
        break;
      }

      default:
        console.log(`[paddle-webhook] Unhandled event: ${event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paddle-webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
