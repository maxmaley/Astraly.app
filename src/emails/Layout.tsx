import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://astraly.app";

/* ── Brand colors ── */
const bg       = "#0c0a1a";
const card     = "#141028";
const border   = "#2a2445";
const text     = "#e8e4f0";
const muted    = "#8b85a0";
const cosmic   = "#a78bfa";

const main: React.CSSProperties = {
  backgroundColor: bg,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "40px 20px 32px",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: card,
  border: `1px solid ${border}`,
  borderRadius: "16px",
  padding: "32px 28px",
};

const logoRow: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoText: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: text,
  letterSpacing: "-0.3px",
};

const logoAccent: React.CSSProperties = {
  color: cosmic,
};

const footerStyle: React.CSSProperties = {
  textAlign: "center" as const,
  marginTop: "28px",
  padding: "0 8px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: muted,
  lineHeight: "18px",
};

const footerLink: React.CSSProperties = {
  color: cosmic,
  textDecoration: "none",
};

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  settingsLink?: boolean;
}

export function EmailLayout({ preview, children, settingsLink = false }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoRow}>
            <Text style={logoText}>
              Astraly<span style={logoAccent}>.app</span>
            </Text>
          </Section>

          {/* Card */}
          <Section style={cardStyle}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Hr style={{ borderColor: border, margin: "20px 0" }} />
            {settingsLink && (
              <Text style={footerText}>
                <Link href={`${APP_URL}/app/settings#notifications`} style={footerLink}>
                  Manage notifications
                </Link>
              </Text>
            )}
            <Text style={footerText}>
              <Link href={`mailto:support@astraly.app`} style={footerLink}>
                support@astraly.app
              </Link>
            </Text>
            <Text style={{ ...footerText, marginTop: "4px" }}>
              &copy; {new Date().getFullYear()} Astraly. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/* ── Shared text styles (re-exported for templates) ── */
export const styles = {
  bg, card, border, text, muted, cosmic,
  heading: {
    fontSize: "20px",
    fontWeight: 700,
    color: text,
    margin: "0 0 8px",
    lineHeight: "28px",
  } as React.CSSProperties,
  paragraph: {
    fontSize: "14px",
    color: muted,
    lineHeight: "22px",
    margin: "0 0 16px",
  } as React.CSSProperties,
  button: {
    display: "inline-block",
    backgroundColor: cosmic,
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    padding: "12px 28px",
    borderRadius: "12px",
    textDecoration: "none",
    textAlign: "center" as const,
  } as React.CSSProperties,
  iconCircle: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "rgba(167,139,250,0.15)",
    textAlign: "center" as const,
    lineHeight: "48px",
    fontSize: "24px",
    margin: "0 auto 16px",
  } as React.CSSProperties,
};
