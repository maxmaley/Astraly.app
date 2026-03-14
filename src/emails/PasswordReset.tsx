import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: "Сброс пароля — Astraly",
    heading: "Сброс пароля",
    body: "Кто-то запросил сброс пароля для вашего аккаунта Astraly. Если это были не вы — просто проигнорируйте это письмо.",
    cta: "Сбросить пароль",
    expire: "Ссылка действительна 1 час.",
  },
  uk: {
    preview: "Скидання пароля — Astraly",
    heading: "Скидання пароля",
    body: "Хтось запросив скидання пароля для вашого акаунту Astraly. Якщо це були не ви — просто проігноруйте цей лист.",
    cta: "Скинути пароль",
    expire: "Посилання дійсне 1 годину.",
  },
  en: {
    preview: "Password reset — Astraly",
    heading: "Password reset",
    body: "Someone requested a password reset for your Astraly account. If this wasn't you, just ignore this email.",
    cta: "Reset password",
    expire: "This link expires in 1 hour.",
  },
};

interface Props {
  resetUrl: string;
  locale?: "ru" | "uk" | "en";
}

export default function PasswordReset({ resetUrl, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview}>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>🔑</div>
        <Text style={styles.heading}>{t.heading}</Text>
        <Text style={styles.paragraph}>{t.body}</Text>
        <Link href={resetUrl} style={styles.button}>{t.cta}</Link>
        <Text style={{ ...styles.paragraph, marginTop: "16px", fontSize: "12px" }}>
          {t.expire}
        </Text>
      </Section>
    </EmailLayout>
  );
}
