import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Chart Cyanvas",
  description: "A sekai custom chart platform.",
  base: "/wiki/",
  vite: {
    server: {
      port: 3101,
    },
  },

  locales: {
    root: {
      label: "日本語",
      lang: "ja",
      link: "/",
      themeConfig: {
        // 日本語版のUI翻訳
        outlineTitle: "このページについて",
        darkModeSwitchLabel: "ダークモード",
        sidebarMenuLabel: "メニュー",
        returnToTopLabel: "トップへ戻る",
        langMenuLabel: "言語を変更",

        nav: [{ text: "トップ", link: "/" }],

        sidebar: [
          { text: "ガイドライン", link: "/guideline" },
          { text: "譜面の公開", link: "/publishing" },
          { text: "SUS拡張仕様", link: "/sus-extended-features" },
          { text: "寄付", link: "/donation" },
        ],
      },
    },
    en: {
      label: "English",
      lang: "en",
      link: "/en/",
      themeConfig: {
        nav: [{ text: "Home", link: "/en/" }],
        sidebar: [
          { text: "Guideline", link: "/en/guideline" },
          { text: "Publishing a chart", link: "/en/publishing" },
          { text: "Extended SUS features", link: "/en/sus-extended-features" },
          { text: "Donation", link: "/en/donation" },
        ],
      },
    },
  },

  themeConfig: {
    // 共通設定
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/sevenc-nanashi/chart_cyanvas",
      },
      {
        icon: "discord",
        link: "https://discord.gg/2NP3U3r8Rz",
      },
      {
        icon: "patreon",
        link: "https://www.patreon.com/sevenc_nanashi",
      },
    ],

    externalLinkIcon: true,
  },
});
