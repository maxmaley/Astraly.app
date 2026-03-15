/**
 * Paddle webhook handler.
 *
 * Verifies webhook signature and handles subscription lifecycle events:
 *   - subscription.created    → initial record in DB
 *   - subscription.activated  → upgrade user tier, reset tokens, send email
 *   - subscription.updated    → plan change (up/downgrade)
 *   - subscription.canceled   → mark canceled, send email
 *   - subscription.past_due   → mark past_due status
 *   - transaction.completed   → update billing period
 *   - transaction.payment_failed → send payment failed email
 */

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient }              from "@/lib/supabase/admin";
import { sendEmail }                      from "@/lib/email";
import { PLANS, tierFromPriceId, getMonthlyTokens } from "@/lib/plans";
import SubscriptionActivated              from "@/emails/SubscriptionActivated";
import SubscriptionCanceled               from "@/emails/SubscriptionCanceled";
import PaymentFailed                      from "@/emails/PaymentFailed";
import type { SubscriptionTier }          from "@/types/database";

// Paddle Node SDK for webhook signature verification
import { Webhooks } from "@paddle/paddle-node-sdk";

type Locale = "ru" | "uk" | "en";

const PLAN_NAMES: Record<string, string> = {
  moonlight: "Moonlight",
  solar:     "Solar Oracle",
  cosmic:    "Cosmic Mind",
};

// ── Signature verification ──────────────────────────────────────────────────

const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET ?? "";

async function verifyWebhook(request: NextRequest): Promise<Record<string, unknown> | null> {
  const rawBody = await request.text();

  // If no secret configured, parse without verification (dev only)
  if (!webhookSecret) {
    console.warn("[paddle-webhook] No PADDLE_WEBHOOK_SECRET — skipping signature verification");
    return JSON.parse(rawBody);
  }

  const signature = request.headers.get("paddle-signature");
  if (!signature) return null;

  try {
    const webhooks = new Webhooks();
    const verified = await webhooks.unmarshal(rawBody, webhookSecret, signature);
    if (!verified) return null;
    return JSON.parse(rawBody);
  } catch (err) {
    console.error("[paddle-webhook] Signature verification failed:", err);
    return null;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function getUser(db: ReturnType<typeof createAdminClient>, userId: string) {
  const { data } = await db
    .from("users")
    .select("email, lang, subscription_tier")
    .eq("id", userId)
    .single();
  return data as { email: string; lang: string; subscription_tier: SubscriptionTier } | null;
}

/** Extract user_id and plan from Paddle event custom_data or items */
function extractMeta(data: Record<string, unknown>): {
  userId: string | null;
  plan: SubscriptionTier | null;
} {
  // custom_data passed at checkout
  const customData = data.custom_data as Record<string, string> | undefined;
  const userId = customData?.user_id ?? null;

  // Plan can be explicit in custom_data or resolved from price ID
  let plan: SubscriptionTier | null = (customData?.plan as SubscriptionTier) ?? null;

  if (!plan) {
    // Try resolving from items/price
    const items = data.items as Array<{ price?: { id?: string } }> | undefined;
    const priceId = items?.[0]?.price?.id;
    if (priceId) plan = tierFromPriceId(priceId) ?? null;
  }

  return { userId, plan };
}

// ── Handler ─────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const event = await verifyWebhook(request);
    if (!event) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = event.event_type as string;
    const data = event.data as Record<string, unknown>;

    console.log(`[paddle-webhook] ${eventType}`, data.id);

    const db = createAdminClient();
    const { userId, plan } = extractMeta(data);

    switch (eventType) {
      // ── New subscription created (first checkout) ──────────────────────
      case "subscription.created": {
        if (!userId || !plan) break;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any).upsert({
          user_id: userId,
          plan,
          status: (data.status as string) ?? "active",
          paddle_subscription_id: data.id as string,
          started_at: new Date().toISOString(),
          expires_at: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
        }, { onConflict: "user_id" });

        break;
      }

      // ── Subscription activated (payment confirmed) ─────────────────────
      case "subscription.activated": {
        if (!userId || !plan) break;

        const tokens = getMonthlyTokens(plan);

        // Upgrade user tier + reset tokens
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("users") as any).update({
          subscription_tier: plan,
          tokens_left: tokens,
          tokens_reset_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }).eq("id", userId);

        // Upsert subscription record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any).upsert({
          user_id: userId,
          plan,
          status: "active",
          paddle_subscription_id: data.id as string,
          started_at: new Date().toISOString(),
          expires_at: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
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

      // ── Subscription updated (plan change, billing update) ─────────────
      case "subscription.updated": {
        if (!userId) break;

        const newPlan = plan;
        const status = data.status as string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const update: Record<string, unknown> = {
          status,
          expires_at: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
        };
        if (newPlan) update.plan = newPlan;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any)
          .update(update)
          .eq("user_id", userId);

        // If plan changed, update user tier + tokens
        if (newPlan) {
          const tokens = getMonthlyTokens(newPlan);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (db.from("users") as any).update({
            subscription_tier: newPlan,
            tokens_left: tokens,
            tokens_reset_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          }).eq("id", userId);
        }
        break;
      }

      // ── Subscription canceled ──────────────────────────────────────────
      case "subscription.canceled": {
        if (!userId) break;

        const expiresAt =
          (data.scheduled_change as Record<string, string>)?.effective_at ??
          (data.current_billing_period as Record<string, string>)?.ends_at ??
          new Date().toISOString();

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

      // ── Subscription past due (payment retry pending) ──────────────────
      case "subscription.past_due": {
        if (!userId) break;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any)
          .update({ status: "past_due" })
          .eq("user_id", userId);

        break;
      }

      // ── Transaction completed (renewal / initial) ──────────────────────
      case "transaction.completed": {
        if (!userId || !plan) break;

        // Refresh tokens on successful renewal
        const tokens = getMonthlyTokens(plan);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("users") as any).update({
          tokens_left: tokens,
          tokens_reset_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }).eq("id", userId);

        // Update subscription expiry
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db.from("subscriptions") as any)
          .update({
            status: "active",
            expires_at: (data.current_billing_period as Record<string, string>)?.ends_at ?? null,
          })
          .eq("user_id", userId);

        break;
      }

      // ── Payment failed ─────────────────────────────────────────────────
      case "transaction.payment_failed": {
        if (!userId) break;

        const user = await getUser(db, userId);
        if (user) {
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
        console.log(`[paddle-webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paddle-webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
