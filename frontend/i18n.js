/* eslint-disable @typescript-eslint/no-var-requires */
const workaround = require("next-translate/lib/cjs/plugin/utils.js")

// https://github.com/aralroca/next-translate/issues/851
workaround.defaultLoader = `
async (lang, ns) => {
const m = await import(\`i18n/\${lang}.yml\`)
if (ns === "common") {
  return m.default
}
return m.default[ns]
}`

/** @type {import("next-translate").I18nConfig} */
module.exports = {
  locales: ["default", "en", "ja"],
  defaultLocale: "default",
  localeDetection: true,
  defaultNS: "common",
  logger: () => {
    null
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

    "/info/[file]": ["pages"],

    "/admin": ["admin"],
  },
}
