"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { CityAutocomplete } from "@/components/shared/CityAutocomplete";
import { PLANS, canAccess } from "@/lib/plans";
import type { Relation, SubscriptionTier } from "@/types/database";
import { trackEvent } from "@/lib/analytics";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlanetData {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

interface HouseData {
  house: number;
  sign: string;
  degree: number;
}

interface ChartRecord {
  id: string;
  name: string;
  relation: Relation;
  birth_date: string;
  birth_time: string | null;
  birth_city: string;
  planets_json: Record<string, PlanetData>;
  houses_json: HouseData[];
  ascendant: { sign: string; degree: number; mc_sign?: string; mc_degree?: number };
  created_at: string;
}

interface AddForm {
  name: string;
  relation: Relation;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  lat?: number;
  lng?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};



const RELATION_EMOJI: Record<Relation, string> = {
  self:    "✦",
  partner: "💑",
  parent:  "👨‍👩‍👧",
  child:   "🧒",
  friend:  "👫",
  other:   "👤",
};

const COPY = {
  ru: {
    title:          "Мой круг",
    subtitle:       "Натальные карты близких",
    addPerson:      "+ Добавить человека",
    used:           "использовано",
    of:             "из",
    people:         "карт",
    unlimited:      "Безлимит",
    selfBadge:      "Я",
    deletePerson:   "Удалить",
    editPerson:     "Изменить",
    deleteConfirm:  "Удалить карту {name}? Это действие нельзя отменить.",
    chatWith:       "Расклад с",
    addTitle:       "Новый человек",
    editTitle:      "Изменить карту",
    addSubtitle:    "Добавь натальную карту близкого",
    editSubtitle:   "Обнови данные и пересчитай карту",
    fieldName:      "Имя",
    fieldRelation:  "Кто это?",
    fieldDate:      "Дата рождения",
    fieldTime:      "Время рождения",
    fieldCity:      "Город рождения",
    buildButton:    "Рассчитать карту ✦",
    saveButton:     "Сохранить изменения ✦",
    cancel:         "Отмена",
    building:       "Строим карту...",
    cityError:      "Город не найден",
    errorGeneric:   "Ошибка при расчёте",
    limitTitle:     "Лимит карт достигнут",
    limitDesc:      "Обнови план, чтобы добавить больше людей",
    upgrade:        "Обновить план →",
    details:        "Подробнее →",
    relations: {
      self:    "Я",
      partner: "Партнёр",
      parent:  "Родители",
      child:   "Ребёнок",
      friend:  "Друг/подруга",
      other:   "Другое",
    },
    planLimits: {
      free:      "1 карта (только своя)",
      moonlight: "До 3 карт",
      solar:     "До 5 карт",
      cosmic:    "До 10 карт",
    },
    noChart: "Карта ещё не построена",
    sun: "☉",
    moon: "☽",
    asc: "ASC",
    signNames: {
      Aries: "Овен", Taurus: "Телец", Gemini: "Близнецы", Cancer: "Рак",
      Leo: "Лев", Virgo: "Дева", Libra: "Весы", Scorpio: "Скорпион",
      Sagittarius: "Стрелец", Capricorn: "Козерог", Aquarius: "Водолей", Pisces: "Рыбы",
    },
  },
  en: {
    title:          "My Circle",
    subtitle:       "Natal charts of those close to you",
    addPerson:      "+ Add Person",
    used:           "used",
    of:             "of",
    people:         "charts",
    unlimited:      "Unlimited",
    selfBadge:      "Me",
    deletePerson:   "Delete",
    editPerson:     "Edit",
    deleteConfirm:  "Delete {name}'s chart? This cannot be undone.",
    chatWith:       "Reading with",
    addTitle:       "New Person",
    editTitle:      "Edit Chart",
    addSubtitle:    "Add a natal chart for someone you know",
    editSubtitle:   "Update the details and recalculate",
    fieldName:      "Name",
    fieldRelation:  "Who is this?",
    fieldDate:      "Date of Birth",
    fieldTime:      "Time of Birth",
    fieldCity:      "City of Birth",
    buildButton:    "Calculate Chart ✦",
    saveButton:     "Save Changes ✦",
    cancel:         "Cancel",
    building:       "Building chart...",
    cityError:      "City not found",
    errorGeneric:   "Calculation error",
    limitTitle:     "Chart limit reached",
    limitDesc:      "Upgrade your plan to add more people",
    upgrade:        "Upgrade plan →",
    details:        "Details →",
    relations: {
      self:    "Me",
      partner: "Partner",
      parent:  "Parent",
      child:   "Child",
      friend:  "Friend",
      other:   "Other",
    },
    planLimits: {
      free:      "1 chart (yours only)",
      moonlight: "Up to 3 charts",
      solar:     "Up to 5 charts",
      cosmic:    "Up to 10 charts",
    },
    noChart: "Chart not built yet",
    sun: "☉",
    moon: "☽",
    asc: "ASC",
    signNames: {
      Aries: "Aries", Taurus: "Taurus", Gemini: "Gemini", Cancer: "Cancer",
      Leo: "Leo", Virgo: "Virgo", Libra: "Libra", Scorpio: "Scorpio",
      Sagittarius: "Sagittarius", Capricorn: "Capricorn", Aquarius: "Aquarius", Pisces: "Pisces",
    },
  },
  uk: {
    title:          "Моє коло",
    subtitle:       "Натальні карти близьких",
    addPerson:      "+ Додати людину",
    used:           "використано",
    of:             "з",
    people:         "карт",
    unlimited:      "Безліміт",
    selfBadge:      "Я",
    deletePerson:   "Видалити",
    editPerson:     "Змінити",
    deleteConfirm:  "Видалити карту {name}? Цю дію не можна скасувати.",
    chatWith:       "Розклад з",
    addTitle:       "Нова людина",
    editTitle:      "Змінити карту",
    addSubtitle:    "Додай натальну карту близького",
    editSubtitle:   "Онови дані та перерахуй карту",
    fieldName:      "Ім'я",
    fieldRelation:  "Хто це?",
    fieldDate:      "Дата народження",
    fieldTime:      "Час народження",
    fieldCity:      "Місто народження",
    buildButton:    "Розрахувати карту ✦",
    saveButton:     "Зберегти зміни ✦",
    cancel:         "Скасувати",
    building:       "Будуємо карту...",
    cityError:      "Місто не знайдено",
    errorGeneric:   "Помилка при розрахунку",
    limitTitle:     "Ліміт карт досягнуто",
    limitDesc:      "Онови план, щоб додати більше людей",
    upgrade:        "Оновити план →",
    details:        "Детальніше →",
    relations: {
      self:    "Я",
      partner: "Партнер",
      parent:  "Батьки",
      child:   "Дитина",
      friend:  "Друг/подруга",
      other:   "Інше",
    },
    planLimits: {
      free:      "1 карта (тільки своя)",
      moonlight: "До 3 карт",
      solar:     "До 5 карт",
      cosmic:    "До 10 карт",
    },
    noChart: "Карта ще не побудована",
    sun: "☉",
    moon: "☽",
    asc: "ASC",
    signNames: {
      Aries: "Овен", Taurus: "Телець", Gemini: "Близнюки", Cancer: "Рак",
      Leo: "Лев", Virgo: "Діва", Libra: "Терези", Scorpio: "Скорпіон",
      Sagittarius: "Стрілець", Capricorn: "Козеріг", Aquarius: "Водолій", Pisces: "Риби",
    },
  },
};

const inputCls = "w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]/60 outline-none transition-colors focus:border-cosmic-400 focus:ring-2 focus:ring-cosmic-400/15";

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? "h-4 w-4" : "h-5 w-5"}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Person Card ───────────────────────────────────────────────────────────────

