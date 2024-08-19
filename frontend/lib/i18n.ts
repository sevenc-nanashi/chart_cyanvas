import resourcesToBackend from "i18next-resources-to-backend";
import { RemixI18Next } from "remix-i18next/server";
import { enTranslation, jaTranslation } from "./translations.ts";

export const i18n = new RemixI18Next({
  detection: { supportedLanguages: ["ja", "en"], fallbackLanguage: "en" },
  backend: resourcesToBackend({
    ja: jaTranslation,
    en: enTranslation,
  }),
  i18next: {
    fallbackNS: "root",
  },
});
