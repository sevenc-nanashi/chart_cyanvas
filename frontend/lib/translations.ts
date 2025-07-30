import type { Resource } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { languageNames as languageNames_ } from "./languageNames.macro.ts" with {
  type: "macro",
};

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

const translations = import.meta.glob<Record<string, string | unknown>>(
  "~/i18n/*.yml",
  {
    import: "default",
  },
);
const translationMap = Object.fromEntries(
  Object.entries(translations).map(([key, value]) => {
    const lang = key.match(/\/([a-z]{2})\.yml$/)?.[1];
    if (!lang) {
      throw new Error(`Invalid language file: ${key}`);
    }
    return [lang, value];
  }),
);

export const lazyLoadBackend = resourcesToBackend(
  async (language: string, namespace: string) => {
    const translation = translationMap[language];
    if (!translation) {
      return {};
    }
    const data = await translation();
    const parsed = parseTranslations(data);
    return parsed[namespace] || {};
  },
);

export const languageNames = languageNames_;
export const languages = {
  supportedLanguages: Object.keys(languageNames),
  fallbackLanguage: "en",
};
