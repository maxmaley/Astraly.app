import { getTranslations, getLocale } from "next-intl/server";
import { ChatInterface }              from "@/components/chat/ChatInterface";
import { calculateCalendarMonth }     from "@/lib/astro/calendar";
import type { CalendarEvent }         from "@/lib/astro/calendar";

// ── Helpers ──────────────────────────────────────────────────────────────────

function moonEmoji(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return "🌑";
  if (angle < 67.5)  return "🌒";
  if (angle < 112.5) return "🌓";
  if (angle < 157.5) return "🌔";
  if (angle < 202.5) return "🌕";
  if (angle < 247.5) return "🌖";
  if (angle < 292.5) return "🌗";
  return "🌘";
}

type TFn = Awaited<ReturnType<typeof getTranslations>>;

function eventLabel(ev: CalendarEvent, t: TFn): string {
  const planet = ev.planet ? t(`planets.${ev.planet}` as Parameters<TFn>[0]) : "";
  const sign   = ev.sign   ? t(`signs.${ev.sign}`     as Parameters<TFn>[0]) : "";
  switch (ev.type) {
    case "new_moon":         return t("calendar.new_moon");
    case "full_moon":        return t("calendar.full_moon");
    case "first_quarter":    return t("calendar.first_quarter");
    case "last_quarter":     return t("calendar.last_quarter");
    case "solar_eclipse":    return t("calendar.solar_eclipse");
    case "lunar_eclipse":    return t("calendar.lunar_eclipse");
    case "retrograde_start": return t("calendar.retrograde_start", { planet });
    case "retrograde_end":   return t("calendar.retrograde_end",   { planet });
    case "ingress":          return t("calendar.ingress",           { planet, sign });
    case "moon_sign":        return t("calendar.moon_sign",         { sign });
    default:                 return ev.type;
  }
}

async function buildDatePrompt(date: string, locale: string, t: TFn): Promise<string> {
  const [year, month] = date.split("-").map(Number);
  const days    = calculateCalendarMonth(year, month);
  const dayInfo = days.find(d => d.date === date);

  const dateObj   = new Date(date + "T12:00:00Z");
  const dateLabel = dateObj.toLocaleDateString(
    locale === "en" ? "en-US" : locale === "uk" ? "uk-UA" : "ru-RU",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const quietDay = locale === "uk"
    ? "астрологічно спокійний день"
    : locale === "en"
      ? "astrologically quiet day"
      : "астрологически спокойный день";

  let eventsPart: string;
  let moonPart:   string;

  if (dayInfo) {
    const labels = dayInfo.events.map(ev => eventLabel(ev, t));
    eventsPart = labels.length > 0 ? labels.join(", ") : quietDay;
    const pct  = Math.round(dayInfo.moonIllumination * 100);
    const icon = moonEmoji(dayInfo.moonPhaseAngle);
    moonPart   = locale === "uk"
      ? `Місяць ${icon} освітлений на ${pct}%.`
      : locale === "en"
        ? `Moon ${icon} is ${pct}% illuminated.`
        : `Луна ${icon} освещена на ${pct}%.`;
  } else {
    eventsPart = quietDay;
    moonPart   = "";
  }

  if (locale === "uk") {
    return `Розкажи мені про астрологічні впливи ${dateLabel} стосовно моєї натальної карти.\n\nПодії цього дня: ${eventsPart}. ${moonPart}\n\nЩо мене чекає і як найкраще використати цю енергію?`.trim();
  }
  if (locale === "en") {
    return `Tell me about the astrological influences of ${dateLabel} in relation to my natal chart.\n\nEvents on this day: ${eventsPart}. ${moonPart}\n\nWhat should I expect and how can I best use this energy?`.trim();
  }
  return `Расскажи мне про астрологические влияния ${dateLabel} применительно к моей натальной карте.\n\nСобытия этого дня: ${eventsPart}. ${moonPart}\n\nЧто меня ждёт и как лучше использовать эту энергию?`.trim();
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { explain?: string; horoscope?: string; date?: string };
}) {
  const t      = await getTranslations();
  const locale = await getLocale();

  let initialPrompt: string | undefined;

  if (searchParams.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)) {
    initialPrompt = await buildDatePrompt(searchParams.date, locale, t);
  } else if (searchParams.explain === "1") {
    initialPrompt = t("chat.explainPrompt");
  } else if (searchParams.horoscope === "1") {
    initialPrompt = t("chat.horoscopePrompt");
  }

  return <ChatInterface initialPrompt={initialPrompt} />;
}
