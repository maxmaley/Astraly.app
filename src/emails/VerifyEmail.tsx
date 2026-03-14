import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Подтверди свой email — Astraly",
    heading: "Подтверди свой email ✦",
    body: "Нажми на кнопку ниже, чтобы подтвердить адрес и начать путешествие к звёздам.",
    cta: "Подтвердить email",
    expire: "Ссылка действительна 24 часа.",
  },
  uk: {
    preview: "Підтверди свій email — Astraly",
    heading: "Підтверди свій email ✦",
    body: "Натисни на кнопку нижче, щоб підтвердити адресу та почати подорож до зірок.",
    cta: "Підтвердити email",
    expire: "Посилання дійсне 24 години.",
  },
  en: {
    preview: "Verify your email — Astraly",
    heading: "Verify your email ✦",
    body: "Click the button below to verify your address and start your journey to the stars.",
    cta: "Verify email",
    expire: "This link expires in 24 hours.",
  },
};

interface Props {
  confirmUrl: string;
  locale?: "ru" | "uk" | "en";
}

export default function VerifyEmail({ confirmUrl, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>✉️</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body}</Text>
        <Link href={confirmUrl} style={styles.button}>{t.cta}</Link>
        <Text style={{ ...styles.paragraph, marginTop: "16px", fontSize: "12px" }}>
          {t.expire}
        </Text>
      </Section>
    </EmailLayout>
  );
}
