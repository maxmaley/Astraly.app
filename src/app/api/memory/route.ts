import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_MEMORY_CHARS = 6000;

// GET — return current memory
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("users")
    .select("memory")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ memory: data?.memory ?? "" });
}

// PUT — update memory (from settings editor)
export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const memory = typeof body.memory === "string"
    ? body.memory.slice(0, MAX_MEMORY_CHARS)
    : "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("users")
    .update({ memory })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}

// DELETE — clear memory
export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("users")
    .update({ memory: "" })
    .eq("id", user.id);

  return NextResponse.json({ success: true });
}
