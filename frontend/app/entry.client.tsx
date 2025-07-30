import i18next from "i18next";
import languageDetector from "i18next-browser-languagedetector";
import i18nextIcu from "i18next-icu";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { HydratedRouter } from "react-router/dom";
import { enTranslation, jaTranslation, languages } from "~/lib/translations";
// budoux doesn't configure ESM: https://github.com/google/budoux/issues/1015
import "../node_modules/budoux/module/webcomponents/budoux-ja.js";
import "virtual:uno.css";
import "@fontsource/m-plus-1p/300.css";
import "@fontsource/m-plus-1p/400.css";
import "@fontsource/m-plus-1p/500.css";
import "@fontsource/m-plus-1p/700.css";
import "~/styles/globals.scss";
import "~/styles/reset.css";

i18next
  .use(i18nextIcu)
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
