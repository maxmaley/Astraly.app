import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Подписка отменена — Astraly",
    heading: "Подписка отменена",
    body: (plan: string, expiresAt: string) =>
      `Твой план ${plan} был отменён. Доступ к платным функциям сохраняется до ${expiresAt}. Ты всегда можешь вернуться!`,
    cta: "Посмотреть планы",
  },
  uk: {
    preview: "Підписку скасовано — Astraly",
    heading: "Підписку скасовано",
    body: (plan: string, expiresAt: string) =>
      `Твій план ${plan} було скасовано. Доступ до платних функцій зберігається до ${expiresAt}. Ти завжди можеш повернутися!`,
    cta: "Переглянути плани",
  },
  en: {
    preview: "Subscription canceled — Astraly",
    heading: "Subscription canceled",
    body: (plan: string, expiresAt: string) =>
      `Your ${plan} plan has been canceled. You still have access to paid features until ${expiresAt}. You can always come back!`,
    cta: "View plans",
  },
  pl: {
    preview: "Subskrypcja anulowana — Astraly",
    heading: "Subskrypcja anulowana",
    body: (plan: string, expiresAt: string) =>
      `Twój plan ${plan} został anulowany. Dostęp do płatnych funkcji jest zachowany do ${expiresAt}. Zawsze możesz wrócić!`,
    cta: "Zobacz plany",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

interface Props {
  planName: string;
  expiresAt: string;
  locale?: "ru" | "uk" | "en" | "pl";
}

export default function SubscriptionCanceled({ planName, expiresAt, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>🌙</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body(planName, expiresAt)}</Text>
        <Link href={`${APP_URL}/app/pricing`} style={styles.button}>{t.cta}</Link>
      </Section>
    </EmailLayout>
  );
}
