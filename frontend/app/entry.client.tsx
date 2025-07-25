import i18next from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import { enTranslation, jaTranslation, languages } from "~/lib/translations";
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
        <HydratedRouter />
      </I18nextProvider>
    </StrictMode>,
  );
});
