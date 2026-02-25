import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "uk", "en"] as const,
  defaultLocale: "ru",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
