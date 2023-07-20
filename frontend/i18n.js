/** @type {import("next-translate").I18nConfig} */
module.exports = {
  locales: ["en", "ja"],
  defaultLocale: "en",
  localeDetection: true,
  defaultNS: "common",
  logger: () => {
    null
  },

  loadLocaleFrom: async (lang, ns) => {
    const m = await import(`i18n/${lang}.yml`)
    if (ns === "common") {
      return m.default
    }
    return m.default[ns]
  },

  pages: {
    "*": ["common", "header", "menu", "chartSection", "errors"],
    "/": ["home"],
    "/login": ["login"],

    "/charts/[name]": ["chart"],
    "/charts/upload": ["upload"],
    "/charts/[name]/edit": ["upload"],
    "/charts/my": ["my"],
    "/charts/liked": ["liked"],

    "/users/[handle]": ["user"],
    "/users/alts": ["myAlts"],

    "/discord/error": ["discordError"],

    "/admin": ["admin"],
  },
}
