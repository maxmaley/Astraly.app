/**
 * POST /api/email/welcome
 *
 * Sends a welcome email to a newly registered user.
 * Called from the auth callback after first sign-in.
 * Idempotent — checks if user was created within the last 5 minutes.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail }    from "@/lib/email";
import Welcome          from "@/emails/Welcome";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("users")
      .select("name, email, lang, created_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Only send welcome email if user was created within the last 5 minutes
    const createdAt = new Date(profile.created_at).getTime();
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    if (createdAt < fiveMinAgo) {
      return NextResponse.json({ skipped: true });
    }

    await sendEmail({
      to: profile.email,
      subject: "Welcome to Astraly ✦",
      react: Welcome({
        name: profile.name ?? "",
        locale: (profile.lang as "ru" | "uk" | "en") ?? "ru",
      }),
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[email/welcome] Error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
