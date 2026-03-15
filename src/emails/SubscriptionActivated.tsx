import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Подписка активирована — Astraly",
    heading: "Подписка активирована ✦",
    body: (plan: string) => `Добро пожаловать в ${plan}! Все функции плана уже доступны. Наслаждайся путешествием к звёздам.`,
    cta: "Открыть Astraly",
  },
  uk: {
    preview: "Підписку активовано — Astraly",
    heading: "Підписку активовано ✦",
    body: (plan: string) => `Ласкаво просимо до ${plan}! Усі функції плану вже доступні. Насолоджуйся подорожжю до зірок.`,
    cta: "Відкрити Astraly",
  },
  en: {
    preview: "Subscription activated — Astraly",
    heading: "Subscription activated ✦",
    body: (plan: string) => `Welcome to ${plan}! All plan features are now available. Enjoy your journey to the stars.`,
    cta: "Open Astraly",
  },
  pl: {
    preview: "Subskrypcja aktywowana — Astraly",
    heading: "Subskrypcja aktywowana ✦",
    body: (plan: string) => `Witamy w ${plan}! Wszystkie funkcje planu są już dostępne. Ciesz się podróżą ku gwiazdom.`,
    cta: "Otwórz Astraly",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

interface Props {
  planName: string;
  locale?: "ru" | "uk" | "en" | "pl";
}

export default function SubscriptionActivated({ planName, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>🎉</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body(planName)}</Text>
        <Link href={`${APP_URL}/app/chart`} style={styles.button}>{t.cta}</Link>
      </Section>
    </EmailLayout>
  );
}
