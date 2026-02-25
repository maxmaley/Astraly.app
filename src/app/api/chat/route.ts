import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── POST: stream AI response ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { message, chat_id, locale = "ru" } = body as {
    message: string;
    chat_id?: string;
    locale?: string;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const chatId = chat_id || crypto.randomUUID();

  // ── Load natal chart for context ───────────────────────────────────────────
  const { data: charts } = await (supabase as any)
    .from("natal_charts")
    .select("name, birth_date, birth_city, planets_json, ascendant")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const chart = charts?.[0];

  const langMap: Record<string, string> = { ru: "Russian", uk: "Ukrainian", en: "English" };

  let chartContext = "";
  if (chart) {
    const planets = chart.planets_json as Record<
      string,
      { sign: string; house: number; retrograde: boolean }
    >;
    const asc = chart.ascendant as { sign: string; degree: number };
    chartContext = `\nThe user's natal chart (${chart.name}, born ${chart.birth_date} in ${chart.birth_city}):
- Ascendant: ${asc.sign} ${asc.degree.toFixed(1)}°
${Object.entries(planets)
  .map(([name, p]) => `- ${name}: ${p.sign} (House ${p.house})${p.retrograde ? " ℞" : ""}`)
  .join("\n")}\n`;
  }

  const systemPrompt = `You are Astraly — a warm, wise, and deeply insightful AI astrologer. You blend classical astrological knowledge with modern psychological insight to help users understand themselves and navigate life's journey through the lens of the cosmos.${chartContext ? chartContext : "\nThe user hasn't built their natal chart yet — gently encourage them to do so for personalized readings.\n"}
IMPORTANT INSTRUCTIONS:
- Always respond in ${langMap[locale] || "Russian"}
- Be warm, mystical, and poetic — but also grounded and practical
- Reference the user's specific chart placements when relevant (don't just recite them, weave them into the insight)
- Keep responses 150–350 words unless the topic genuinely requires more
- Use gentle markdown: **bold** for key concepts, bullet points (- item) for lists when helpful
- End with a warm closing thought or a thoughtful follow-up question
- Never make absolute predictions — frame everything as potential, tendency, and invitation
- Address the user as "ты" (informal "you") in Russian/Ukrainian`;

  // ── Load recent history for context ───────────────────────────────────────
  const { data: recentMessages } = await (supabase as any)
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", user.id)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(12);

  const historyMessages = ((recentMessages || []) as { role: string; content: string }[])
    .reverse()
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  historyMessages.push({ role: "user", content: message });

  // ── Save user message ──────────────────────────────────────────────────────
  await (supabase as any).from("chat_messages").insert({
    user_id: user.id,
    chat_id: chatId,
    role: "user",
    content: message,
    tokens_used: 0,
  });

  // ── Stream ─────────────────────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let fullContent = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Send chat_id first so client can update the URL
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "chat_id", value: chatId })}\n\n`
          )
        );

        const stream = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: systemPrompt,
          messages: historyMessages,
          stream: true,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullContent += text;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "delta", value: text })}\n\n`
              )
            );
          }
        }

        // Save assistant message
        await (supabase as any).from("chat_messages").insert({
          user_id: user.id,
          chat_id: chatId,
          role: "assistant",
          content: fullContent,
          tokens_used: 0,
        });

        // Upsert chat summary (use first user message as title preview)
        const summaryText = message.substring(0, 200);
        const { data: existing } = await (supabase as any)
          .from("chat_summaries")
          .select("id, messages_count")
          .eq("chat_id", chatId)
          .maybeSingle();

        if (existing) {
          await (supabase as any)
            .from("chat_summaries")
            .update({ messages_count: (existing.messages_count || 0) + 2 })
            .eq("chat_id", chatId);
        } else {
          await (supabase as any).from("chat_summaries").insert({
            user_id: user.id,
            chat_id: chatId,
            summary: summaryText,
            messages_count: 2,
          });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      } catch (err) {
        console.error("Chat stream error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "AI error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ── GET: fetch messages ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = request.nextUrl.searchParams.get("chat_id");
  if (!chatId) {
    return NextResponse.json({ error: "chat_id required" }, { status: 400 });
  }

  const { data: messages } = await (supabase as any)
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("user_id", user.id)
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(100);

  return NextResponse.json({ messages: messages || [] });
}

// ── DELETE: remove chat ───────────────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = request.nextUrl.searchParams.get("chat_id");
  if (!chatId) {
    return NextResponse.json({ error: "chat_id required" }, { status: 400 });
  }

  await (supabase as any)
    .from("chat_messages")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", user.id);
  await (supabase as any)
    .from("chat_summaries")
    .delete()
    .eq("chat_id", chatId)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
