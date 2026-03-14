import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, styles } from "./Layout";

const copy = {
  ru: {
    preview: (sign: string) => `Гороскоп на сегодня — ${sign} ✦`,
    heading: (sign: string) => `${sign} — гороскоп на сегодня ✦`,
    cta: "Обсудить с астрологом",
  },
  uk: {
    preview: (sign: string) => `Гороскоп на сьогодні — ${sign} ✦`,
    heading: (sign: string) => `${sign} — гороскоп на сьогодні ✦`,
    cta: "Обговорити з астрологом",
  },
  en: {
    preview: (sign: string) => `Today's horoscope — ${sign} ✦`,
    heading: (sign: string) => `${sign} — today's horoscope ✦`,
    cta: "Discuss with astrologer",
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

interface HoroscopeSection {
  title: string;
  content: string;
}

interface Props {
  sunSign: string;
  date: string;
  sections: HoroscopeSection[];
  locale?: "ru" | "uk" | "en";
}

export default function DailyHoroscope({ sunSign, date, sections, locale = "ru" }: Props) {
  const t = copy[locale] ?? copy.ru;

  return (
    <EmailLayout preview={t.preview(sunSign)} settingsLink>
      <Section style={{ textAlign: "center" }}>
        <div style={styles.iconCircle}>🔮</div>
        <Text style={styles.heading}>{t.heading(sunSign)}</Text>
        <Text style={{ ...styles.paragraph, fontSize: "12px" }}>{date}</Text>
      </Section>

      {sections.map((section, i) => (
        <Section key={i} style={{ padding: "0 4px", marginBottom: "16px" }}>
          <Text style={{
            fontSize: "13px",
            fontWeight: 600,
            color: styles.cosmic,
            margin: "0 0 4px",
            textTransform: "uppercase" as const,
            letterSpacing: "0.5px",
          }}>
            {section.title}
          </Text>
          <Text style={{ ...styles.paragraph, margin: "0" }}>
            {section.content}
          </Text>
        </Section>
      ))}

      <Section style={{ textAlign: "center", marginTop: "8px" }}>
        <Link href={`${APP_URL}/app/chat`} style={styles.button}>{t.cta}</Link>
      </Section>
    </EmailLayout>
  );
}
