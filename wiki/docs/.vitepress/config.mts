import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Chart Cyanvas Docs",
  description: "A sekai custom chart platform.",
  base: "/wiki/",
  vite: {
    server: {
      port: 3101,
    },
  },
  cleanUrls: true,
  markdown: {
    breaks: true,
  },

  locales: {
    ja: {
      label: "日本語",
      lang: "ja",
      link: "/ja/",
      themeConfig: {
        outline: {
          label: "目次",
        },
        darkModeSwitchLabel: "テーマ",
        darkModeSwitchTitle: "ダークモード",
        lightModeSwitchTitle: "ライトモード",
        docFooter: {
          next: "次のページ",
          prev: "前のページ",
        },
        sidebarMenuLabel: "メニュー",
        returnToTopLabel: "トップへ戻る",
        langMenuLabel: "言語を変更",
        notFound: {
          linkText: "トップページへ戻る",
          title: "ページが見つかりません",
          quote: "お探しのページは存在しないか、削除された可能性があります。",
        },
        footer: {
          copyright: "© 2022-2025, Nanashi. <https://sevenc7c.com>",
          message: "Chart Cyanvas - A sekai custom chart platform.",
        },
        lastUpdated: {
          text: "最終更新日",
        },

        nav: [{ text: "トップ", link: "/ja/" }],

        sidebar: [
          { text: "譜面の公開", link: "/ja/publishing" },
          { text: "ガイドライン", link: "/ja/guideline" },
          { text: "寄付", link: "/ja/donation" },
          { text: "SUS拡張仕様", link: "/ja/sus-extended-features" },

          { text: "Community Wiki", link: "https://wikiwiki.jp/chcy-user" },
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
          { text: "Publishing a chart", link: "/en/publishing" },
          { text: "Guideline", link: "/en/guideline" },
          { text: "Donation", link: "/en/donation" },
          { text: "Extended SUS features", link: "/en/sus-extended-features" },
        ],
      },
    },
  },

  themeConfig: {
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

    logo: "/logo.svg",
  },
});
