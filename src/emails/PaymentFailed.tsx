import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Проблема с оплатой — Astraly",
    heading: "Проблема с оплатой",
    body: "Не удалось списать средства за подписку Astraly. Пожалуйста, проверь данные оплаты, чтобы не потерять доступ к платным функциям.",
    cta: "Обновить данные оплаты",
  },
  uk: {
    preview: "Проблема з оплатою — Astraly",
    heading: "Проблема з оплатою",
    body: "Не вдалося списати кошти за підписку Astraly. Будь ласка, перевір дані оплати, щоб не втратити доступ до платних функцій.",
    cta: "Оновити дані оплати",
  },
  en: {
    preview: "Payment issue — Astraly",
    heading: "Payment issue",
    body: "We were unable to process your Astraly subscription payment. Please update your payment details to keep access to paid features.",
    cta: "Update payment details",
  },
  pl: {
    preview: "Problem z płatnością — Astraly",
    heading: "Problem z płatnością",
    body: "Nie udało się przetworzyć płatności za subskrypcję Astraly. Zaktualizuj dane płatności, aby zachować dostęp do płatnych funkcji.",
    cta: "Zaktualizuj dane płatności",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

interface Props {
  updateUrl?: string;
  locale?: "ru" | "uk" | "en" | "pl";
}

export default function PaymentFailed({ updateUrl, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>⚠️</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body}</Text>
        <Link href={updateUrl ?? `${APP_URL}/app/pricing`} style={styles.button}>
          {t.cta}
        </Link>
      </Section>
    </EmailLayout>
  );
}
