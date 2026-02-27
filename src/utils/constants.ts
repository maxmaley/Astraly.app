export const LOCALES = ["ru", "uk", "en"] as const;
export const DEFAULT_LOCALE = "ru";

export const SUBSCRIPTION_TIERS = {
  free: {
    id: "free",
    name: { ru: "Звёздный свет", uk: "Зоряне світло", en: "Starlight" },
    price: 0,
    tokens: 5_000,
    model: "deepseek-v3",
  },
  moonlight: {
    id: "moonlight",
    name: { ru: "Лунный свет", uk: "Місячне світло", en: "Moonlight" },
    price: 3.99,
    tokens: 50_000,
    model: "deepseek-v3",
  },
  solar: {
    id: "solar",
    name: { ru: "Солнечный оракул", uk: "Сонячний оракул", en: "Solar Oracle" },
    price: 5.99,
    tokens: 100_000,
    model: "claude-sonnet-4-6",
    popular: true,
  },
  cosmic: {
    id: "cosmic",
    name: { ru: "Космический разум", uk: "Космічний розум", en: "Cosmic Mind" },
    price: 17.99,
    tokens: 200_000,
    model: "claude-sonnet-4-6",
  },
} as const;

export const PLANETS = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
] as const;

export const ZODIAC_SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const CHAT_SUGGESTIONS = {
  ru: [
    { label: "💑 Совместимость", prompt: "Расскажи мне о совместимости с другими знаками" },
    { label: "❤️ Любовь", prompt: "Что говорят звёзды о моей любовной жизни?" },
    { label: "💼 Карьера", prompt: "Что ждёт меня в карьере по натальной карте?" },
    { label: "💰 Финансы", prompt: "Каков мой финансовый потенциал по карте?" },
    { label: "🌙 Сегодня", prompt: "Что говорят планеты о сегодняшнем дне?" },
  ],
  uk: [
    { label: "💑 Сумісність", prompt: "Розкажи мені про сумісність з іншими знаками" },
    { label: "❤️ Кохання", prompt: "Що кажуть зірки про моє кохання?" },
    { label: "💼 Кар'єра", prompt: "Що чекає мене в кар'єрі за натальною картою?" },
    { label: "💰 Фінанси", prompt: "Який мій фінансовий потенціал за картою?" },
    { label: "🌙 Сьогодні", prompt: "Що кажуть планети про сьогоднішній день?" },
  ],
  en: [
    { label: "💑 Compatibility", prompt: "Tell me about my compatibility with other signs" },
    { label: "❤️ Love", prompt: "What do the stars say about my love life?" },
    { label: "💼 Career", prompt: "What does my natal chart say about my career?" },
    { label: "💰 Finance", prompt: "What is my financial potential according to my chart?" },
    { label: "🌙 Today", prompt: "What do the planets say about today?" },
  ],
};

export const TOKEN_LIMITS = {
  free: 5_000,
  moonlight: 50_000,
  solar: 100_000,
  cosmic: 200_000,
};
