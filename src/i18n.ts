import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

// Re-export for backward compat with existing imports
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type { Locale };

export default getRequestConfig(async ({ requestLocale }) => {
  // v4 API: requestLocale is a Promise
  let locale = await requestLocale;

  // Fall back to default if locale is invalid
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // Static imports so webpack can bundle all locale files
  const messages =
    locale === "ru"
      ? (await import("../messages/ru.json")).default
      : locale === "uk"
        ? (await import("../messages/uk.json")).default
        : locale === "pl"
          ? (await import("../messages/pl.json")).default
          : (await import("../messages/en.json")).default;

  return { locale, messages };
});
