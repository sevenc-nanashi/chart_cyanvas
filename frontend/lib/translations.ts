import jaTranslations from "~/i18n/ja.yml";
import enTranslations from "~/i18n/en.yml";
import type { Resource } from "i18next";

const parseTranslations: (
  translations: Record<string, string | unknown>,
) => Resource = (translations) => {
  const parsedTranslations: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(translations)) {
    if (typeof value === "object") {
      parsedTranslations[key] = value;
    }
  }
  parsedTranslations.root = translations;
  return parsedTranslations as unknown as Resource;
};

export const jaTranslation = parseTranslations(jaTranslations);
export const enTranslation = parseTranslations(enTranslations);

export const languages = {
  supportedLanguages: ["ja", "en"],
  fallbackLanguage: "en",
};