function PersonCard({
  chart,
  c,
  onDelete,
  onEdit,
  onChat,
}: {
  chart: ChartRecord;
  c: typeof COPY.ru;
  onDelete: (chart: ChartRecord) => void;
  onEdit: (chart: ChartRecord) => void;
  onChat: (chart: ChartRecord) => void;
}) {
  const tS     = useTranslations("signs");
  const locale = useLocale() as "ru" | "en" | "uk";
  const router = useRouter();

  const isSelf  = chart.relation === "self";
  const sun     = chart.planets_json?.Sun;
  const moon    = chart.planets_json?.Moon;
  const asc     = chart.ascendant;
  const hasData = !!(sun && moon && asc);

  return (
    <div className={`group relative flex flex-col rounded-2xl border bg-[var(--card)] transition-all hover:border-cosmic-400/40 hover:shadow-sm ${
      isSelf
        ? "border-cosmic-500/40 bg-gradient-to-br from-cosmic-500/8 to-nebula-500/5"
        : "border-[var(--border)]"
    }`}>

      {/* Self badge */}
      {isSelf && (
        <span className="absolute right-3 top-3 rounded-full bg-cosmic-500/20 px-2 py-0.5 text-[10px] font-semibold text-cosmic-400">
          {c.selfBadge}
        </span>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${
            isSelf
              ? "bg-gradient-to-br from-cosmic-500/30 to-nebula-500/30 border border-cosmic-400/30"
              : "bg-[var(--muted)] border border-[var(--border)]"
          }`}>
            {RELATION_EMOJI[chart.relation]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--foreground)]">{chart.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {c.relations[chart.relation]}
            </p>
          </div>
        </div>

        {/* Chart summary — ASC/MC + Sun/Moon pills */}
        {hasData ? (
          <>
            {/* ASC + MC */}
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                <span className="text-xs text-[var(--muted-foreground)]">ASC</span>
                <span className="text-sm text-cosmic-400">{SIGN_SYMBOLS[asc.sign]}</span>
                <span className="text-xs font-medium text-[var(--foreground)]">{tS(asc.sign as Parameters<typeof tS>[0])}</span>
              </div>
              {asc.mc_sign && (
                <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)]/50 px-3 py-1">
                  <span className="text-xs text-[var(--muted-foreground)]">MC</span>
                  <span className="text-sm text-nebula-400">{SIGN_SYMBOLS[asc.mc_sign]}</span>
                  <span className="text-xs font-medium text-[var(--foreground)]">{tS(asc.mc_sign as Parameters<typeof tS>[0])}</span>
                </div>
              )}
            </div>

            {/* Sun · Moon */}
            <div className="mb-3 grid grid-cols-2 gap-2">
              {([["Sun", "☉"], ["Moon", "☽"]] as const).map(([key, sym]) => {
                const p = chart.planets_json[key];
                if (!p) return null;
                return (
                  <div key={key} className="rounded-xl bg-[var(--muted)]/50 px-2 py-2 text-center">
                    <p className="text-[10px] text-[var(--muted-foreground)]">{sym}</p>
                    <p className="mt-0.5 text-base">{SIGN_SYMBOLS[p.sign] ?? "?"}</p>
                    <p className="text-[10px] text-[var(--foreground)]">{tS(p.sign as Parameters<typeof tS>[0])}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mb-4 text-xs text-[var(--muted-foreground)]">{c.noChart}</p>
        )}

        {/* Birth info */}
        <p className="mb-4 text-[11px] text-[var(--muted-foreground)]">
          {chart.birth_date}
          {chart.birth_time ? ` · ${chart.birth_time}` : ""}
          {" · "}{chart.birth_city}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {!isSelf && (
            <button
              onClick={() => onChat(chart)}
              className="flex-1 rounded-xl border border-cosmic-500/40 bg-cosmic-500/10 px-3 py-2 text-xs font-medium text-cosmic-400 transition-all hover:bg-cosmic-500/20"
            >
              {c.chatWith} {chart.name} →
            </button>
          )}
          <button
            onClick={() => onEdit(chart)}
            className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-all hover:border-cosmic-400/40 hover:text-cosmic-400"
            title={c.editPerson}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {!isSelf && (
            <button
              onClick={() => onDelete(chart)}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)] transition-all hover:border-red-400/40 hover:text-red-400"
              title={c.deletePerson}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M8 6V4h8v2" />
              </svg>
            </button>
          )}
        </div>

        {/* Details link */}
        {hasData && (
          <button
            onClick={() => router.push(`/app/people/${chart.id}`, { locale })}
            className="mt-3 w-full rounded-xl border border-[var(--border)] py-1.5 text-[11px] text-[var(--muted-foreground)] transition-all hover:border-cosmic-400/40 hover:text-cosmic-400"
          >
            {c.details}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PeoplePage() {
  const rawLocale = useLocale();
  const locale = rawLocale as "ru" | "en" | "uk";
  const c = COPY[locale] ?? COPY.ru;
  const router = useRouter();

  const [charts, setCharts] = useState<ChartRecord[]>([]);
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [pageState, setPageState] = useState<"loading" | "ready">("loading");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTarget, setEditTarget] = useState<ChartRecord | null>(null);
  const [formState, setFormState] = useState<"idle" | "building" | "error">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChartRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<AddForm>({
    name: "", relation: "partner", birthDate: "", birthTime: "", birthCity: "",
  });

  const loadData = useCallback(async () => {
    setPageState("loading");

    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();

    const [chartsRes, { data: { user } }] = await Promise.all([
      fetch("/api/natal-chart"),
      sb.auth.getUser(),
    ]);

    if (chartsRes.ok) {
      const data = await chartsRes.json() as { charts: ChartRecord[] };
      setCharts(data.charts ?? []);
    }

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (sb as any)
        .from("users")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();
      if (data?.subscription_tier) setTier(data.subscription_tier);
    }

    setPageState("ready");
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const maxCharts = PLANS[tier].maxCharts;
  const canAddMore = maxCharts === -1 || charts.length < maxCharts;
  const hasMultiCharts = canAccess(tier, "multi_charts");

  function handleEdit(chart: ChartRecord) {
    setEditTarget(chart);
    setForm({
      name: chart.name,
      relation: chart.relation,
      birthDate: chart.birth_date,
      birthTime: chart.birth_time ?? "",
      birthCity: chart.birth_city,
    });
    setFormError(null);
    setFormState("idle");
    setShowAddForm(true);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.birthDate || !form.birthCity.trim()) return;

    setFormState("building");
    setFormError(null);

    const isEdit = editTarget !== null;
    const url = isEdit
      ? `/api/natal-chart?chart_id=${editTarget.id}`
      : "/api/natal-chart";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        relation: form.relation,
        birth_date: form.birthDate,
        birth_time: form.birthTime || "",
        birth_city: form.birthCity,
        lat: form.lat,
        lng: form.lng,
      }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (json.error === "chart_limit") {
        setFormError(c.limitTitle);
      } else if (json.error?.includes("City not found")) {
        setFormError(c.cityError);
      } else {
        setFormError(c.errorGeneric);
      }
      setFormState("error");
      return;
    }

    const json = await res.json() as { chart: ChartRecord };
    if (isEdit) {
      setCharts(prev => prev.map(ch => ch.id === json.chart.id ? json.chart : ch));
    } else {
      trackEvent("chart_created", { relation: form.relation });
      setCharts(prev => [...prev, json.chart]);
    }
    setShowAddForm(false);
    setEditTarget(null);
    setForm({ name: "", relation: "partner", birthDate: "", birthTime: "", birthCity: "" });
    setFormState("idle");
    setFormError(null);
  }

  async function handleDelete(chart: ChartRecord) {
    setDeleting(true);
    const res = await fetch(`/api/natal-chart?chart_id=${chart.id}`, { method: "DELETE" });
    if (res.ok) {
      setCharts(prev => prev.filter(c => c.id !== chart.id));
    }
    setDeleteTarget(null);
    setDeleting(false);
  }

  function handleChatWith(chart: ChartRecord) {
    router.push(`/app/chat?chart_ids=${chart.id}`, { locale });
  }

  const selfChart  = charts.find(ch => ch.relation === "self");
  const otherCharts = charts.filter(ch => ch.relation !== "self");

  if (pageState === "loading") {
    return (
      <div className="flex flex-1 min-h-0 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--foreground)]">{c.title}</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{c.subtitle}</p>
          </div>

          {/* Usage counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted-foreground)]">
              {charts.length} {c.used}
              {maxCharts !== -1 && ` ${c.of} ${maxCharts}`}
              {" "}{c.people}
            </span>

            {hasMultiCharts && canAddMore && (
              <button
                onClick={() => setShowAddForm(true)}
                className="rounded-xl border border-cosmic-500/40 bg-gradient-to-r from-cosmic-500/10 to-nebula-500/10 px-4 py-2 text-sm font-medium text-cosmic-400 transition-all hover:border-cosmic-400/60 hover:from-cosmic-500/20"
              >
                {c.addPerson}
              </button>
            )}

            {!hasMultiCharts && (
              <button
                onClick={() => router.push("/app/pricing", { locale })}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-all hover:border-cosmic-400/40 hover:text-cosmic-400"
              >
                {c.addPerson}
              </button>
            )}

            {hasMultiCharts && !canAddMore && (
              <button
                onClick={() => router.push("/app/pricing", { locale })}
                className="rounded-xl border border-amber-400/30 bg-amber-400/8 px-4 py-2 text-sm font-medium text-amber-400 transition-all hover:bg-amber-400/15"
              >
                {c.upgrade}
              </button>
            )}
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {selfChart && (
            <PersonCard
              chart={selfChart}
              c={c}
              onDelete={() => {}}
              onEdit={handleEdit}
              onChat={handleChatWith}
            />
          )}
          {otherCharts.map(chart => (
            <PersonCard
              key={chart.id}
              chart={chart}
              c={c}
              onDelete={ch => setDeleteTarget(ch)}
              onEdit={handleEdit}
              onChat={handleChatWith}
            />
          ))}

          {/* Empty add slot for paid users */}
          {hasMultiCharts && canAddMore && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] transition-all hover:border-cosmic-400/50 hover:bg-[var(--muted)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-xl text-[var(--muted-foreground)]">+</div>
              <p className="text-sm text-[var(--muted-foreground)]">{c.addPerson}</p>
            </button>
          )}

          {/* Paywall slot for free users */}
          {!hasMultiCharts && (
            <button
              onClick={() => router.push("/app/pricing", { locale })}
              className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/30 transition-all hover:border-cosmic-400/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-xl text-[var(--muted-foreground)] opacity-50">🔒</div>
              <p className="text-sm text-[var(--muted-foreground)]">{c.limitDesc}</p>
              <span className="rounded-lg bg-gradient-to-r from-cosmic-500 to-nebula-500 px-3 py-1.5 text-xs font-semibold text-white">
                {c.upgrade}
              </span>
            </button>
          )}
        </div>

        {/* Add / Edit form — inline modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-40 flex items-end justify-center p-4 sm:items-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !formState.includes("building") && (setShowAddForm(false), setEditTarget(null))}
            />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-cosmic">
              <div aria-hidden className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-cosmic-500/20 to-transparent blur-xl" />

              <div className="relative">
                <div className="mb-5 text-center">
                  <p className="mb-1 text-2xl">{editTarget ? "✏️" : "✨"}</p>
                  <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
                    {editTarget ? c.editTitle : c.addTitle}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {editTarget ? c.editSubtitle : c.addSubtitle}
                  </p>
                </div>

                <form onSubmit={handleAddSubmit} className="flex flex-col gap-3">
                  {/* Name */}
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={c.fieldName}
                    required
                    disabled={formState === "building"}
                    className={inputCls}
                  />

                  {/* Relation (hidden for self, shown for others) */}
                  {editTarget?.relation !== "self" && (
                    <select
                      value={form.relation}
                      onChange={e => setForm(f => ({ ...f, relation: e.target.value as Relation }))}
                      disabled={formState === "building"}
                      className={inputCls}
                    >
                      {(["partner", "parent", "child", "friend", "other"] as Relation[]).map(rel => (
                        <option key={rel} value={rel}>{c.relations[rel]}</option>
                      ))}
                    </select>
                  )}

                  {/* Date + Time */}
                  <div className="grid grid-cols-[3fr_2fr] gap-2">
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                      max={new Date().toISOString().split("T")[0]}
                      required
                      disabled={formState === "building"}
                      className={inputCls}
                    />
                    <input
                      type="time"
                      value={form.birthTime}
                      onChange={e => setForm(f => ({ ...f, birthTime: e.target.value }))}
                      disabled={formState === "building"}
                      className={inputCls}
                    />
                  </div>

                  {/* City */}
                  <CityAutocomplete
                    value={form.birthCity}
                    onChange={(city, geo) => setForm(f => ({
                      ...f, birthCity: city, lat: geo?.lat, lng: geo?.lng,
                    }))}
                    placeholder={c.fieldCity}
                  />

                  {formError && (
                    <p className="text-sm text-red-400">{formError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!form.name.trim() || !form.birthDate || !form.birthCity.trim() || formState === "building"}
                    className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cosmic-500 via-nebula-500 to-cosmic-400 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {formState === "building" ? (
                      <><Spinner small /> {c.building}</>
                    ) : editTarget ? (
                      c.saveButton
                    ) : (
                      c.buildButton
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setEditTarget(null); setFormState("idle"); setFormError(null); }}
                    disabled={formState === "building"}
                    className="w-full text-center text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] py-1"
                  >
                    {c.cancel}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !deleting && setDeleteTarget(null)}
            />
            <div className="relative z-10 w-full max-w-xs rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-cosmic">
              <p className="mb-1 text-2xl">🗑️</p>
              <p className="mb-4 text-sm text-[var(--foreground)]">
                {c.deleteConfirm.replace("{name}", deleteTarget.name)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-[var(--border)] py-2.5 text-sm text-[var(--muted-foreground)] transition-all hover:text-[var(--foreground)]"
                >
                  {c.cancel}
                </button>
                <button
                  onClick={() => handleDelete(deleteTarget)}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-red-500/10 border border-red-400/30 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting ? <Spinner small /> : c.deletePerson}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
