import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Добро пожаловать в Astraly ✦",
    heading: "Добро пожаловать в Astraly ✦",
    body: (name: string) =>
      `Привет, ${name}! Рады видеть тебя среди звёзд. Твоя натальная карта уже ждёт — исследуй свою судьбу с AI астрологом.`,
    cta: "Открыть мою карту",
    features: "Что тебя ждёт:",
    f1: "✦ Персональная натальная карта",
    f2: "✦ AI астролог, который помнит тебя",
    f3: "✦ Ежедневный гороскоп и астрокалендарь",
  },
  uk: {
    preview: "Ласкаво просимо до Astraly ✦",
    heading: "Ласкаво просимо до Astraly ✦",
    body: (name: string) =>
      `Привіт, ${name}! Раді бачити тебе серед зірок. Твоя натальна карта вже чекає — досліджуй свою долю з AI астрологом.`,
    cta: "Відкрити мою карту",
    features: "Що тебе чекає:",
    f1: "✦ Персональна натальна карта",
    f2: "✦ AI астролог, який пам'ятає тебе",
    f3: "✦ Щоденний гороскоп і астрокалендар",
  },
  en: {
    preview: "Welcome to Astraly ✦",
    heading: "Welcome to Astraly ✦",
    body: (name: string) =>
      `Hi ${name}! Welcome among the stars. Your natal chart is ready — explore your destiny with your AI astrologer.`,
    cta: "Open my chart",
    features: "What awaits you:",
    f1: "✦ Personal natal chart",
    f2: "✦ AI astrologer that remembers you",
    f3: "✦ Daily horoscope and astro calendar",
  },
  pl: {
    preview: "Witamy w Astraly ✦",
    heading: "Witamy w Astraly ✦",
    body: (name: string) =>
      `Cześć, ${name}! Cieszymy się, że jesteś wśród gwiazd. Twoja karta natalna już czeka — odkryj swoje przeznaczenie z astrologiem AI.`,
    cta: "Otwórz moją kartę",
    features: "Co Cię czeka:",
    f1: "✦ Osobista karta natalna",
    f2: "✦ Astrolog AI, który Cię pamięta",
    f3: "✦ Codzienny horoskop i kalendarz astro",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

interface Props {
  name: string;
  locale?: "ru" | "uk" | "en" | "pl";
}

export default function Welcome({ name, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview} settingsLink>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>🌟</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body(name || "✦")}</Text>
      </Section>

      <Section style={{ padding: "0 4px" }}>
        <Text style={{ ...styles.paragraph, fontWeight: 600, color: styles.text, marginBottom: "8px" }}>
          {t.features}
        </Text>
        <Text style={{ ...styles.paragraph, margin: "0 0 4px" }}>{t.f1}</Text>
        <Text style={{ ...styles.paragraph, margin: "0 0 4px" }}>{t.f2}</Text>
        <Text style={{ ...styles.paragraph, margin: "0 0 16px" }}>{t.f3}</Text>
      </Section>

      <Section style={{ textAlign: "center" }}>
        <Link href={`${APP_URL}/app/chart`} style={styles.button}>{t.cta}</Link>
      </Section>
    </EmailLayout>
  );
}
