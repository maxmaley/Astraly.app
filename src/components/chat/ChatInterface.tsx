"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUsageLevel, PLANS, canAccess } from "@/lib/plans";
import { LimitModal } from "@/components/shared/LimitModal";
import type { SubscriptionTier } from "@/types/database";
import { VoiceInputButton } from "./VoiceInputButton";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface PlanetData {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface ChartRecord {
  id: string;
  name: string;
  relation: string;
  birth_date: string;
  birth_time: string | null;
  birth_city: string;
  planets_json: Record<string, PlanetData>;
  houses_json: Array<{ house: number; sign: string; degree: number }>;
  ascendant: { sign: string; degree: number; mc_sign?: string; mc_degree?: number };
}

// ── Symbols ───────────────────────────────────────────────────────────────────

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀",
  Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅",
  Neptune: "♆", Pluto: "♇",
};

const PLANET_ORDER = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

const RELATION_EMOJI: Record<string, string> = {
  self: "✦", partner: "💑", parent: "👨‍👩‍👧", child: "🧒", friend: "👫", other: "👤",
};

function formatDeg(deg: number) {
  return `${Math.floor(deg)}°${String(Math.floor((deg % 1) * 60)).padStart(2, "0")}′`;
}

// ── NatalChartWidget ──────────────────────────────────────────────────────────

