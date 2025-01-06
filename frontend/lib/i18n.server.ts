import cookie from "cookie";
import resourcesToBackend from "i18next-resources-to-backend";
import { RemixI18Next } from "remix-i18next/server";
import { enTranslation, jaTranslation, languages } from "./translations.ts";

export const i18n = new RemixI18Next({
  detection: languages,
  backend: resourcesToBackend({
    ja: jaTranslation,
    en: enTranslation,
  }),
  i18next: {
    fallbackNS: "root",
  },
});

export const detectLocale = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader || "");
  if (cookies.locale && languages.supportedLanguages.includes(cookies.locale)) {
    return cookies.locale;
  }
  const locale = await i18n.getLocale(request);
  return locale;
};
