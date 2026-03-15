import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/lib/plans";
import type { SubscriptionTier } from "@/types/database";

const MAX_MEMORY_CHARS = 6000;

/** Check auth + memory feature access. Returns user id or error response. */
async function authorize() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("users")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!canAccess(data?.subscription_tier as SubscriptionTier, "memory")) {
    return { error: NextResponse.json({ error: "Feature not available on your plan" }, { status: 403 }) };
  }

  return { userId: user.id, supabase };
}

// GET — return current memory
export async function GET() {
  const auth = await authorize();
  if ("error" in auth && auth.error) return auth.error;
  const { userId, supabase } = auth as { userId: string; supabase: Awaited<ReturnType<typeof createClient>> };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("users")
    .select("memory")
    .eq("id", userId)
    .single();

  return NextResponse.json({ memory: data?.memory ?? "" });
}

// PUT — update memory (from settings editor)
export async function PUT(request: Request) {
  const auth = await authorize();
  if ("error" in auth && auth.error) return auth.error;
  const { userId, supabase } = auth as { userId: string; supabase: Awaited<ReturnType<typeof createClient>> };

  const body = await request.json();
  const memory = typeof body.memory === "string"
    ? body.memory.slice(0, MAX_MEMORY_CHARS)
    : "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("users")
    .update({ memory })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}

// DELETE — clear memory
export async function DELETE() {
  const auth = await authorize();
  if ("error" in auth && auth.error) return auth.error;
  const { userId, supabase } = auth as { userId: string; supabase: Awaited<ReturnType<typeof createClient>> };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("users")
    .update({ memory: "" })
    .eq("id", userId);

  return NextResponse.json({ success: true });
}