function NatalChartWidget({ chartOverride }: { chartOverride?: ChartRecord | null }) {
  const [chart, setChart] = useState<ChartRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("chat");
  const tS = useTranslations("signs");
  const tP = useTranslations("planets");

  useEffect(() => {
    if (chartOverride !== undefined) {
      setChart(chartOverride);
      return;
    }
    fetch("/api/natal-chart")
      .then((r) => r.json())
      .then((data) => {
        if (data.charts?.length) setChart(data.charts[0]);
      })
      .catch(() => {});
  }, [chartOverride]);

  if (!chart) return null;

  const sun = chart.planets_json?.Sun;
  const moon = chart.planets_json?.Moon;
  const asc = chart.ascendant;
  const planets = chart.planets_json ?? {};

  const sign = (s: string) => { try { return tS(s as Parameters<typeof tS>[0]); } catch { return s; } };
  const planet = (p: string) => { try { return tP(p as Parameters<typeof tP>[0]); } catch { return p; } };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <div className="overflow-hidden rounded-2xl border border-cosmic-500/25 bg-gradient-to-r from-cosmic-500/8 to-nebula-500/8">
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-cosmic-500/5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-cosmic-400 text-sm">✦</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--foreground)]">
                {chart.name} · {t("chartWidget")}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[var(--muted-foreground)]">
                {sun && <>{SIGN_SYMBOLS[sun.sign]} {sign(sun.sign)}</>}
                {" · "}
                {moon && <>{SIGN_SYMBOLS[moon.sign]} {sign(moon.sign)}</>}
                {" · ASC "}
                {asc && <>{SIGN_SYMBOLS[asc.sign]} {sign(asc.sign)}</>}
              </p>
            </div>
          </div>
          <svg
            className={`h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {expanded && (
          <div className="border-t border-cosmic-500/20">
            <div className="px-4 py-2.5 text-[11px] text-[var(--muted-foreground)]">
              {chart.birth_date}{chart.birth_time ? ` · ${chart.birth_time}` : ""} · {chart.birth_city}
            </div>

            <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center border-t border-[var(--border)]/50 bg-[var(--muted)]/20 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="w-5 text-center text-sm text-[var(--muted-foreground)]">⟳</span>
                <span className="text-xs font-semibold text-[var(--foreground)]">ASC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[asc.sign]}</span>
                <span className="text-xs text-[var(--foreground)]">{sign(asc.sign)}</span>
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">1</span>
              <span className="text-right text-[11px] text-[var(--muted-foreground)] tabular-nums">{formatDeg(asc.degree)}</span>
            </div>

            <div className="divide-y divide-[var(--border)]/30">
              {PLANET_ORDER.map((name) => {
                const p = planets[name];
                if (!p) return null;
                return (
                  <div key={name} className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-x-2 items-center px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-center text-sm text-[var(--muted-foreground)]">{PLANET_SYMBOLS[name]}</span>
                      <span className="text-xs font-medium text-[var(--foreground)]">{planet(name)}</span>
                      {p.retrograde && <span className="text-[10px] text-amber-400 font-semibold">℞</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[p.sign]}</span>
                      <span className="text-xs text-[var(--foreground)]">{sign(p.sign)}</span>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">{p.house}</span>
                    <span className="text-right text-[11px] text-[var(--muted-foreground)] tabular-nums">{formatDeg(p.degree)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── People Picker ─────────────────────────────────────────────────────────────

function PeoplePicker({
  charts,
  selectedIds,
  onToggle,
  locale,
}: {
  charts: ChartRecord[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  locale: string;
}) {
  const label = locale === "en" ? "Reading context:" : locale === "uk" ? "Контекст розкладу:" : "Контекст расклада:";

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <span className="shrink-0 text-[11px] text-[var(--muted-foreground)]">{label}</span>
      {charts.map(chart => {
        const isSelected = selectedIds.includes(chart.id);
        const emoji = RELATION_EMOJI[chart.relation] ?? "👤";
        return (
          <button
            key={chart.id}
            onClick={() => onToggle(chart.id)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all ${
              isSelected
                ? "border-cosmic-400/60 bg-cosmic-500/15 text-cosmic-300"
                : "border-[var(--border)] bg-[var(--muted)]/30 text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="text-xs">{emoji}</span>
            <span>{chart.name}</span>
            {isSelected && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Chat Context Badge (shown in existing chats) ──────────────────────────────

function ContextBadge({
  charts,
  locale,
}: {
  charts: ChartRecord[];
  locale: string;
}) {
  if (charts.length <= 1) return null;
  const names = charts.map(c => c.name).join(" + ");
  const label = locale === "en" ? "Reading:" : locale === "uk" ? "Розклад:" : "Расклад:";
  return (
    <div className="mx-auto max-w-3xl px-4 pt-3">
      <div className="flex items-center gap-2 rounded-xl border border-cosmic-500/25 bg-cosmic-500/8 px-3 py-2">
        <span className="text-xs text-cosmic-400">✦</span>
        <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
        <span className="text-xs font-medium text-[var(--foreground)]">{names}</span>
      </div>
    </div>
  );
}

// ── Inline markdown renderer ──────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-[var(--foreground)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function MessageContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n");

        if (lines.length === 1) {
          const h3 = lines[0].match(/^###\s+(.+)/);
          const h2 = lines[0].match(/^##\s+(.+)/);
          const h1 = lines[0].match(/^#\s+(.+)/);
          if (h3) return <p key={pi} className="font-semibold text-[var(--foreground)]">{renderInline(h3[1])}</p>;
          if (h2) return <p key={pi} className="font-bold text-base text-[var(--foreground)] mt-1">{renderInline(h2[1])}</p>;
          if (h1) return <p key={pi} className="font-bold text-lg text-[var(--foreground)] mt-1">{renderInline(h1[1])}</p>;
        }

        const isListBlock = lines.some((l) => l.match(/^[-•*]\s/) || l.match(/^\d+\.\s/));
        if (isListBlock) {
          return (
            <ul key={pi} className="space-y-1.5">
              {lines.map((line, li) => {
                const h = line.match(/^#{1,3}\s+(.+)/);
                if (h) return <li key={li} className="list-none font-semibold text-[var(--foreground)]">{renderInline(h[1])}</li>;
                if (line.match(/^[-•*]\s/)) {
                  return (
                    <li key={li} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-cosmic-400/70" />
                      <span>{renderInline(line.replace(/^[-•*]\s/, ""))}</span>
                    </li>
                  );
                }
                if (line.match(/^\d+\.\s/)) {
                  const num = line.match(/^(\d+)\.\s(.+)/);
                  return (
                    <li key={li} className="flex items-start gap-2">
                      <span className="shrink-0 tabular-nums text-cosmic-400/70 text-xs mt-0.5">{num?.[1]}.</span>
                      <span>{renderInline(num?.[2] ?? line)}</span>
                    </li>
                  );
                }
                if (!line.trim()) return null;
                return <li key={li} className="list-none">{renderInline(line)}</li>;
              })}
            </ul>
          );
        }

        return (
          <p key={pi}>
            {lines.map((line, li) => {
              const h = line.match(/^(#{1,3})\s+(.+)/);
              if (h) {
                const cls = h[1].length === 1
                  ? "font-bold text-lg text-[var(--foreground)]"
                  : h[1].length === 2
                  ? "font-bold text-base text-[var(--foreground)]"
                  : "font-semibold text-[var(--foreground)]";
                return <span key={li} className={`block ${cls}`}>{renderInline(h[2])}</span>;
              }
              return (
                <span key={li}>
                  {li > 0 && <br />}
                  {renderInline(line)}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-cosmic-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isTyping,
}: {
  message: Message;
  isTyping: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copyText() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="group relative max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-cosmic-500 to-nebula-600 px-4 py-3 text-sm text-white shadow-glow">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <button
            onClick={copyText}
            className="absolute -left-8 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--muted-foreground)] opacity-0 transition-all hover:text-[var(--foreground)] group-hover:opacity-100"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 border border-cosmic-400/30 text-sm">
        ✦
      </div>

      <div className="group relative min-w-0 flex-1">
        <div className="rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
          {isTyping && message.content === "" ? (
            <TypingDots />
          ) : (
            <MessageContent text={message.content} />
          )}
        </div>

        {!isTyping && message.content && (
          <button
            onClick={copyText}
            className="absolute -right-8 top-2 rounded-md p-1.5 text-[var(--muted-foreground)] opacity-0 transition-all hover:text-[var(--foreground)] group-hover:opacity-100"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5L20 7" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({
  onSend,
  t,
  partnerName,
}: {
  onSend: (text: string) => void;
  t: ReturnType<typeof useTranslations>;
  partnerName?: string;
}) {
  const suggestions = partnerName
    ? [
        { label: t("suggestSynastryCompatibility"), prompt: t("suggestSynastryCompatibilityPrompt", { name: partnerName }) },
        { label: t("suggestSynastryLove"),          prompt: t("suggestSynastryLovePrompt",          { name: partnerName }) },
        { label: t("suggestSynastryStrengths"),     prompt: t("suggestSynastryStrengthsPrompt",     { name: partnerName }) },
        { label: t("suggestSynastryEnergy"),        prompt: t("suggestSynastryEnergyPrompt",        { name: partnerName }) },
      ]
    : [
        { label: t("suggestCompatibility"), prompt: t("suggestCompatibilityPrompt") },
        { label: t("suggestLove"),          prompt: t("suggestLovePrompt") },
        { label: t("suggestCareer"),        prompt: t("suggestCareerPrompt") },
        { label: t("suggestFinance"),       prompt: t("suggestFinancePrompt") },
        { label: t("suggestToday"),         prompt: t("suggestTodayPrompt") },
      ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-cosmic-500/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-cosmic-400/30 bg-gradient-to-br from-cosmic-500/20 to-nebula-500/20 text-3xl shadow-glow">
          ✦
        </div>
      </div>

      <h2 className="mb-2 font-display text-2xl font-bold text-[var(--foreground)]">
        {t("emptyTitle")}
      </h2>
      <p className="mb-10 max-w-sm text-center text-sm text-[var(--muted-foreground)]">
        {t("emptySubtitle")}
      </p>

      <div className="flex max-w-lg flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <button
            key={s.prompt}
            onClick={() => onSend(s.prompt)}
            className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--foreground)] transition-all hover:border-cosmic-400/50 hover:bg-[var(--muted)] hover:shadow-sm active:scale-[0.97]"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChatInterface({
  chatId,
  initialPrompt,
  initialChartIds,
}: {
  chatId?: string;
  initialPrompt?: string;
  initialChartIds?: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(!!chatId);
  const streamingMsgIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialPromptSentRef = useRef(false);
  const currentChatIdRef = useRef<string | undefined>(chatId);
  const t = useTranslations("chat");
  const locale = useLocale();
  const router = useRouter();

  // ── Token / plan state ──────────────────────────────────────────────────────
  const supabase = useMemo(() => createClient(), []);
  const [tier,         setTier]         = useState<SubscriptionTier>("free");
  const [tokensLeft,   setTokensLeft]   = useState<number | null>(null);
  const [tokensReset,  setTokensReset]  = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ── People picker state ──────────────────────────────────────────────────────
  const [allCharts, setAllCharts] = useState<ChartRecord[]>([]);
  // IDs selected for the current reading (tracked for new chats; locked for existing)
  const [selectedChartIds, setSelectedChartIds] = useState<string[]>([]);
  // Chart context for existing chats (loaded from chat_summaries)
  const [existingChartIds, setExistingChartIds] = useState<string[]>([]);
  // Whether this chat already has messages (picker should be hidden)
  const chatHasMessages = messages.length > 0;

  const hasMultiCharts = canAccess(tier, "multi_charts");

  // Load plan info + charts on mount
  useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("users")
        .select("subscription_tier, tokens_left, tokens_reset_at")
        .eq("id", user.id)
        .single();
      if (data) {
        setTier(data.subscription_tier);
        setTokensLeft(data.tokens_left);
        setTokensReset(data.tokens_reset_at);
        if (data.tokens_left <= 0 && PLANS[data.subscription_tier as SubscriptionTier].monthlyTokens !== -1) {
          setShowLimitModal(true);
        }
      }
    }

    async function loadCharts() {
      const res = await fetch("/api/natal-chart");
      if (!res.ok) return;
      const data = await res.json() as { charts: ChartRecord[] };
      const charts = data.charts ?? [];
      setAllCharts(charts);

      // Default selection: user's own chart (self) + any initialChartIds
      const selfChart = charts.find(c => c.relation === "self");
      if (selfChart) {
        const initial = initialChartIds?.length
          ? [selfChart.id, ...initialChartIds.filter(id => id !== selfChart.id)]
          : [selfChart.id];
        setSelectedChartIds(initial);
      }
    }

    loadPlan();
    loadCharts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load history when chatId provided — also fetches chart_ids for this chat
  useEffect(() => {
    if (!chatId) {
      setLoadingHistory(false);
      return;
    }
    setLoadingHistory(true);
    fetch(`/api/chat?chat_id=${chatId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        if (data.chart_ids?.length) {
          setExistingChartIds(data.chart_ids);
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false));
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  function adjustTextarea(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    adjustTextarea(e.target);
  }

  function toggleChart(id: string) {
    const selfChart = allCharts.find(c => c.relation === "self");
    // Can't deselect own chart
    if (selfChart && id === selfChart.id) return;

    setSelectedChartIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }

      const userMsgId = `user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: trimmed, created_at: new Date().toISOString() },
      ]);

      const assistantMsgId = `assistant-${Date.now() + 1}`;
      streamingMsgIdRef.current = assistantMsgId;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "", created_at: new Date().toISOString() },
      ]);
      setIsLoading(true);

      try {
        // Determine which chart_ids to send
        const chartIdsToSend = existingChartIds.length > 0
          ? existingChartIds
          : selectedChartIds;

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            chat_id: currentChatIdRef.current,
            chart_ids: chartIdsToSend.length > 0 ? chartIdsToSend : undefined,
            locale,
          }),
        });

        if (!response.ok) {
          if (response.status === 402) {
            const errData = await response.json().catch(() => ({}));
            setTokensLeft(0);
            if (errData.tokens_reset_at) setTokensReset(errData.tokens_reset_at);
            setShowLimitModal(true);
            setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
            return;
          }
          throw new Error("API error");
        }
        if (!response.body) throw new Error("No body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let newChatId: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const data = JSON.parse(raw);
              if (data.type === "chat_id") {
                newChatId = data.value;
                if (!currentChatIdRef.current && newChatId) {
                  currentChatIdRef.current = newChatId;
                  window.history.replaceState(null, "", `/${locale}/app/chat/${newChatId}`);
                }
              } else if (data.type === "delta") {
                fullContent += data.value;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: fullContent } : m
                  )
                );
              } else if (data.type === "done") {
                if (typeof data.tokens_left === "number") {
                  setTokensLeft(data.tokens_left);
                  if (data.tokens_left <= 0 && PLANS[tier].monthlyTokens !== -1) {
                    setShowLimitModal(true);
                  }
                }
              } else if (data.type === "error") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: t("errorGeneric") } : m
                  )
                );
              }
            } catch {}
          }
        }

        window.dispatchEvent(new CustomEvent("astraly:chat:refresh"));
        if (newChatId) router.replace(`/app/chat/${newChatId}`, { locale });
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: t("errorGeneric") } : m
          )
        );
      } finally {
        setIsLoading(false);
        streamingMsgIdRef.current = null;
      }
    },
    [isLoading, locale, router, t, tier, selectedChartIds, existingChartIds]
  );

  // Auto-send initial prompt once history loads
  useEffect(() => {
    if (!initialPrompt || initialPromptSentRef.current || loadingHistory) return;
    initialPromptSentRef.current = true;
    sendMessage(initialPrompt);
  }, [initialPrompt, loadingHistory, sendMessage]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = messages.length === 0 && !loadingHistory && !initialPrompt;

  const usageInfo = tokensLeft !== null
    ? getUsageLevel(tier, tokensLeft)
    : null;
  const isTokenBlocked = usageInfo?.level === "critical";
  const isTokenWarning = usageInfo?.level === "warning";

  // Charts for context badge (existing chat) or picker (new chat)
  const contextCharts = existingChartIds.length > 0
    ? allCharts.filter(c => existingChartIds.includes(c.id))
    : allCharts.filter(c => selectedChartIds.includes(c.id));

  // First non-self selected chart — used to personalise empty-state suggestions
  const partnerChart = contextCharts.find(c => c.relation !== "self");

  // Show picker only for new chats with multi_charts access and multiple available charts
  const showPicker = !chatHasMessages && hasMultiCharts && allCharts.length > 1 && !chatId;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showLimitModal && tokensLeft !== null && (
        <LimitModal
          tier={tier}
          tokensLeft={tokensLeft}
          tokensResetAt={tokensReset}
          onClose={() => setShowLimitModal(false)}
        />
      )}

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Natal chart widget */}
        <NatalChartWidget chartOverride={contextCharts[0] ?? null} />

        {/* Multi-chart context badge for existing chats */}
        {!showPicker && contextCharts.length > 1 && (
          <ContextBadge charts={contextCharts} locale={locale} />
        )}

        {loadingHistory ? (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-start gap-3 ${i % 2 === 0 ? "justify-end" : ""}`}
              >
                {i % 2 !== 0 && (
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-[var(--muted)]" />
                )}
                <div
                  className={`h-16 animate-pulse rounded-2xl bg-[var(--muted)] ${
                    i % 2 === 0 ? "w-48" : "w-64"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState onSend={sendMessage} t={t} partnerName={partnerChart?.name} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isTyping={
                  isLoading &&
                  idx === messages.length - 1 &&
                  msg.role === "assistant" &&
                  msg.content === ""
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-[var(--border)] bg-[var(--background)]/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">

          {/* People picker — new chat only */}
          {showPicker && (
            <PeoplePicker
              charts={allCharts}
              selectedIds={selectedChartIds}
              onToggle={toggleChart}
              locale={locale}
            />
          )}

          {/* Token warning banner */}
          {isTokenWarning && !isTokenBlocked && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/8 px-4 py-2.5">
              <p className="text-xs text-amber-400">
                {locale === "ru" && "⚠ Сообщения почти закончились — обнови план"}
                {locale === "uk" && "⚠ Повідомлення майже закінчилися — онови план"}
                {locale === "en" && "⚠ Running low on messages — consider upgrading"}
              </p>
              <button
                onClick={() => setShowLimitModal(true)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors ml-3 shrink-0"
              >
                {locale === "ru" ? "Планы →" : locale === "uk" ? "Плани →" : "Plans →"}
              </button>
            </div>
          )}

          {/* Blocked banner */}
          {isTokenBlocked && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-rose-400/30 bg-rose-400/8 px-4 py-2.5">
              <p className="text-xs text-rose-400">
                {locale === "ru" && "Лимит сообщений исчерпан"}
                {locale === "uk" && "Ліміт повідомлень вичерпано"}
                {locale === "en" && "Message limit reached"}
              </p>
              <button
                onClick={() => setShowLimitModal(true)}
                className="text-[11px] font-semibold text-cosmic-400 hover:text-cosmic-300 transition-colors ml-3 shrink-0"
              >
                {locale === "ru" ? "Открыть доступ →" : locale === "uk" ? "Відкрити доступ →" : "Unlock →"}
              </button>
            </div>
          )}

          <div
            className={`relative flex items-end gap-2 rounded-2xl border bg-[var(--input)] px-4 py-3 shadow-sm transition-all ${
              isLoading || isTokenBlocked
                ? "border-[var(--border)] opacity-70"
                : "border-[var(--border)] focus-within:border-cosmic-400 focus-within:ring-2 focus-within:ring-cosmic-400/15"
            }`}
          >
            <span className="shrink-0 pb-0.5 text-cosmic-400 text-base">✨</span>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t("placeholder")}
              rows={1}
              disabled={isLoading || isTokenBlocked}
              className="max-h-[200px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-[var(--foreground)] outline-none placeholder-[var(--muted-foreground)]/50 disabled:opacity-60"
            />
            <VoiceInputButton
              locale={locale}
              disabled={isLoading || isTokenBlocked}
              onTranscript={(text) => {
                setInput(text);
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                  textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
                }
              }}
            />
            <button
              onClick={() => isTokenBlocked ? setShowLimitModal(true) : sendMessage(input)}
              disabled={(!input.trim() || isLoading) && !isTokenBlocked}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cosmic-500 to-nebula-500 text-white shadow-glow transition-all hover:scale-105 hover:shadow-cosmic disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            >
              {isLoading ? (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-[var(--muted-foreground)]/40">
            {t("inputHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
