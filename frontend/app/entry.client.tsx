import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { enTranslation, jaTranslation, languages } from "~/lib/translations";
import languageDetector from "i18next-browser-languagedetector";
import "budoux/module/webcomponents/budoux-ja";

i18next
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(languageDetector)
  .init({
    resources: {
      ja: jaTranslation,
      en: enTranslation,
    },
    supportedLngs: languages.supportedLanguages,
    fallbackLng: languages.fallbackLanguage,
    defaultNS: "root",

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },

    detection: {
      order: ["htmlTag"],
      caches: [],
    },
  });

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <I18nextProvider i18n={i18next}>
        <RemixBrowser />
      </I18nextProvider>
    </StrictMode>,
  );
});
