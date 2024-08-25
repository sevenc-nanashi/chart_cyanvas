var _a, _b;
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable, json as json$1 } from "@remix-run/node";
import { RemixServer, useNavigate, Link, Outlet, json, useRouteLoaderData, Meta, Links, ScrollRestoration, Scripts, useLoaderData, useParams, redirect } from "@remix-run/react";
import i18next, { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { initReactI18next, I18nextProvider, useTranslation, Trans } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { RemixI18Next } from "remix-i18next/server";
import cookie from "cookie";
import clsx, { clsx as clsx$1 } from "clsx";
import * as React from "react";
import { createContext, useContext, createElement, useState, useEffect, useRef, useCallback, forwardRef, useMemo, useReducer } from "react";
import { pathcat } from "pathcat";
import { DocumentAddRegular, DocumentBriefcaseRegular, HeartRegular, TagRegular, DocumentTextRegular, SignOutRegular, LockClosedRegular, ClockRegular, MusicNote2Regular, MicRegular, EditRegular, CheckboxCheckedFilled, CheckboxUncheckedRegular, InfoRegular, ArrowTurnLeftDownFilled, NumberSymbolFilled, DeleteRegular, ArrowDownloadRegular, OpenRegular, ChevronDownRegular, ChevronUpRegular, CheckmarkRegular, ImageRegular, DocumentRegular } from "@fluentui/react-icons";
import { createPortal } from "react-dom";
import { WithOutContext } from "react-tag-input";
import __cjsInterop1__ from "react-range";
import * as RadixSelect from "@radix-ui/react-select";
import { useChangeLanguage } from "remix-i18next/react";
const data$1 = {
  name: "Chart Cyanvas",
  close: "閉じる",
  cancel: "キャンセル",
  backToHome: "トップへ戻る",
  serverError: "サーバーでエラーが発生しました！",
  serverErrorNote: "<0>Discordサーバー</0>に報告してください。",
  openInSonolus: "Sonolus",
  adminDecorate: "（管理者）",
  notFound: {
    title: "Not Found",
    heading: "404 Not Found",
    description: "お探しのページは存在しません。"
  },
  header: { login: {
    button: "ログイン",
    title: "ログイン中...",
    description: "Sonolusアカウントでログインしてください。\nログイン後、このページは自動的に更新されます。\nポップアップが表示されない場合は、<0>ここをクリックしてください。</0>\n"
  } },
  home: {
    newCharts: "新着譜面",
    welcome: "Chart Cyanvasへようこそ！初めての方は<0>初めての方へ</0>を参照して下さい。"
  },
  menu: {
    post: "譜面投稿",
    my: "自分の譜面",
    liked: "高評価した譜面",
    myAlts: "名義の管理",
    guideline: "ガイドライン",
    logout: "ログアウト"
  },
  chart: {
    notFound: "譜面が見付かりませんでした。",
    variants: "派生譜面",
    sameAuthor: "同じ作者の譜面",
    edit: "編集",
    "delete": "削除",
    download: "譜面をDL",
    deletionModal: {
      title: "譜面を削除しますか？",
      description: "削除した譜面は復元できません！",
      warnAuthor: "譜面作者に警告をする",
      warnReason: "警告理由",
      ok: "削除"
    }
  },
  user: {
    totalCharts: "総譜面数：{{count}}",
    totalLikes: "総高評価数：{{count}}",
    userCharts: "この作者の譜面"
  },
  chartSection: { notFound: "譜面が見付かりませんでした。" },
  my: {
    title: "自分の譜面",
    empty: "まだ譜面を投稿していません。<0>譜面投稿</0>から投稿してみましょう！",
    description: "投稿した譜面はここに表示されます。鍵マークがついている譜面は、自分以外の人には見えません。"
  },
  liked: {
    title: "高評価した譜面",
    empty: "まだ高評価した譜面がありません。",
    description: "高評価した譜面はここに表示されます。Sonolusで譜面を開いて、下にスクロールすると出てくるハートマークを押すことで高評価できます。"
  },
  upload: {
    title: "譜面投稿",
    titleEdit: "譜面編集：{{title}}",
    description: "譜面を投稿する前に、<0>投稿ガイドライン</0>を必ずお読みください。\n",
    discordInfo: {
      description: "譜面を投稿するには、Discordアカウントと連携する必要があります。",
      status: {
        label: "連携状態：",
        connected: "連携済み（{{username}}）",
        notConnected: "未連携"
      },
      connectGuide: "連携方法"
    },
    param: {
      title: "タイトル",
      composer: "作曲者",
      artist: "ボーカル",
      rating: "難易度",
      variant: "派生元譜面",
      description: "説明",
      cover: "ジャケット",
      chart: "譜面",
      bgm: "音源",
      tags: "タグ",
      author: "譜面作者"
    },
    tooltip: {
      rating: "1から99までを指定できます。40より大きい譜面を指定する場合は、右の入力欄から直接入力してください。",
      variant: "派生元譜面のIDを指定して下さい。派生元譜面の概要欄に表示されます。難易度差分などの譜面は派生元譜面を指定してください。",
      tags: "スペース、カンマ、改行でタグを追加できます。最大5個まで。"
    },
    visibility: {
      title: "公開設定",
      "public": "一般公開",
      scheduled: "予約公開",
      "private": "非公開",
      description: {
        "public": "トップやSonolusサーバー上に表示されます。\n",
        scheduled: "指定した時刻以降になると公開されます。\n",
        "private": "「テスト中」表示でしか表示されません。\nURLを共有することで、他の人にも見せることができます。\n"
      }
    },
    dndHint: "ファイルはドラッグ&ドロップでもアップロードできます。ジャケット・音源・譜面を同時にアップロードすることもできます。",
    isChartPublic: "譜面ファイルを公開する",
    submit: "アップロード",
    update: "更新",
    publish: "公開",
    unpublish: "非公開",
    optional: "（任意）",
    dropHere: "ドロップしてアップロード",
    unUploadedFiles: "対応していないファイルがドロップされました。",
    unUploadedFilesNote: ".sus、.usc、.json、.mp3、.wav、.ogg、.png、.jpg、.jpegのみ対応しています。",
    filesTooLarge: "ファイルが大きすぎます。",
    filesTooLargeNote: "ファイルは合計で最大20MBまでです。",
    publishModal: {
      title: "以上の内容で公開しますか？",
      description: "この譜面は…",
      check0: "オリジナリティがあり、（既存譜面の丸写しなどは禁止されています）",
      check1: "完成していて、（未完成の譜面は公開しないでください）",
      check2: "曲の規約に反していない、（例えば、某超感覚リズムゲーム、某達人の曲は二次創作が禁止されています）",
      check3: "宗教的・政治的・性的な内容を含まない",
      description2: "譜面です。<0>ガイドライン</0>に違反する譜面は削除され、投稿者に対して警告が行われます。",
      ok: "公開する"
    }
  },
  errors: {
    cannotBeEmpty: "この項目は空にできません。",
    tooLong: "項目が長すぎます。",
    variantNotFound: "派生元譜面が見付かりませんでした。"
  },
  admin: {
    title: "管理者ページ",
    stats: {
      title: "統計",
      users: {
        title: "ユーザー",
        total: "総数",
        original: "本名義",
        alt: "別名義",
        discord: "Discord連携済"
      },
      charts: {
        title: "譜面",
        "public": "公開",
        "private": "非公開"
      },
      files: "ファイル",
      storage: "ストレージ",
      db: {
        title: "データベース",
        connections: "使用中：{{busy}}、待機中：{{waiting}} / 最大：{{size}}"
      }
    },
    sidekiq: {
      title: "ジョブ（Sidekiq）",
      description: "バックグラウンドジョブの状態を確認できます。"
    },
    actions: {
      title: "コマンド",
      expireData: {
        title: "譜面データを失効",
        description: "すべての譜面データを失効させます。次の更新、または譜面のプレイ時に再生成されます。\nエンジンの仕様が変更された場合などに使用してください。\n",
        button: "失効",
        success: "{{count}}個の譜面データを失効させました。"
      }
    }
  },
  myAlts: {
    title: "別名義一覧",
    description: "ここから別名義を管理できます。",
    mobileDescription: "技術的な理由により、追加・編集・削除はPCから行う必要があります。",
    empty: "まだ名義がありません。",
    add: "作成",
    "delete": "削除",
    edit: "編集",
    save: "保存",
    cancel: "キャンセル",
    namePlaceholder: "名前を入力（4～16文字）",
    deletionModal: {
      title: "名義を削除",
      description: "この名義を削除しますか？",
      nameChangeWarning: "この名義で投稿された{{count}}個の譜面の名義は「{{currentUser}}」に変更されます。",
      ok: "削除"
    },
    errors: {
      tooShort: "名前が短すぎます。",
      tooLong: "名前が長すぎます。"
    }
  },
  discordError: {
    title: "連携エラー",
    description: "Discordとの連携に失敗しました（{{code}}）。",
    error: {
      discordError: "Discordとの通信に失敗しました",
      notInGuild: "サーバーに参加していません",
      unknown: "不明なエラーが発生しました"
    }
  },
  login: { title: "ログイン" }
};
const data = {
  name: "Chart Cyanvas",
  close: "Close",
  cancel: "Cancel",
  backToHome: "Return to top page",
  serverError: "An error occurred on the server!",
  serverErrorNote: "Please let us know <0>on our Discord server</0>.",
  openInSonolus: "Sonolus",
  adminDecorate: " (Admin)",
  notFound: {
    title: "Not Found",
    heading: "404 Not Found",
    description: "The page you are looking for does not exist."
  },
  header: { login: {
    button: "Log in",
    title: "Logging in...",
    description: "Log in with your Sonolus account.<br/>\nThis page will be refreshed automatically after logging in.<br/>\nDidn't get a popup? <0>Click here.</0>\n"
  } },
  home: {
    newCharts: "New charts",
    welcome: "Welcome to Chart Cyanvas! If you are new to this site, please read <0>How to use</0>."
  },
  menu: {
    post: "Post chart",
    my: "My charts",
    liked: "Liked charts",
    myAlts: "My alts",
    guideline: "Guideline",
    logout: "Log out"
  },
  chart: {
    notFound: "Couldn't find the chart.",
    variants: "Variants",
    sameAuthor: "Charts by the same author",
    edit: "Edit",
    "delete": "Delete",
    download: "Download chart",
    deletionModal: {
      title: "Delete this chart?",
      description: "Deleted charts cannot be restored!",
      warnAuthor: "Warn the author",
      warnReason: "Reason for warning",
      ok: "Delete"
    }
  },
  user: {
    totalCharts: "Total charts: {{count}}",
    totalLikes: "Total likes: {{count}}",
    userCharts: "Charts by this author"
  },
  chartSection: { notFound: "No charts found." },
  my: {
    title: "My charts",
    empty: "You haven't posted any charts yet. <0>Post a chart</0> to get started!",
    description: "Your charts are listed below. Padlock icon means the chart is private."
  },
  liked: {
    title: "Liked charts",
    empty: "You haven't liked any charts yet. ",
    description: 'Charts you liked are listed below.\nYou can like a chart by clicking the heart icon in "Recommended" section in sonolus.\n'
  },
  upload: {
    title: "Post chart",
    titleEdit: "Edit chart: {{title}}",
    description: "Read <0>Guideline</0> before posting a chart. You can upload files by dragging and dropping them here.",
    discordInfo: {
      description: "You need to link your Discord account to post a chart.",
      status: {
        label: "You have: ",
        connected: "Linked ({{username}})",
        notConnected: "Not linked"
      },
      connectGuide: "How to link your Discord account"
    },
    param: {
      title: "Title",
      composer: "Composer",
      artist: "Vocal",
      rating: "Difficulty",
      variant: "Variant of",
      description: "Description",
      cover: "Cover image",
      chart: "Chart file",
      bgm: "BGM file",
      tags: "Tags",
      author: "Author"
    },
    tooltip: {
      rating: "You can select difficulty from 1 to 99. Use the input box beside the slider to set difficulty more than 40.\n",
      variant: "If this chart is a variant of another chart, select it here.\nYour chart will be linked to the original chart.\nYou should set if the chart is a another difficulty of the original chart.\n",
      tags: "Separate tags with spaces, commas, or newlines. Maximum 5 tags.\n"
    },
    visibility: {
      title: "Visibility",
      "public": "Public",
      scheduled: "Scheduled",
      "private": "Private",
      description: {
        "public": "Anyone can see this chart. The chart will be listed in chart list.",
        scheduled: "Only you can see this chart until the scheduled date.",
        "private": "Only you can see this chart. Share the URL to let others see it."
      }
    },
    dndHint: "Click or drag files to upload. You can drop multiple files at once.",
    isChartPublic: "Allow others to download the chart file",
    submit: "Upload",
    update: "Update",
    publish: "Publish",
    unpublish: "Unpublish",
    optional: " (optional)",
    dropHere: "Drop to upload",
    unUploadedFiles: "Some files were not uploaded.",
    unUploadedFilesNote: "Supported files: .sus, .usc, .mp3, .ogg, .wav, .jpg, .jpeg, .png, .gif",
    filesTooLarge: "Files are too large",
    filesTooLargeNote: "The sum of the file sizes must be less than 20MB.",
    publishModal: {
      title: "Publish this chart?",
      description: "This chart...",
      check0: "has originality, (Do not publish a copy of existing chart)",
      check1: "is completed, (Do not publish unfinished charts)",
      check2: "uses music that allows fanmade charts, (FYI, songs of these games don't allow making fanmade charts: A new dimension rhythm game, A tatsujin)",
      check3: "has no regligious, political, sexual or other inappropriate content",
      description2: "Any chart that violates the <0>guideline</0> will be deleted, and the author will be warned or banned.",
      ok: "Publish"
    }
  },
  errors: {
    cannotBeEmpty: "This field cannot be empty.",
    tooLong: "This field is too long.",
    variantNotFound: "Couldn't find the chart you selected as variant."
  },
  myAlts: {
    title: "My alts",
    description: "Your alt users are listed below.",
    mobileDescription: "Due to technical limitations, you cannot edit your alt users on mobile devices.\nPlease use a desktop browser to edit your alt users.\n",
    empty: "You haven't registered any alt users yet.",
    add: "Add",
    "delete": "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    namePlaceholder: "Type name here... (4-16 characters)",
    deletionModal: {
      title: "Delete this alt user?",
      description: "Deleted alt users cannot be restored!",
      nameChangeWarning: {
        one: "You have {{count}} chart which belongs to this alt user.\nIf you delete this alt user, the chart will be changed to your main user.\n",
        other: "You have {{count}} charts which belong to this alt user.\nIf you delete this alt user, the charts will be changed to your main user.\n"
      },
      ok: "Delete"
    },
    errors: {
      tooShort: "The name is too short.",
      tooLong: "The name is too long."
    }
  },
  admin: {
    title: "Admin",
    stats: {
      title: "Stats",
      users: {
        title: "Users",
        total: "Total",
        original: "Original",
        alt: "Alt",
        discord: "With Discord"
      },
      charts: {
        title: "Charts",
        "public": "Public",
        "private": "Private"
      },
      files: "Files",
      storage: "Storage",
      db: {
        title: "Database",
        connections: "{{busy}} busy, {{waiting}} waiting / {{size}} max"
      }
    },
    sidekiq: {
      title: "Jobs (Sidekiq)",
      description: "You can see the status of background jobs here."
    },
    actions: {
      title: "Commands",
      expireData: {
        title: "Expire chart data",
        description: "Expire all chart data. They will be regenerated on next update or play.\nUse this when the engine is updated.\n",
        button: "Expire",
        success: "{{count}} chart data expired."
      }
    }
  },
  discordError: {
    title: "Integration failed",
    description: "Failed to integrate with Discord. ({{code}})\n",
    error: {
      discordError: "Discord API error",
      notInGuild: "You are not in the server",
      unknown: "Unknown error"
    }
  },
  login: { title: "Log in" }
};
const parseTranslations = (translations) => {
  const parsedTranslations = {};
  for (const [key, value] of Object.entries(translations)) {
    if (typeof value === "object") {
      parsedTranslations[key] = value;
    }
  }
  parsedTranslations.root = translations;
  return parsedTranslations;
};
const jaTranslation = parseTranslations(data$1);
const enTranslation = parseTranslations(data);
const languages = {
  supportedLanguages: ["ja", "en"],
  fallbackLanguage: "en"
};
const i18n = new RemixI18Next({
  detection: languages,
  backend: resourcesToBackend({
    ja: jaTranslation,
    en: enTranslation
  }),
  i18next: {
    fallbackNS: "root"
  }
});
const detectLocale = async (request) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader || "");
  if (languages.supportedLanguages.includes(cookies.locale)) {
    return cookies.locale;
  }
  const locale = await i18n.getLocale(request);
  return locale;
};
const ABORT_DELAY = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  const lng = await i18n.getLocale(request);
  const ns = i18n.getRouteNamespaces(remixContext);
  const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";
  const instance = createInstance();
  await instance.use(initReactI18next).init({
    lng,
    // The locale we detected above
    ns,
    // The namespaces the routes about to render want to use
    resources: {
      ja: jaTranslation,
      en: enTranslation
    },
    fallbackLng: "en",
    defaultNS: "root"
  });
  return new Promise((resolve, reject) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(I18nextProvider, { i18n: instance, children: /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }) }),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          didError = true;
          console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
const favicon = "/assets/favicon-DKZk3_V7.svg";
const Footer = () => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    "footer",
    {
      className: clsx(
        "bg-slate-300 dark:bg-slate-600 flex items-center h-20 align-center justify-center text-white dark:text-slate-300 text-sm",
        "flex flex-col md:gap-2",
        "[&_a]text-blue-500 [&_a]dark:text-theme"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:gap-2 items-center", children: [
          /* @__PURE__ */ jsx("div", { children: "Chart Cyanvas - A sekai custom chart platform." }),
          /* @__PURE__ */ jsxs("div", { children: [
            "© 2022-2024,",
            " ",
            /* @__PURE__ */ jsx("a", { target: "_blank", rel: "noreferrer", href: "https://sevenc7c.com", children: "Nanashi. <sevenc-nanashi>" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
          /* @__PURE__ */ jsx(
            "a",
            {
              target: "_blank",
              rel: "noopener noreferrer",
              href: "https://github.com/sevenc-nanashi/chart_cyanvas",
              children: "GitHub"
            }
          ),
          " ",
          "|",
          /* @__PURE__ */ jsx(
            "a",
            {
              target: "_blank",
              rel: "noopener noreferrer",
              href: "https://discord.gg/2NP3U3r8Rz",
              children: "Discord"
            }
          ),
          " ",
          "|",
          /* @__PURE__ */ jsx(
            "a",
            {
              target: "_blank",
              rel: "noopener noreferrer",
              href: "https://www.patreon.com/sevenc_nanashi",
              children: "Patreon"
            }
          )
        ] })
      ]
    }
  ) });
};
const SvgLogoCf = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", xmlSpace: "preserve", width: 512, height: 512, ...props }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "a", d: "M1 0h256v512H1z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "b" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#a", overflow: "visible" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#b)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "c", d: "M429 120H103v178h326zM1 0h265v512H1z" }))), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "d", d: "M1 0h256v512H1z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "e" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#d", overflow: "visible" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 20, d: "M116 404h140", clipPath: "url(#e)" }), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#e)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "f", d: "M429 120H103v178h326zM1 0h265v512H1z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "g" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#f", overflow: "visible" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 30, d: "M96.271 476 209.75 73", clipPath: "url(#g)" }), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 20, d: "M256 404V46", clipPath: "url(#g)" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeMiterlimit: 10, strokeWidth: 15, d: "M139.5 126v180", clipPath: "url(#e)" }), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#e)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M116.271 109.297h311.71c11 0 20 9 20 20V301.9c0 11-9 20-20 20h-311.71c-11 0-20-9-20-20V129.297c0-11 9-20 20-20M116.4 298h298.8v-1.674c7.456-2.913 12.781-10.168 12.781-18.623V149.297c0-8.455-5.325-15.71-12.781-18.623V129H116.4z" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 24, d: "M256 311H86", clipPath: "url(#e)" }), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "h", d: "M1 0h256v512H1z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "i" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#h", overflow: "visible" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#i)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "j", d: "M429 120H103v178h326zM1 0h265v512H1z" }))), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "k", d: "M255 0h256v512H255z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "l" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#k", overflow: "visible" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#l)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "m", d: "M83 120h326v178H83zM511 0H246v512h265z" }))), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "n", d: "M255 0h256v512H255z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "o" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#n", overflow: "visible" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 20, d: "M396 404H256", clipPath: "url(#o)" }), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#o)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "p", d: "M83 120h326v178H83zM511 0H246v512h265z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "q" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#p", overflow: "visible" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 30, d: "M415.729 476 302.25 73", clipPath: "url(#q)" }), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 20, d: "M256 404V46", clipPath: "url(#q)" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeMiterlimit: 10, strokeWidth: 15, d: "M372.5 126v180", clipPath: "url(#o)" }), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#o)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M395.729 109.297H84.019c-11 0-20 9-20 20V301.9c0 11 9 20 20 20h311.71c11 0 20-9 20-20V129.297c0-11-9-20-20-20M395.6 298H96.8v-1.674c-7.456-2.913-12.781-10.168-12.781-18.623V149.297c0-8.455 5.326-15.71 12.781-18.623V129h298.8z" })), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeMiterlimit: 10, strokeWidth: 24, d: "M256 311h170", clipPath: "url(#o)" }), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "r", d: "M255 0h256v512H255z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "s" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#r", overflow: "visible" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#s)" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "t", d: "M83 120h326v178H83zM511 0H246v512h265z" }))), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("path", { id: "u", d: "M115 129h280v169H115z" })), /* @__PURE__ */ React.createElement("clipPath", { id: "v" }, /* @__PURE__ */ React.createElement("use", { xlinkHref: "#u", overflow: "visible" })), /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "m359.818 330.229-50.318-.774L239.603 359h55.13zM361.677 215h-53.161s-86.633 8.203-86.633 27.681S308.516 272 308.516 272h53.161s-88.488-9.09-88.603-28.91c-.115-19.896 88.603-28.09 88.603-28.09M151 156h53.162s86.633 8.203 86.633 27.681S204.162 213 204.162 213H151s88.489-9.09 88.603-28.91C239.718 164.195 151 156 151 156", clipPath: "url(#v)", opacity: 0.75 }), /* @__PURE__ */ React.createElement("path", { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeMiterlimit: 10, strokeWidth: 9, d: "m350.356 318.257-13.29-7.784-13.292 7.784M351.148 201.434l-9.291-11.099-15.685 3.532M162.514 140.795l9.29-11.099 15.687 3.532", clipPath: "url(#v)" }), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M361 390a5 5 0 0 1-5 5h-42a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M206 390a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M206 347a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M206 303a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M223 275a5 5 0 0 1-5 5h-62a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h62a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M363 156a5 5 0 0 1-5 5h-59a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h59a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M295 362a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M361 333a5 5 0 0 1-5 5h-42a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M361 275a5 5 0 0 1-5 5h-42a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M206 216a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M207 156a5 5 0 0 1-5 5h-45a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h45a5 5 0 0 1 5 5z" })), /* @__PURE__ */ React.createElement("g", { clipPath: "url(#v)" }, /* @__PURE__ */ React.createElement("path", { fill: "currentColor", d: "M361 216a5 5 0 0 1-5 5h-42a5 5 0 0 1-5-5v-5a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5z" })));
const SessionContext = createContext(void 0);
const ServerSettingsContext = createContext(void 0);
const ServerErrorContext = createContext(
  () => {
  }
);
const useSession = () => {
  return useContext(SessionContext);
};
const useSetServerError = () => {
  const setServerError = useContext(ServerErrorContext);
  return setServerError;
};
const useServerSettings = () => {
  const serverSettings = useContext(ServerSettingsContext);
  if (!serverSettings) {
    throw new Error("Server settings not found");
  }
  return serverSettings;
};
const SideMenu = ({ close }) => {
  const session = useSession();
  const { t } = useTranslation("menu");
  const navigate = useNavigate();
  if (!session || !session.loggedIn) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "top-0 left-0 right-0 h-[100lvh] fixed bg-slate-900 dark:bg-black bg-opacity-20 dark:bg-opacity-40 z-50",
      onClick: close,
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "absolute right-2 top-2 min-w-64 h-[calc(100svh_-_16px)] bg-white dark:bg-slate-900 shadow-lg rounded-lg p-4 flex flex-col",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx(Link, { to: `/users/${session.user.handle}`, onClick: close, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "rounded-full w-10 h-10 mr-2",
                  style: {
                    backgroundColor: session.user.bgColor
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "font-bold text-2xl text-normal", children: [
                session.user.name,
                /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
                  "#",
                  session.user.handle
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "w-full h-[1px] my-2 bg-slate-200 dark:bg-slate-700" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col flex-grow", children: [
              {
                type: "button",
                text: t("post"),
                icon: DocumentAddRegular,
                href: "/charts/upload"
              },
              {
                type: "line"
              },
              {
                type: "button",
                text: t("my"),
                icon: DocumentBriefcaseRegular,
                href: "/charts/my"
              },
              {
                type: "button",
                text: t("liked"),
                icon: HeartRegular,
                href: "/charts/liked"
              },
              {
                type: "line"
              },
              {
                type: "button",
                text: t("myAlts"),
                icon: TagRegular,
                href: "/users/alts"
              },
              {
                type: "space"
              },
              {
                type: "button",
                text: t("guideline"),
                icon: DocumentTextRegular,
                href: `https://cc-wiki.sevenc7c.com/${i18next.language}/guideline`
              },
              {
                type: "line"
              },
              {
                type: "button",
                icon: SignOutRegular,
                text: t("logout"),
                className: "text-red-400",
                onClick: () => {
                  fetch("/api/login/session", { method: "delete" }).then(() => {
                    window.location.href = "/";
                  });
                }
              }
            ].map((item, i) => {
              switch (item.type) {
                case "line":
                  return /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "w-full h-[1px] my-2 bg-slate-100 dark:bg-slate-800"
                    },
                    i
                  );
                case "space":
                  return /* @__PURE__ */ jsx("div", { className: "min-h-4 flex-grow" }, i);
                case "button":
                  return /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: clsx(
                        "flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer",
                        item.className
                      ),
                      onClick: () => {
                        var _a2;
                        if (item.href) {
                          if (item.href.startsWith("http")) {
                            window.open(item.href, "_blank");
                          } else {
                            navigate(item.href);
                          }
                        } else {
                          (_a2 = item.onClick) == null ? void 0 : _a2.call(item);
                        }
                        close();
                      },
                      role: "button",
                      children: [
                        item.icon && /* @__PURE__ */ jsx("div", { className: "mr-2 h-6 w-6", children: createElement(item.icon, {
                          className: "h-full w-full"
                        }) }),
                        /* @__PURE__ */ jsx("div", { className: "text-lg", children: item.text })
                      ]
                    },
                    i
                  );
                default:
                  throw new Error(`Unknown item type: ${item.type}`);
              }
            }) })
          ]
        }
      )
    }
  );
};
const ModalPortal = ({ children, isOpen, close }) => {
  const [hide, setHide] = useState(true);
  useEffect(() => {
    setHide(false);
  }, []);
  if (hide) {
    return null;
  }
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-normal transition-opacity duration-200",
        style: {
          pointerEvents: isOpen ? "auto" : "none",
          opacity: isOpen ? 1 : 0
        },
        onClick: () => {
          close == null ? void 0 : close();
        },
        children: isOpen && /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4",
            onClick: (e) => e.stopPropagation(),
            children
          }
        )
      }
    ),
    document.body
  );
};
const Header = () => {
  var _a2;
  const { t } = useTranslation("header");
  const session = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [loginState, setLoginState] = useState();
  const loginUuid = useRef();
  useEffect(() => {
    if (loginState) {
      loginUuid.current = loginState.uuid;
    }
  }, [loginState]);
  const loginInterval = useRef();
  const checkLogin = useCallback(() => {
    fetch(pathcat("/api/login/status", { uuid: loginUuid.current }), {
      method: "GET"
    }).then((res) => res.json()).then((state) => {
      if (state.code === "ok") {
        window.location.reload();
      }
    });
  }, []);
  const onLogin = useCallback(() => {
    fetch("/api/login/start", { method: "POST" }).then((res) => res.json()).then((state) => {
      setLoginState({ uuid: state.uuid, url: new URL(state.url) });
      loginInterval.current = setInterval(
        checkLogin,
        2500
      );
      window.open(state.url, "_blank");
    });
  }, [checkLogin]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      ModalPortal,
      {
        isOpen: !!loginState,
        close: () => {
          setLoginState(void 0);
          clearInterval(loginInterval.current);
        },
        children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mb-2", children: t("login.title") }),
          /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsx(
            Trans,
            {
              ns: "header",
              i18nKey: "login.description",
              components: [
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: ((_a2 = loginState == null ? void 0 : loginState.url) == null ? void 0 : _a2.toString()) || "",
                    target: "_blank"
                  },
                  0
                )
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { className: "bg-theme dark:bg-gray-800 flex items-center pl-4 pr-8 h-20 shadow-sm shadow-[#83ccd288]", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center", children: [
        /* @__PURE__ */ jsx(
          SvgLogoCf,
          {
            className: "text-white dark:text-theme",
            width: "56px",
            height: "56px",
            viewBox: "0 0 512 512"
          }
        ),
        /* @__PURE__ */ jsxs("span", { className: "text-2xl md:text-4xl text-white dark:text-theme font-extrabold", children: [
          "Chart",
          /* @__PURE__ */ jsx("br", { className: "block md:hidden" }),
          /* @__PURE__ */ jsx("span", { className: "hidden md:inline", children: " " }),
          "Cyanvas",
          false
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-grow" }),
      session !== void 0 ? session.loggedIn ? /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-end text-white bg-white p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer",
          onClick: () => setShowMenu(true),
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "rounded-full w-8 h-8 md:mr-2",
                style: {
                  backgroundColor: session.user.bgColor
                }
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "font-bold text-xl text-white md:block hidden", children: [
              session.user.name,
              /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
                "#",
                session.user.handle
              ] })
            ] })
          ]
        }
      ) : /* @__PURE__ */ jsx(
        "button",
        {
          className: "p-2 px-4 rounded font-bold bg-white dark:bg-theme text-theme dark:text-slate-900 ml-2",
          onClick: onLogin,
          children: t("login.button")
        }
      ) : /* @__PURE__ */ jsx("div", { className: "p-4 w-32 rounded font-bold bg-slate-100 dark:bg-theme text-theme dark:text-slate-900 animate-pulse" })
    ] }),
    showMenu && session && session.loggedIn && /* @__PURE__ */ jsx(SideMenu, { close: () => setShowMenu(false) })
  ] });
};
const styles = "/assets/globals-DnFN426a.css";
const host = process.env.HOST;
const backendUrl = process.env.HOSTS_BACKEND;
const discordEnabled = !!process.env.DISCORD_BOT_TOKEN;
const loader$8 = async () => {
  return json({
    serverSettings: {
      discordEnabled,
      host
    }
  });
};
const links = () => {
  return [
    { rel: "icon", type: "image/svg+xml", href: favicon },
    { rel: "stylesheet", href: styles }
  ];
};
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
function Layout({ children }) {
  const loaderData = useRouteLoaderData("root");
  if (!loaderData) {
    throw new Error("Root loader data not found");
  }
  const [session, setSession] = useState(void 0);
  const [serverError, setServerError] = useState();
  const { i18n: i18n2 } = useTranslation();
  useEffect(() => {
    if (session && session.loggedIn !== void 0) {
      return;
    }
    fetch("/api/login/session", {
      method: "GET"
    }).then(async (res) => {
      const json2 = await res.json();
      if (json2.code === "ok") {
        const [altUsers, discordUser] = await Promise.all([
          fetch("/api/my/alt_users").then(
            async (res2) => (await res2.json()).users
          ),
          fetch("/api/my/discord").then(
            async (res2) => (await res2.json()).discord
          )
        ]);
        setSession({
          loggedIn: true,
          user: json2.user,
          altUsers,
          discord: discordUser
        });
      } else {
        setSession({ loggedIn: false });
      }
    });
  }, [session]);
  return /* @__PURE__ */ jsxs("html", { lang: i18n2.language, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsx("meta", { name: "theme-color", content: "#83ccd2" }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsx("body", { className: "bg-white dark:bg-slate-800 text-normal min-h-screen flex flex-col", children: /* @__PURE__ */ jsx(SessionContext.Provider, { value: session, children: /* @__PURE__ */ jsx(ServerErrorContext.Provider, { value: setServerError, children: /* @__PURE__ */ jsxs(ServerSettingsContext.Provider, { value: loaderData.serverSettings, children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsx("main", { className: "py-4 px-4 md:px-40 lg:px-60 max-w-[100vw] flex-grow", children }),
      /* @__PURE__ */ jsx(Footer, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] }) }) }) })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout,
  default: App,
  links,
  loader: loader$8
}, Symbol.toStringTag, { value: "Module" }));
const getRatingColor = (difficulty) => {
  if (difficulty < 9) return "bg-green-500 dark:bg-green-400";
  if (difficulty < 15) return "bg-blue-400";
  if (difficulty < 20) return "bg-yellow-500 dark:bg-yellow-400";
  if (difficulty < 28) return "bg-red-400";
  if (difficulty < 40) return "bg-purple-400";
  return "bg-slate-800";
};
const randomize = (base, seed) => {
  return base;
};
const isMine = (session, chart) => {
  if (!(session == null ? void 0 : session.loggedIn)) return false;
  return [
    session.user.handle,
    ...session.altUsers.map((u) => u.handle)
  ].includes(chart.author.handle);
};
const isAdmin = (session) => {
  return (session == null ? void 0 : session.loggedIn) && session.user.userType === "admin";
};
const OptionalImage = ({ src, alt, ...props }) => {
  if (!src) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: clsx(
          "bg-white dark:bg-gray-700 flex justify-center items-center animate-pulse",
          props.className
        ),
        style: {
          ...props.style
        }
      }
    );
  }
  return /* @__PURE__ */ jsx("img", { src, alt: alt || "", ...props });
};
const ChartCard = forwardRef(function ChartCard2({ data: data2, spacer }, ref) {
  const [random, setRandom] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    setRandom(Math.random());
  }, []);
  if (spacer) {
    return /* @__PURE__ */ jsx("div", { className: "p-2 h-0 w-[480px]", ref });
  }
  const retvar = /* @__PURE__ */ jsxs(
    "div",
    {
      className: clsx(
        "p-2 h-40 md:h-48 w-[480px] max-w-[calc(100vw_-_2rem)] shadow-sm rounded-xl flex relative",
        "dark:shadow-slate-700/25",
        (data2 == null ? void 0 : data2.visibility) === "public" ? "bg-slate-100 dark:bg-slate-900" : "bg-slate-200 dark:bg-gray-900",
        data2 && "transition-shadow duration-200 hover:shadow-theme/50"
      ),
      ref,
      children: [
        /* @__PURE__ */ jsx(
          OptionalImage,
          {
            src: data2 == null ? void 0 : data2.cover,
            alt: data2 == null ? void 0 : data2.title,
            className: "rounded-xl square w-36 md:w-44",
            width: 176,
            height: 176
          }
        ),
        data2 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: clsx(
                "absolute text-xs top-2 left-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white",
                getRatingColor(data2.rating)
              ),
              children: [
                "Lv. ",
                data2.rating
              ]
            }
          ),
          data2.visibility === "private" && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute text-xs top-2 right-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white",
              children: /* @__PURE__ */ jsx(LockClosedRegular, { className: "h-6 w-6 text-slate-900 dark:text-white" })
            }
          ),
          data2.visibility === "scheduled" && /* @__PURE__ */ jsx(
            "div",
            {
              className: "absolute text-xs top-2 right-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white",
              children: /* @__PURE__ */ jsx(ClockRegular, { className: "h-6 w-6 text-slate-900 dark:text-white" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "ml-2 flex flex-col flex-grow", children: [
            /* @__PURE__ */ jsx("h2", { className: "font-bold text-2xl w-full break-all overflow-hidden", children: data2.title }),
            /* @__PURE__ */ jsx("div", { className: "flex-grow" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
              /* @__PURE__ */ jsx(MusicNote2Regular, { className: "mr-1 w-4 h-4" }),
              data2.composer
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs", children: [
              /* @__PURE__ */ jsx(MicRegular, { className: "mr-1 w-4 h-4" }),
              data2.artist || "-"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs", children: data2.tags.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(TagRegular, { className: "mr-1 w-4 h-4" }),
              data2.tags.join("、")
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(TagRegular, { className: "mr-1 w-4 h-4 text-slate-400 dark:text-slate-500" }),
              "-"
            ] }) }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/users/${data2.author.handle}`,
                onClick: (e) => e.stopPropagation(),
                children: /* @__PURE__ */ jsxs("p", { className: "text-xs hover:text-blue-400 transition-colors duration-200", children: [
                  /* @__PURE__ */ jsx(EditRegular, { className: "mr-1 w-4 h-4" }),
                  data2.authorName || data2.author.name,
                  /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
                    "#",
                    data2.author.handle
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-400", children: [
              /* @__PURE__ */ jsx(HeartRegular, { className: "mr-1 w-4 h-4" }),
              data2.likes
            ] })
          ] })
        ] }) : /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "ml-2 flex flex-col", children: [
          /* @__PURE__ */ jsx(
            "h2",
            {
              className: "h-8 bg-gray-300 rounded animate-pulse mt-4",
              style: { width: `${50 + random * 50}%` }
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex-grow" }),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75",
              style: { width: `${50 + randomize(random) * 50}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75",
              style: { width: `${50 + randomize(random) * 50}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75",
              style: { width: `${50 + randomize(random) * 50}%` }
            }
          ),
          /* @__PURE__ */ jsx(
            "p",
            {
              className: "h-4 bg-red-300 rounded animate-pulse mt-2 opacity-75",
              style: { width: `${50 + randomize(random) * 50}%` }
            }
          )
        ] }) })
      ]
    }
  );
  if (data2) {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: "text-normal cursor-pointer",
        onClick: () => navigate(`/charts/${data2.name}`),
        children: retvar
      }
    );
  } else {
    return retvar;
  }
});
const ChartSection = ({ sections }) => {
  const { t } = useTranslation("chartSection");
  return /* @__PURE__ */ jsx(Fragment, { children: sections.map((section, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col mt-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: section.title }),
    /* @__PURE__ */ jsx("div", { className: "overflow-x-scroll", children: /* @__PURE__ */ jsx("div", { className: "flex flex-nowrap flex-shrink min-h-[208px] mt-4 gap-4 relative min-w-max", children: section.items.length > 0 ? section.items.map((chart) => /* @__PURE__ */ jsx(ChartCard, { data: chart }, chart.name)) : /* @__PURE__ */ jsx("p", { className: "text-lg", children: t("notFound") }) }) })
  ] }, i)) });
};
const Checkbox = ({ label, size, checked, onChange, ...props }) => {
  var _a2;
  const ref = useRef(null);
  let sizeClass, labelClass;
  if (size === "sm") {
    sizeClass = "h-5 w-5";
    labelClass = "text-sm";
  } else {
    sizeClass = "h-6 w-6";
    labelClass = "text-md";
  }
  return /* @__PURE__ */ jsxs(
    "label",
    {
      className: clsx$1(
        "flex text-normal gap-2",
        labelClass,
        ((_a2 = ref.current) == null ? void 0 : _a2.disabled) ? "cursor-not-allowed text-slate-400" : "cursor-pointer"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            checked,
            ref,
            onChange: (e) => {
              onChange == null ? void 0 : onChange(e);
            },
            ...props,
            className: "hidden",
            "data-name": props.name
          }
        ),
        checked ? /* @__PURE__ */ jsx(CheckboxCheckedFilled, { className: clsx$1("text-theme", sizeClass) }) : /* @__PURE__ */ jsx(
          CheckboxUncheckedRegular,
          {
            className: clsx$1("text-slate-500", sizeClass)
          }
        ),
        label
      ]
    }
  );
};
const InputTitle = (props) => {
  const { t } = useTranslation("upload");
  const [isTooltipShown, setIsTooltipShown] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: clsx$1("mt-2", props.containerClassName), children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold", children: [
      props.text,
      props.optional && t("optional"),
      props.tooltip && /* @__PURE__ */ jsxs(
        "div",
        {
          className: "inline-block relative cursor-help",
          onMouseOver: () => setIsTooltipShown(true),
          onMouseLeave: () => setIsTooltipShown(false),
          children: [
            isTooltipShown && /* @__PURE__ */ jsx(
              "div",
              {
                className: clsx$1(
                  "absolute bottom-full p-2 rounded font-sans left-[-8rem] right-[-8rem]",
                  "text-sm bg-slate-100 dark:bg-slate-700 shadow pointer-none"
                ),
                children: props.tooltip
              }
            ),
            /* @__PURE__ */ jsx(InfoRegular, {})
          ]
        }
      ),
      props.error && /* @__PURE__ */ jsx("span", { className: "ml-4 font-sans text-sm text-red-500", children: props.error })
    ] }),
    /* @__PURE__ */ jsx("div", { className: clsx$1("w-full", props.className), children: props.children })
  ] });
};
const TextInput = (props) => {
  return props.prefix ? /* @__PURE__ */ jsxs(
    "div",
    {
      className: clsx(
        "text-input !p-0 flex",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "border-r-2 bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-slate-700 p-2 dark:text-slate-200", children: props.prefix }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "outline-none p-2 w-full",
            disabled: props.disabled,
            maxLength: props.maxLength,
            defaultValue: props.defaultValue,
            "data-name": props.name,
            "data-optional": props.optional,
            placeholder: props.placeholder
          }
        )
      ]
    }
  ) : props.textarea ? /* @__PURE__ */ jsx(
    "textarea",
    {
      className: clsx(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      ),
      disabled: props.disabled,
      maxLength: props.maxLength,
      defaultValue: props.defaultValue,
      "data-name": props.name,
      "data-optional": props.optional,
      placeholder: props.placeholder
    }
  ) : /* @__PURE__ */ jsx(
    "input",
    {
      type: "text",
      className: clsx(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      ),
      disabled: props.disabled,
      maxLength: props.maxLength,
      defaultValue: props.defaultValue,
      "data-name": props.name,
      "data-optional": props.optional,
      placeholder: props.placeholder
    }
  );
};
const loader$7 = async ({ params, request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "chart");
  const title = `${t("title")} | ${rootT("name")}`;
  const chartData = await fetch(
    pathcat(backendUrl, "/api/charts/:name", {
      name: params.name
    }),
    {
      method: "GET"
    }
  ).then(async (res) => {
    const json2 = await res.json();
    if (json2.code === "ok") {
      return json2.chart;
    } else {
      return null;
    }
  });
  if (!chartData) {
    throw new Response(null, {
      status: 404
    });
  }
  return json$1({
    chartData,
    title,
    host: process.env.HOST
  });
};
const handle$7 = {
  i18n: "chart"
};
const meta$7 = ({ data: data2 }) => {
  var _a2;
  const chartData = data2.chartData;
  return [
    {
      title: data2.title
    },
    {
      name: "og:type",
      content: "article"
    },
    {
      name: "og:article:published_time",
      content: chartData.publishedAt
    },
    {
      name: "og:article:modified_time",
      content: chartData.updatedAt
    },
    {
      name: "og:site_name",
      content: `Chart Cyanvas - ${chartData.authorName || chartData.author.name}#${chartData.author.handle}`
    },
    {
      name: "og:description",
      content: chartData.description
    },
    {
      name: "og:title",
      content: `${chartData.title} - ${chartData.composer}${chartData.artist ? ` / ${chartData.artist}` : ""} (Lv. ${chartData.rating}, ♡${chartData.likes})`
    },
    {
      name: "og:url",
      content: `${data2.host}/charts/${chartData.name}`
    },
    {
      name: "og:image",
      content: ((_a2 = chartData.cover) == null ? void 0 : _a2.startsWith("/")) ? `${data2.host}${chartData.cover}` : chartData.cover
    }
  ];
};
const ChartPage = () => {
  const { chartData } = useLoaderData();
  const { name: chartName } = useParams();
  if (!chartName) {
    throw new Error("chartName is required");
  }
  const { t: rootT } = useTranslation();
  const { t } = useTranslation("chart");
  const navigate = useNavigate();
  const serverSettings = useServerSettings();
  const session = useSession();
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [warnAuthor, setWarnAuthor] = useState(false);
  const sendDeleteRequest = useCallback(async () => {
    if ((session == null ? void 0 : session.loggedIn) && session.user.userType === "admin") {
      await fetch("/api/admin/delete-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: chartName,
          warn: warnAuthor,
          reason: document.querySelector("[data-name=warnReason]").value
        })
      });
      navigate(
        pathcat("/users/:handle", {
          handle: chartData.author.handle
        })
      );
    } else {
      await fetch(
        pathcat("/api/charts/:name", {
          name: chartName
        }),
        {
          method: "DELETE"
        }
      );
      navigate("/charts/my");
    }
  }, [chartName, navigate, session, warnAuthor, chartData]);
  const doesUserOwn = isMine(session, chartData) || (session == null ? void 0 : session.loggedIn) && session.user.userType === "admin";
  const adminDecoration = isAdmin(session) ? rootT("adminDecorate") : "";
  if (chartData.description.split(/\n/g).length > 3) {
    `${chartData.description.split(/\n/g).splice(0, 3).join("\n").substring(0, 100)}...`;
  } else {
    chartData.description;
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(ModalPortal, { isOpen: showDeletionModal, children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-normal mb-2 break-word", children: t("deletionModal.title") }),
      isAdmin(session) ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            label: t("deletionModal.warnAuthor"),
            checked: warnAuthor,
            onChange: (e) => setWarnAuthor(e.target.checked)
          }
        ),
        /* @__PURE__ */ jsx(InputTitle, { text: t("deletionModal.warnReason"), children: /* @__PURE__ */ jsx(
          TextInput,
          {
            name: "warnReason",
            textarea: true,
            optional: true,
            className: "w-full h-32",
            disabled: !warnAuthor
          }
        ) })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-normal mb-1", children: t("deletionModal.description") }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end mt-4 gap-2", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "px-4 py-2 rounded text-sm border-2 border-slate-500 dark:border-white text-normal cursor-pointer",
            onClick: () => {
              setShowDeletionModal(false);
            },
            children: rootT("cancel")
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: clsx(
              "px-4 py-2 rounded text-sm bg-red-500 text-white cursor-pointer"
            ),
            onClick: () => {
              sendDeleteRequest();
            },
            children: t("deletionModal.ok")
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-h-[300px] w-full flex relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-grow max-w-[calc(100%_-_128px)]", children: [
          chartData.variantOf && /* @__PURE__ */ jsx("h4", { className: "text-gray-500", children: /* @__PURE__ */ jsxs(Link, { to: `/charts/${chartData.variantOf.name}`, children: [
            /* @__PURE__ */ jsx(ArrowTurnLeftDownFilled, {}),
            chartData.variantOf.title,
            " "
          ] }) }),
          /* @__PURE__ */ jsxs(
            "h1",
            {
              className: clsx(
                "text-4xl font-bold break-words",
                !!chartData.data || "text-yellow-700"
              ),
              children: [
                chartData.title,
                chartData.visibility === "scheduled" && /* @__PURE__ */ jsx("span", { className: "ml-2 text-slate-900 dark:text-white", children: /* @__PURE__ */ jsx(ClockRegular, {}) }),
                chartData.visibility === "private" && /* @__PURE__ */ jsx("span", { className: "ml-2 text-slate-900 dark:text-white", children: /* @__PURE__ */ jsx(LockClosedRegular, {}) }),
                !!chartData.data || /* @__PURE__ */ jsx("span", { className: "ml-2 text-yellow-700", children: /* @__PURE__ */ jsx(ClockRegular, {}) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-lg mt-4", children: [
            /* @__PURE__ */ jsx(MusicNote2Regular, { className: "mr-1 h-6 w-6" }),
            chartData.composer
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg", children: [
            /* @__PURE__ */ jsx(MicRegular, { className: "mr-1 h-6 w-6" }),
            chartData.artist || "-"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-lg", children: chartData.tags.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(TagRegular, { className: "mr-1 w-6 h-6" }),
            chartData.tags.join("、")
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(TagRegular, { className: "mr-1 w-6 h-6 text-slate-400 dark:text-slate-500" }),
            "-"
          ] }) }),
          /* @__PURE__ */ jsx("p", { className: "text-lg", children: /* @__PURE__ */ jsxs(Link, { to: `/users/${chartData.author.handle}`, children: [
            /* @__PURE__ */ jsx(EditRegular, { className: "mr-1 h-6 w-6" }),
            chartData.authorName || chartData.author.name,
            /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
              "#",
              chartData.author.handle
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-lg text-red-400", children: [
            /* @__PURE__ */ jsx(HeartRegular, { className: "mr-1 h-6 w-6" }),
            chartData.likes
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-500 font-monospace text-sm", children: [
            /* @__PURE__ */ jsx(NumberSymbolFilled, { className: "mr-1 h-4 w-4" }),
            chartName
          ] }),
          /* @__PURE__ */ jsx("p", { className: "flex-grow mt-4 whitespace-pre-wrap", children: chartData.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "md:h-40 md:w-40 rounded-xl square w-32 h-32 relative", children: [
            /* @__PURE__ */ jsx(
              OptionalImage,
              {
                src: chartData == null ? void 0 : chartData.cover,
                alt: chartData == null ? void 0 : chartData.title,
                className: "md:h-40 md:w-40 h-32 w-32 rounded-xl",
                width: 160,
                height: 160
              }
            ),
            chartData && /* @__PURE__ */ jsxs(
              "div",
              {
                className: `absolute text-xs top-0 left-0 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white ${getRatingColor(chartData.rating)}`,
                children: [
                  "Lv. ",
                  chartData.rating
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-col w-32 md:w-40 mt-4 text-center gap-2", children: [
            (item) => /* @__PURE__ */ jsxs(Fragment, { children: [
              createElement(item.icon, {
                className: "h-5 w-5 mr-1"
              }),
              item.text
            ] })
          ].map(
            (inner) => [
              doesUserOwn && [
                {
                  href: `/charts/${chartName}/edit`,
                  icon: EditRegular,
                  className: "bg-theme text-white",
                  text: t("edit") + adminDecoration
                },
                {
                  text: t("delete") + adminDecoration,
                  icon: DeleteRegular,
                  className: "bg-red-500 text-white",
                  onClick: () => {
                    setShowDeletionModal(true);
                  }
                }
              ],
              chartData.chart && [
                {
                  href: `/api/charts/${chartName}/download_chart`,
                  icon: ArrowDownloadRegular,
                  className: "bg-theme text-white",
                  text: t("download")
                }
              ],
              {
                text: rootT("openInSonolus"),
                icon: OpenRegular,
                className: "bg-black text-white",
                href: `https://open.sonolus.com/${serverSettings.host}/levels/chcy-${chartData.name}`
              }
            ].flat().flatMap((x) => x ? [x] : []).map(
              (item, i) => item.href ? /* @__PURE__ */ jsx(
                Link,
                {
                  to: item.href,
                  className: clsx(
                    "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200",
                    item.className
                  ),
                  onClick: "onClick" in item ? item.onClick : void 0,
                  children: inner(item)
                },
                i
              ) : /* @__PURE__ */ jsx(
                "div",
                {
                  className: clsx(
                    "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200 cursor-pointer",
                    item.className
                  ),
                  onClick: "onClick" in item ? item.onClick : void 0,
                  children: inner(item)
                },
                i
              )
            )
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        ChartSection,
        {
          sections: [
            {
              title: t("variants"),
              items: (chartData == null ? void 0 : chartData.variants) || null,
              hasMore: false
            }
          ]
        },
        chartData == null ? void 0 : chartData.name
      )
    ] })
  ] });
};
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: ChartPage,
  handle: handle$7,
  loader: loader$7,
  meta: meta$7
}, Symbol.toStringTag, { value: "Module" }));
const requireLogin = (component) => {
  return (props) => {
    const session = useSession();
    const navigate = useNavigate();
    if (!session) return /* @__PURE__ */ jsx("div", {});
    if (session.loggedIn) return createElement(component, props);
    navigate("/login");
    return /* @__PURE__ */ jsx("div", {});
  };
};
const ScheduleInput = (props) => {
  const currentDate = useMemo(() => {
    const date = /* @__PURE__ */ new Date();
    return date;
  }, []);
  const defaultValue = new Date(props.defaultValue || currentDate);
  defaultValue.setMinutes(
    defaultValue.getMinutes() - defaultValue.getTimezoneOffset()
  );
  const [scheduledAt, setScheduledAt] = useState(defaultValue);
  const displayValue = scheduledAt.toISOString().replace(/:[0-9]+\.[0-9]+Z.*/g, "");
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "datetime-local",
      className: "text-input w-full mt-2",
      onChange: (e) => {
        var _a2;
        const current = /* @__PURE__ */ new Date();
        current.setMinutes(current.getMinutes() - current.getTimezoneOffset());
        const maybeNew = e.target.valueAsNumber;
        const next = new Date(
          maybeNew ? current.getTime() > maybeNew ? current : maybeNew : current
        );
        const utcNext = new Date(next);
        utcNext.setMinutes(utcNext.getMinutes() + utcNext.getTimezoneOffset());
        (_a2 = props.onChange) == null ? void 0 : _a2.call(props, utcNext);
        setScheduledAt(next);
      },
      value: displayValue,
      "data-name": props.name
    }
  );
};
const FileUploadButton = (props) => {
  var _a2, _b2, _c, _d, _e;
  const fileInput = useRef(null);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    var _a3;
    (_a3 = fileInput.current) == null ? void 0 : _a3.addEventListener("change", () => forceUpdate());
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: clsx$1(
        "flex !text-left items-center xl:flex-col flex-row rounded py-4 mb-4",
        "bg-theme dark:text-white bg-opacity-0 hover:bg-opacity-5 dark:hover:bg-opacity-20 border-2",
        "cursor-pointer hover:bg-opacity-20 button relative",
        ((_b2 = (_a2 = fileInput.current) == null ? void 0 : _a2.files) == null ? void 0 : _b2.item(0)) ? "border-theme dark:border-theme" : "border-slate-300 dark:border-white"
      ),
      onClick: () => {
        var _a3;
        (_a3 = fileInput.current) == null ? void 0 : _a3.click();
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-12 h-12 [&>svg]:w-full [&>svg]:h-full", children: props.icon }),
        /* @__PURE__ */ jsxs("span", { className: "text-lg", children: [
          ((_e = (_d = (_c = fileInput.current) == null ? void 0 : _c.files) == null ? void 0 : _d.item(0)) == null ? void 0 : _e.name) || props.text,
          props.error && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("span", { className: "text-sm text-red-500 xl:absolute xl:left-0 xl:right-0 xl:text-center xl:-bottom-6", children: [
            /* @__PURE__ */ jsx("br", {}),
            props.error
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            "data-name": props.name,
            accept: props.accept,
            hidden: true,
            ref: fileInput
          }
        )
      ]
    }
  );
};
const NumberInput = (props) => {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type: "number",
      className: clsx(
        "text-input text-right",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      ),
      onChange: (e) => {
        var _a2;
        (_a2 = props.onChange) == null ? void 0 : _a2.call(props, e.target.valueAsNumber);
      },
      value: props.value,
      max: props.max,
      min: props.min
    }
  );
};
const { Range, getTrackBackground } = ((_b = (_a = __cjsInterop1__) == null ? void 0 : _a.default) == null ? void 0 : _b.__esModule) ? __cjsInterop1__.default : __cjsInterop1__;
const RangeInput = (props) => {
  const [values, setValues] = useState([props.defaultValue ?? props.min]);
  const value = [
    Math.max(
      props.min,
      Math.min(props.max, props.value != null ? props.value : values[0])
    )
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      Range,
      {
        step: props.step,
        min: props.min,
        max: props.max,
        values: value,
        onChange: (values2) => {
          var _a2;
          if (props.value != null) {
            (_a2 = props.onChange) == null ? void 0 : _a2.call(props, values2[0]);
          } else {
            setValues(values2);
          }
        },
        renderTrack: ({ props: rProps, children }) => /* @__PURE__ */ jsx(
          "div",
          {
            onMouseDown: rProps.onMouseDown,
            onTouchStart: rProps.onTouchStart,
            style: {
              ...rProps.style
            },
            className: "h-2 bg-gray-200 dark:bg-gray-900 rounded flex",
            children: /* @__PURE__ */ jsx(
              "div",
              {
                ref: rProps.ref,
                className: "h-2 w-full self-center rounded",
                style: {
                  background: getTrackBackground({
                    values: value,
                    colors: ["#83ccd2", "#0000"],
                    min: props.min,
                    max: props.max
                  })
                },
                children
              }
            )
          }
        ),
        renderThumb: ({ props: props2 }) => /* @__PURE__ */ jsx("div", { ...props2, className: "w-4 h-4 bg-theme rounded-full" })
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        value: values[0],
        "data-name": props.name,
        readOnly: true,
        hidden: true
      }
    )
  ] });
};
const DisablePortal = ({ isShown }) => {
  return createPortal(
    /* @__PURE__ */ jsx(
      "div",
      {
        className: clsx(
          "fixed inset-0 z-[100] bg-white bg-opacity-50 transition-opacity duration-200"
        ),
        style: {
          pointerEvents: isShown ? "auto" : "none",
          opacity: isShown ? 1 : 0
        }
      }
    ),
    document.body
  );
};
const SelectItemComponent = ({ item }) => /* @__PURE__ */ jsxs(
  RadixSelect.Item,
  {
    className: "relative pl-6 duration-200 transition-colors hover:text-themeText",
    value: item.value,
    disabled: item.disabled,
    children: [
      /* @__PURE__ */ jsx(RadixSelect.ItemText, { children: item.label }),
      /* @__PURE__ */ jsx(RadixSelect.ItemIndicator, { children: /* @__PURE__ */ jsx(CheckmarkRegular, {}) })
    ]
  }
);
const SelectGroupComponent = ({ group }) => /* @__PURE__ */ jsxs(RadixSelect.Group, { children: [
  /* @__PURE__ */ jsx(RadixSelect.Label, { children: group.label }),
  /* @__PURE__ */ jsx(SelectItemsComponent, { items: group.items })
] });
const SelectItemsComponent = ({ items }) => items.map((item, i) => {
  switch (item.type) {
    case "item":
      return /* @__PURE__ */ jsx(SelectItemComponent, { item }, i);
    case "group":
      return /* @__PURE__ */ jsx(SelectGroupComponent, { group: item }, i);
    case "separator":
      return /* @__PURE__ */ jsx(RadixSelect.Separator, {}, i);
  }
});
const Select = (props) => /* @__PURE__ */ jsxs(
  RadixSelect.Root,
  {
    defaultValue: props.defaultValue,
    disabled: props.disabled,
    onValueChange: props.onChange,
    children: [
      /* @__PURE__ */ jsxs(
        RadixSelect.Trigger,
        {
          className: clsx("text-input", props.disabled && "disabled"),
          children: [
            props.children || /* @__PURE__ */ jsx(RadixSelect.Value, {}),
            /* @__PURE__ */ jsx(RadixSelect.Icon, { children: /* @__PURE__ */ jsx(ChevronDownRegular, {}) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(RadixSelect.Portal, { children: /* @__PURE__ */ jsxs(RadixSelect.Content, { className: "p-2 flex flex-row bg-input drop-shadow-lg rounded border-theme border-2", children: [
        /* @__PURE__ */ jsx(RadixSelect.ScrollUpButton, { children: /* @__PURE__ */ jsx(ChevronUpRegular, {}) }),
        /* @__PURE__ */ jsx(RadixSelect.Viewport, { children: /* @__PURE__ */ jsx(SelectItemsComponent, { items: props.items }) }),
        /* @__PURE__ */ jsx(RadixSelect.ScrollDownButton, { children: /* @__PURE__ */ jsx(ChevronDownRegular, {}) }),
        /* @__PURE__ */ jsx(RadixSelect.Arrow, {})
      ] }) })
    ]
  }
);
const ChartForm = (props) => {
  const { isEdit, chartData, chartName, adminOnlyAuthorData } = {
    chartData: void 0,
    chartName: "",
    adminOnlyAuthorData: void 0,
    ...props
  };
  const { t, i18n: i18n2 } = useTranslation("upload");
  const { t: rootT } = useTranslation();
  const { t: errorT } = useTranslation("errors");
  const navigate = useNavigate();
  const serverSettings = useServerSettings();
  const session = useSession();
  const setServerError = useSetServerError();
  if (!(session == null ? void 0 : session.loggedIn)) {
    throw new Error("Not logged in");
  }
  const [errors, setErrors] = useState({});
  const mapErrors = useCallback(
    (e) => {
      return Object.fromEntries(
        Object.entries(e).map(([k, v]) => [k, errorT(v)])
      );
    },
    [errorT]
  );
  const [isAltUserSelectorOpen, setIsAltUserSelectorOpen] = useState(false);
  const [ratingValue, setRatingValueRaw] = useState((chartData == null ? void 0 : chartData.rating) || 30);
  const setRatingValue = useCallback((value) => {
    const parsed = value;
    setRatingValueRaw(Math.min(99, Math.max(1, parsed)));
  }, []);
  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);
  const [visibility, setVisibility] = useState((chartData == null ? void 0 : chartData.visibility) || "private");
  const [isChartPublic, setIsChartPublic] = useState(
    !!(chartData == null ? void 0 : chartData.isChartPublic)
  );
  const [authorHandle, setAuthorHandle] = useState(
    (chartData == null ? void 0 : chartData.authorHandle) || session.user.handle
  );
  const selectableUsers = useMemo(
    () => isAdmin(session) && adminOnlyAuthorData ? [adminOnlyAuthorData, ...adminOnlyAuthorData.altUsers] : [session.user, ...session.altUsers],
    [session, adminOnlyAuthorData]
  );
  const authorName = useMemo(
    () => {
      var _a2;
      return ((_a2 = selectableUsers.find((u) => u.handle === authorHandle)) == null ? void 0 : _a2.name) ?? "";
    },
    [authorHandle, selectableUsers]
  );
  const [tags, setTags] = useState((chartData == null ? void 0 : chartData.tags) || []);
  const closeAltUserSelector = useCallback(() => {
    setIsAltUserSelectorOpen(false);
  }, []);
  const scheduledAt = useRef(
    (() => {
      if (chartData == null ? void 0 : chartData.scheduledAt) {
        return new Date(
          Math.max(chartData.scheduledAt.getTime(), (/* @__PURE__ */ new Date()).getTime())
        );
      } else {
        return /* @__PURE__ */ new Date();
      }
    })()
  );
  useEffect(() => {
    if (isAltUserSelectorOpen) {
      document.addEventListener("click", closeAltUserSelector);
    } else {
      document.removeEventListener("click", closeAltUserSelector);
    }
    return () => {
      document.removeEventListener("click", closeAltUserSelector);
    };
  }, [isAltUserSelectorOpen, closeAltUserSelector]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const createFormData = useCallback(() => {
    const errors2 = {};
    const getField = (name) => {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`
      );
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`);
      }
      if (!fieldElement.value && fieldElement.getAttribute("data-optional") !== "true") {
        errors2[name] = errorT("cannotBeEmpty");
        return void 0;
      }
      return fieldElement.value;
    };
    const formData = new FormData();
    const scheduledAtField = scheduledAt.current;
    formData.append(
      "data",
      JSON.stringify({
        title: getField("title"),
        description: getField("description"),
        composer: getField("composer"),
        artist: getField("artist"),
        tags: tags.map((tag) => tag.text),
        rating: ratingValue,
        authorHandle,
        authorName: getField("authorName"),
        variant: getField("variant"),
        isChartPublic,
        visibility,
        scheduledAt: scheduledAtField.getTime()
      })
    );
    for (const name of ["chart", "bgm", "cover"]) {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`
      );
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`);
      }
      if (fieldElement.files && fieldElement.files.length > 0) {
        formData.append(name, fieldElement.files[0]);
      } else if (!isEdit) {
        errors2[name] = errorT("cannotBeEmpty");
      }
    }
    setErrors(errors2);
    if (Object.keys(errors2).length > 0) {
      return false;
    }
    return formData;
  }, [
    tags,
    ratingValue,
    authorHandle,
    isChartPublic,
    visibility,
    errorT,
    isEdit
  ]);
  const handleResponse = useCallback(
    async (res) => {
      try {
        if (res.status === 500) {
          setServerError(new Error("/api/charts returned 500"));
          return;
        } else if (res.status === 413) {
          setShowFileSizeError(true);
          return;
        } else if (res.status === 404) {
          navigate("/");
          return;
        }
        const data2 = await res.json().catch(() => ({
          code: "error",
          errors: {}
        }));
        if (data2.code !== "ok") {
          setErrors(mapErrors(data2.errors));
          return;
        }
        return data2;
      } finally {
        setIsSubmitting(false);
      }
    },
    [setServerError, mapErrors, navigate]
  );
  const submitChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }
    setIsSubmitting(true);
    fetch("/api/charts", {
      method: "POST",
      body: formData
    }).then(async (res) => {
      const data2 = await handleResponse(res);
      if (!data2) {
        return;
      }
      navigate(`/charts/${data2.chart.name}`);
    });
  }, [createFormData, handleResponse, navigate]);
  const updateChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }
    setIsSubmitting(true);
    fetch(
      pathcat("/api/charts/:name", {
        name: chartName
      }),
      {
        method: "PUT",
        body: formData
      }
    ).then(async (res) => {
      const data2 = await handleResponse(res);
      if (!data2) {
        return;
      }
      navigate(`/charts/${data2.chart.name}`);
    });
  }, [createFormData, handleResponse, chartName, navigate]);
  const [publishConfirms, setPublishConfirms] = useState([
    false,
    false,
    false,
    false
  ]);
  const isAllPublicConfirmsChecked = publishConfirms.every(
    (checked) => checked
  );
  const [waitForPublishConfirm, setWaitForPublishConfirm] = useState(null);
  const publishChart = useCallback(() => {
    setPublishConfirms([false, false, false, false]);
    new Promise((resolve) => {
      setWaitForPublishConfirm(() => resolve);
    }).then((confirmed) => {
      if (confirmed == null) {
        return;
      }
      setWaitForPublishConfirm(null);
      if (!confirmed) {
        return;
      }
      setIsSubmitting(true);
      const formData = createFormData();
      if (!formData) {
        return;
      }
      fetch(pathcat("/api/charts/:name", { name: chartName }), {
        method: "PUT",
        body: formData
      }).then(async (res) => {
        const data2 = await handleResponse(res);
        if (!data2) {
          return;
        }
        navigate(`/charts/${data2.chart.name}`);
      });
    });
  }, [navigate, chartName, handleResponse, createFormData]);
  const unpublishChart = useCallback(() => {
    setIsSubmitting(true);
    const formData = createFormData();
    if (!formData) {
      return;
    }
    fetch(pathcat("/api/charts/:name", { name: chartName }), {
      method: "PUT",
      body: formData
    }).then(async (res) => {
      if (res.status === 500) {
        setServerError(new Error(`PUT /api/charts/${chartName} returned 500`));
        setIsSubmitting(false);
        return;
      } else if (res.status === 413) {
        setShowFileSizeError(true);
        setIsSubmitting(false);
        return;
      }
      const data2 = await res.json();
      if (data2.code !== "ok") {
        setErrors(data2.errors);
        setIsSubmitting(false);
        return;
      }
      navigate(`/charts/${data2.chart.name}`);
    });
  }, [navigate, chartName, createFormData, setServerError]);
  const [unUploadedFiles, setUnUploadedFiles] = useState([]);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    const unUploaded = [];
    for (const file of Array.from(files)) {
      let field;
      if (["usc"].includes(file.name.split(".").pop())) {
        field = "chart";
      } else if (["mp3", "wav", "ogg"].includes(file.name.split(".").pop())) {
        field = "bgm";
      } else if (["jpg", "jpeg", "png"].includes(file.name.split(".").pop())) {
        field = "cover";
      } else {
        unUploaded.push(file);
        continue;
      }
      const inputElement = document.querySelector(
        `[data-name="${field}"]`
      );
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change"));
    }
    if (unUploaded.length) {
      setUnUploadedFiles(unUploaded);
    }
  }, []);
  const canPost = !serverSettings.discordEnabled || !!session.discord;
  return /* @__PURE__ */ jsxs(
    "form",
    {
      className: "flex flex-col gap-2",
      onDragOver: (e) => e.preventDefault(),
      onDrop,
      children: [
        /* @__PURE__ */ jsx(DisablePortal, { isShown: isSubmitting }),
        /* @__PURE__ */ jsxs(ModalPortal, { isOpen: unUploadedFiles.length > 0, children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mb-2", children: t("unUploadedFiles") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: t("unUploadedFilesNote") }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-4", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer",
              onClick: () => setUnUploadedFiles([]),
              children: rootT("close")
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs(ModalPortal, { isOpen: showFileSizeError, children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold mb-2", children: t("filesTooLarge") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: t("filesTooLargeNote") }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-4", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer",
              onClick: () => setShowFileSizeError(false),
              children: rootT("close")
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs(ModalPortal, { isOpen: isVisibilityDialogOpen, children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-normal mb-2", children: t("visibility.title") }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
            ["public", "scheduled", "private"].map((key) => /* @__PURE__ */ jsxs("div", { className: "flex", children: [
              /* @__PURE__ */ jsx("div", { className: "w-6 mr-2 flex-shrink-0", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "rounded-full mt-1 h-6 box-border border-2 border-slate-300 dark:border-slate-700 p-1 cursor-pointer",
                  onClick: () => setVisibility(key),
                  children: key === visibility && /* @__PURE__ */ jsx("div", { className: "rounded-full w-full h-full bg-theme" })
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-grow flex flex-col", children: [
                /* @__PURE__ */ jsx(
                  "label",
                  {
                    onClick: () => setVisibility(key),
                    className: "cursor-pointer",
                    children: /* @__PURE__ */ jsx("h5", { className: "text-lg font-bold", children: t(`visibility.${key}`) })
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "text-sm", children: t(`visibility.description.${key}`) }),
                key === "scheduled" && /* @__PURE__ */ jsx(
                  ScheduleInput,
                  {
                    name: "scheduledAt",
                    defaultValue: scheduledAt.current,
                    onChange: (value) => {
                      scheduledAt.current = value;
                    }
                  }
                )
              ] })
            ] }, key)),
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                onChange: (e) => {
                  setIsChartPublic(e.target.checked);
                },
                label: t("isChartPublic"),
                checked: isChartPublic
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-4", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer",
              onClick: () => setIsVisibilityDialogOpen(false),
              children: rootT("close")
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs(ModalPortal, { isOpen: waitForPublishConfirm !== null, children: [
          /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-normal mb-2", children: t("publishModal.title") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-normal mb-1", children: t("publishModal.description") }),
          publishConfirms.map((checked, i) => /* @__PURE__ */ jsx(
            Checkbox,
            {
              label: t(`publishModal.check${i}`),
              checked,
              onChange: (e) => {
                const newConfirms = [...publishConfirms];
                newConfirms[i] = e.target.checked;
                setPublishConfirms(newConfirms);
              },
              size: "sm"
            },
            i
          )),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 text-normal mt-1", children: /* @__PURE__ */ jsx(
            Trans,
            {
              i18nKey: "upload:publishModal.description2",
              components: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `https://cc-wiki.sevenc7c.com/${i18n2.language}/guideline`,
                    target: "_blank"
                  },
                  "0"
                )
              ]
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end mt-4 gap-2", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "px-4 py-2 rounded text-sm border-2 border-slate-500 dark:border-white text-normal cursor-pointer",
                onClick: () => {
                  waitForPublishConfirm == null ? void 0 : waitForPublishConfirm(false);
                },
                children: rootT("cancel")
              }
            ),
            /* @__PURE__ */ jsx(
              "div",
              {
                className: clsx(
                  "px-4 py-2 rounded text-sm bg-theme text-white",
                  isAllPublicConfirmsChecked ? "cursor-pointer" : "bg-opacity-70 cursor-not-allowed"
                ),
                onClick: () => {
                  isAllPublicConfirmsChecked && (waitForPublishConfirm == null ? void 0 : waitForPublishConfirm(true));
                },
                children: t("publishModal.ok")
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "page-title", children: isEdit ? /* @__PURE__ */ jsxs(Fragment, { children: [
          t("titleEdit", { title: chartData.title }),
          chartData.visibility === "public" || /* @__PURE__ */ jsx("span", { className: "ml-2 text-slate-900 dark:text-white", children: /* @__PURE__ */ jsx(LockClosedRegular, {}) })
        ] }) : t("title") }),
        /* @__PURE__ */ jsx("p", { className: "mb-4 whitespace-pre", children: /* @__PURE__ */ jsxs("budoux-ja", { children: [
          /* @__PURE__ */ jsx(
            Trans,
            {
              i18nKey: "upload:description",
              components: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `https://cc-wiki.sevenc7c.com/${i18n2.language}/guideline`,
                    target: "_blank"
                  },
                  "0"
                )
              ]
            }
          ),
          serverSettings.discordEnabled && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("br", {}),
            t("discordInfo.description"),
            /* @__PURE__ */ jsx("br", {}),
            t("discordInfo.status.label"),
            session.discord ? /* @__PURE__ */ jsx(Fragment, { children: t("discordInfo.status.connected", {
              username: session.discord.username
            }) }) : /* @__PURE__ */ jsx(Fragment, { children: t("discordInfo.status.notConnected") }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `https://cc-wiki.sevenc7c.com/${i18n2.language}/publishing-chart`,
                target: "_blank",
                className: "ml-2",
                children: t("discordInfo.connectGuide")
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          canPost || /* @__PURE__ */ jsx("div", { className: "absolute z-10 top-0 left-0 w-full h-full bg-white dark:bg-slate-800 bg-opacity-50 cursor-not-allowed" }),
          /* @__PURE__ */ jsxs("div", { className: "grid xl:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsx(
              FileUploadButton,
              {
                accept: "image/*",
                name: "cover",
                text: t("param.cover"),
                icon: /* @__PURE__ */ jsx(ImageRegular, {}),
                error: errors.cover
              }
            ),
            /* @__PURE__ */ jsx(
              FileUploadButton,
              {
                accept: "audio/*,.mp3,.wav,.ogg",
                name: "bgm",
                text: t("param.bgm"),
                icon: /* @__PURE__ */ jsx(MusicNote2Regular, {}),
                error: errors.bgm
              }
            ),
            /* @__PURE__ */ jsx(
              FileUploadButton,
              {
                accept: ".sus,.usc,.json",
                name: "chart",
                text: t("param.chart"),
                icon: /* @__PURE__ */ jsx(DocumentRegular, {}),
                error: errors.chart
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "items-middle pt-2 hidden lg:flex", children: [
            /* @__PURE__ */ jsx(InfoRegular, { className: "h-6" }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
              " ",
              t("dndHint")
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:grid xl:grid-cols-2 xl:gap-4 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-grow gap-2", children: [
              /* @__PURE__ */ jsx(InputTitle, { text: t("param.title"), error: errors.title, children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "title",
                  className: "w-full",
                  defaultValue: chartData == null ? void 0 : chartData.title
                }
              ) }),
              /* @__PURE__ */ jsx(InputTitle, { text: t("param.composer"), error: errors.composer, children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "composer",
                  className: "w-full",
                  defaultValue: chartData == null ? void 0 : chartData.composer
                }
              ) }),
              /* @__PURE__ */ jsx(InputTitle, { text: t("param.artist"), optional: true, error: errors.artist, children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "artist",
                  className: "w-full",
                  optional: true,
                  defaultValue: chartData == null ? void 0 : chartData.artist
                }
              ) }),
              /* @__PURE__ */ jsxs(
                InputTitle,
                {
                  text: t("param.rating"),
                  tooltip: t("tooltip.rating"),
                  className: "flex gap-4 items-center",
                  error: errors.rating,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "flex-grow", children: /* @__PURE__ */ jsx(
                      RangeInput,
                      {
                        name: "rating",
                        min: 1,
                        max: 40,
                        value: ratingValue,
                        onChange: (value) => setRatingValue(value),
                        step: 1
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      NumberInput,
                      {
                        name: "rating",
                        className: "w-16",
                        min: 1,
                        max: 99,
                        value: ratingValue,
                        onChange: (value) => setRatingValue(value)
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputTitle, { text: t("visibility.title"), error: errors.visibility, children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: clsx("button-secondary p-2", isEdit || "disabled"),
                  onClick: () => isEdit && setIsVisibilityDialogOpen(true),
                  children: t(`visibility.${visibility}`)
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-grow gap-2", children: [
              /* @__PURE__ */ jsxs(
                InputTitle,
                {
                  text: t("param.author"),
                  className: "flex gap-2 relative",
                  error: errors.author,
                  children: [
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        name: "authorName",
                        className: "flex-grow min-w-0",
                        defaultValue: (chartData == null ? void 0 : chartData.authorName) || session.user.name,
                        placeholder: authorName
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Select,
                      {
                        items: selectableUsers.map((user) => ({
                          type: "item",
                          label: `${user.name}#${user.handle}`,
                          value: user.handle
                        })),
                        value: authorHandle,
                        onChange: setAuthorHandle,
                        children: [
                          "#",
                          authorHandle
                        ]
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                InputTitle,
                {
                  text: t("param.variant"),
                  optional: true,
                  tooltip: t("tooltip.variant"),
                  error: errors.variant,
                  children: /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      name: "variant",
                      className: "w-full",
                      monospace: true,
                      optional: true,
                      prefix: "#",
                      defaultValue: chartData == null ? void 0 : chartData.variant
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                InputTitle,
                {
                  text: t("param.tags"),
                  tooltip: t("tooltip.tags"),
                  error: errors.tags,
                  children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "flex flex-col gap-2 tag-input",
                      "data-reached-max": tags.length >= 5,
                      children: /* @__PURE__ */ jsx(
                        WithOutContext,
                        {
                          tags: tags.map((tag) => ({ className: "", ...tag })),
                          allowDragDrop: false,
                          placeholder: "",
                          separators: [" ", ","],
                          handleDelete: (i) => {
                            setTags(tags.filter((_, index) => index !== i));
                          },
                          handleAddition: (tag) => {
                            setTags((tags2) => [...tags2, tag]);
                          }
                        }
                      )
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                InputTitle,
                {
                  text: t("param.description"),
                  className: "h-full",
                  error: errors.description,
                  children: /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      name: "description",
                      textarea: true,
                      optional: true,
                      className: "w-full h-32",
                      defaultValue: chartData == null ? void 0 : chartData.description
                    }
                  )
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 border-t-2 border-slate-300 dark:border-slate-700" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: [
            isEdit ? visibility !== "private" !== (chartData.visibility !== "private") ? chartData.visibility !== "private" ? {
              isPrimary: true,
              text: t("unpublish"),
              onClick: unpublishChart,
              isDanger: true
            } : {
              isPrimary: true,
              text: t("publish"),
              onClick: publishChart
            } : {
              text: t("update"),
              onClick: updateChart
            } : {
              isPrimary: true,
              text: t("submit"),
              onClick: submitChart
            }
          ].map((button, i) => /* @__PURE__ */ jsx(
            "div",
            {
              className: clsx(
                "p-2 w-full",
                button.isDanger ? "button-danger" : button.isPrimary ? "button-primary" : "button-secondary"
              ),
              onClick: button.onClick,
              children: button.text
            },
            i
          )) })
        ] })
      ]
    }
  );
};
const loader$6 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "upload");
  const title = `${t("title")} | ${rootT("name")}`;
  return json$1({ locale, title });
};
const handle$6 = {
  i18n: "upload"
};
const meta$6 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
function UploadChart() {
  return /* @__PURE__ */ jsx(ChartForm, { isEdit: false });
}
const charts_upload = requireLogin(UploadChart);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: charts_upload,
  handle: handle$6,
  loader: loader$6,
  meta: meta$6
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "admin");
  const title = `${t("title")} | ${rootT("name")}`;
  return json$1({ locale, title });
};
const handle$5 = {
  i18n: "discordError"
};
const meta$5 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
const DiscordError = () => {
  const { t } = useTranslation("discordError");
  const code = useRef("");
  useEffect(() => {
    code.current = new URLSearchParams(window.location.search).get("code") ?? "unknown";
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("title") }),
    /* @__PURE__ */ jsx("p", { children: t("description", { code: t(`error.${code.current}`) }) })
  ] }) });
};
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DiscordError,
  handle: handle$5,
  loader: loader$5,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
const loader$4 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "liked");
  const title = `${t("title")} | ${rootT("name")}`;
  return json$1({ locale, title });
};
const handle$4 = {
  i18n: "liked"
};
const meta$4 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
const MyCharts$1 = () => {
  const { t } = useTranslation("liked");
  const [myCharts, setLikedCharts] = useState([]);
  const [reachedBottom, setReachedBottom] = useState(false);
  const isFetching = useRef(false);
  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        count: 20,
        offset: myCharts.length,
        liked: true
      })
    ).then(async (res) => {
      const data2 = await res.json();
      if (data2.code === "ok") {
        setLikedCharts((prev) => [...prev, ...data2.charts]);
        if (data2.charts.length < 20) {
          setReachedBottom(true);
        }
      }
    }).finally(() => {
      setTimeout(() => {
        isFetching.current = false;
      }, 0);
    });
  }, [myCharts]);
  useEffect(() => {
    if (myCharts.length) return;
    fetchNewCharts();
  }, [myCharts, fetchNewCharts]);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("title") }),
    /* @__PURE__ */ jsx(Trans, { i18nKey: "liked:description" }),
    /* @__PURE__ */ jsx("div", { className: "h-4" }),
    myCharts.length === 0 && reachedBottom ? /* @__PURE__ */ jsx("div", { className: "text-center", children: t("empty") }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [
      myCharts.length > 0 ? myCharts.map((chart) => /* @__PURE__ */ jsx(ChartCard, { data: chart }, chart.name)) : new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { data: void 0 }, i)),
      new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { spacer: true }, i))
    ] })
  ] }) });
};
const charts_liked = requireLogin(MyCharts$1);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: charts_liked,
  handle: handle$4,
  loader: loader$4,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "my");
  const title = `${t("title")} | ${rootT("name")}`;
  return json$1({ locale, title });
};
const handle$3 = {
  i18n: "my"
};
const meta$3 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
const MyCharts = () => {
  const { t } = useTranslation("my");
  const [myCharts, setLikedCharts] = useState([]);
  const [reachedBottom, setReachedBottom] = useState(false);
  const isFetching = useRef(false);
  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        count: 20,
        offset: myCharts.length,
        include_non_public: true
      })
    ).then(async (res) => {
      const data2 = await res.json();
      if (data2.code === "ok") {
        setLikedCharts((prev) => [...prev, ...data2.charts]);
        if (data2.charts.length < 20) {
          setReachedBottom(true);
        }
      }
    }).finally(() => {
      setTimeout(() => {
        isFetching.current = false;
      }, 0);
    });
  }, [myCharts]);
  useEffect(() => {
    if (myCharts.length) return;
    fetchNewCharts();
  }, [myCharts, fetchNewCharts]);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("title") }),
    /* @__PURE__ */ jsx(Trans, { i18nKey: "my:description" }),
    /* @__PURE__ */ jsx("div", { className: "h-4" }),
    myCharts.length === 0 && reachedBottom ? /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(
      Trans,
      {
        i18nKey: "my:empty",
        components: [/* @__PURE__ */ jsx(Link, { to: "/charts/upload" }, "0")]
      }
    ) }) : /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4 justify-center", children: [
      myCharts.length > 0 ? myCharts.map((chart) => /* @__PURE__ */ jsx(ChartCard, { data: chart }, chart.name)) : new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { data: void 0 }, i)),
      new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { spacer: true }, i))
    ] })
  ] }) });
};
const charts_my = requireLogin(MyCharts);
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: charts_my,
  handle: handle$3,
  loader: loader$3,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
const loader$2 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const title = rootT("name");
  return json$1({ locale, title });
};
const handle$2 = {
  i18n: "home"
};
const meta$2 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
const Home = () => {
  const { locale } = useLoaderData();
  useChangeLanguage(locale);
  const { t, i18n: i18n2 } = useTranslation("home");
  const [newCharts, setNewCharts] = useState([]);
  const newChartsRef = useRef(null);
  const isFetching = useRef(false);
  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        offset: newCharts.length,
        count: 20
      })
    ).then(async (res) => {
      const data2 = await res.json();
      if (data2.code === "ok") {
        setNewCharts((prev) => [...prev, ...data2.charts]);
      }
    }).finally(() => {
      setTimeout(() => {
        isFetching.current = false;
      }, 0);
    });
  }, [newCharts]);
  useEffect(() => {
    if (newCharts.length) return;
    fetchNewCharts();
  }, [newCharts, fetchNewCharts]);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      Trans,
      {
        i18nKey: "home:welcome",
        components: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: `https://cc-wiki.sevenc7c.com/${i18n2.language}/welcome`,
              target: "_blank"
            },
            "1"
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("newCharts") }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-wrap mt-2 gap-4 justify-center",
          ref: newChartsRef,
          children: [
            newCharts.length > 0 ? newCharts.map((chart) => /* @__PURE__ */ jsx(ChartCard, { data: chart }, chart.name)) : new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { data: void 0 }, i)),
            new Array(20).fill(void 0).map((_, i) => /* @__PURE__ */ jsx(ChartCard, { spacer: true }, i))
          ]
        }
      )
    ] })
  ] });
};
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Home,
  default: Home,
  handle: handle$2,
  loader: loader$2,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const loader$1 = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "admin");
  const title = `${t("title")} | ${rootT("name")}`;
  return json$1({ locale, title });
};
const handle$1 = {
  i18n: "admin"
};
const meta$1 = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
const Admin = () => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const fetchAdmin = useCallback(() => {
    fetch("/api/admin").then(async (res) => {
      const json2 = await res.json();
      if (json2.code === "forbidden") {
        navigate("/");
      }
      setData(json2.data);
    });
  }, [navigate]);
  useEffect(() => {
    fetchAdmin();
    const interval = setInterval(fetchAdmin, 1e4);
    return () => clearInterval(interval);
  }, [fetchAdmin]);
  const [data2, setData] = useState(null);
  const card = "bg-slate-100 dark:bg-slate-800 rounded-md p-4";
  const statCard = clsx(card, "w-full md:w-80");
  const actionCard = clsx(card, "w-full");
  if (!data2) return null;
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("title") }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: statCard, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: t("stats.users.title") }),
        /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold", children: data2.stats.users.original + data2.stats.users.alt }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.users.original") }),
            /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: data2.stats.users.original })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.users.alt") }),
            /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: data2.stats.users.alt })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.users.discord") }),
            /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: data2.stats.users.discord })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: statCard, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: t("stats.charts.title") }),
        /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold", children: data2.stats.charts.public + data2.stats.charts.private }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.charts.public") }),
            /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: data2.stats.charts.public })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex", children: [
            /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.charts.private") }),
            /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: data2.stats.charts.private })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: statCard, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: t("stats.files") }),
        /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold", children: [...Object.values(data2.stats.files)].reduce((a, b) => a + b, 0) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: Object.entries(data2.stats.files).map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "flex", children: [
          /* @__PURE__ */ jsx("p", { className: "flex-1", children: key }),
          /* @__PURE__ */ jsx("p", { className: "flex-1 text-right", children: value })
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: statCard, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: t("stats.db.title") }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsx("p", { className: "flex-1", children: t("stats.db.connections", data2.stats.db) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: statCard, children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold", children: t("sidekiq.title") }),
        /* @__PURE__ */ jsx("p", { className: "text-md", children: /* @__PURE__ */ jsx(Link, { to: "/admin/sidekiq", target: "_blank", children: t("sidekiq.description") }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mt-4", children: t("actions.title") }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col md:flex-row md:flex-wrap gap-4", children: /* @__PURE__ */ jsxs("div", { className: actionCard, children: [
      /* @__PURE__ */ jsx("h3", { className: "text-md font-bold", children: t("actions.expireData.title") }),
      /* @__PURE__ */ jsx("p", { children: t("actions.expireData.description") }),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "button-primary mt-2 p-2",
          onClick: async () => {
            const {
              data: { count }
            } = await fetch("/api/admin/expire-data", {
              method: "POST"
            }).then((res) => res.json());
            alert(t("actions.expireData.success", { count }));
          },
          children: t("actions.expireData.button")
        }
      )
    ] }) })
  ] }) });
};
const admin = requireLogin(Admin);
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: admin,
  handle: handle$1,
  loader: loader$1,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/ja") || url.pathname.startsWith("/en")) {
    const newUrl = new URL(request.url);
    newUrl.pathname = newUrl.pathname.replace(/^\/(ja|en)/, "");
    return redirect(newUrl.toString(), { status: 308 });
  }
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "notFound");
  const title = `${t("title")} | ${rootT("name")}`;
  return json({ locale, title }, { status: 404 });
};
const handle = {
  i18n: "notFound"
};
const meta = ({ data: data2 }) => {
  return [
    {
      title: data2.title
    }
  ];
};
function NotFound() {
  const [t] = useTranslation("notFound");
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { className: "page-title", children: t("heading") }),
    /* @__PURE__ */ jsx("p", { children: t("description") })
  ] });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: NotFound,
  handle,
  loader,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-C87SGVK_.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/i18next-cOPaZ5Oq.js", "/assets/components-NKq783Lw.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BZPx4QH8.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/i18next-cOPaZ5Oq.js", "/assets/components-NKq783Lw.js", "/assets/chunk-2-DY34j8pW.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/clsx-B-dksMZM.js", "/assets/contexts-CgsfAxcF.js", "/assets/chunk-4-CoigCJVH.js", "/assets/ModalPortal-DIql0Uge.js", "/assets/Trans-COWa_CB2.js"], "css": [] }, "routes/charts.$name._index": { "id": "routes/charts.$name._index", "parentId": "root", "path": "charts/:name", "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/charts._name._index-7EXrpah9.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/chunk-2-DY34j8pW.js", "/assets/clsx-B-dksMZM.js", "/assets/utils-lR0QA9I9.js", "/assets/components-NKq783Lw.js", "/assets/chunk-4-CoigCJVH.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/ChartCard-Djra4y7v.js", "/assets/TextInput-UD9WoQpX.js", "/assets/ModalPortal-DIql0Uge.js", "/assets/contexts-CgsfAxcF.js"], "css": [] }, "routes/charts.upload": { "id": "routes/charts.upload", "parentId": "root", "path": "charts/upload", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/charts.upload-CPXfKdbI.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/contexts-CgsfAxcF.js", "/assets/components-NKq783Lw.js", "/assets/clsx-B-dksMZM.js", "/assets/chunk-2-DY34j8pW.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/requireLogin-BXrannRr.js", "/assets/TextInput-UD9WoQpX.js", "/assets/ModalPortal-DIql0Uge.js", "/assets/utils-lR0QA9I9.js", "/assets/Trans-COWa_CB2.js"], "css": [] }, "routes/discord.error": { "id": "routes/discord.error", "parentId": "root", "path": "discord/error", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/discord.error-HRL5U3Is.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/useTranslation-CesOUbzQ.js"], "css": [] }, "routes/charts.liked": { "id": "routes/charts.liked", "parentId": "root", "path": "charts/liked", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/charts.liked-D5lOF8Gt.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/contexts-CgsfAxcF.js", "/assets/components-NKq783Lw.js", "/assets/chunk-2-DY34j8pW.js", "/assets/clsx-B-dksMZM.js", "/assets/utils-lR0QA9I9.js", "/assets/chunk-4-CoigCJVH.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/requireLogin-BXrannRr.js", "/assets/ChartCard-Djra4y7v.js", "/assets/Trans-COWa_CB2.js"], "css": [] }, "routes/charts.my": { "id": "routes/charts.my", "parentId": "root", "path": "charts/my", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/charts.my-Bp0fj9WU.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/contexts-CgsfAxcF.js", "/assets/components-NKq783Lw.js", "/assets/chunk-2-DY34j8pW.js", "/assets/clsx-B-dksMZM.js", "/assets/utils-lR0QA9I9.js", "/assets/chunk-4-CoigCJVH.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/requireLogin-BXrannRr.js", "/assets/ChartCard-Djra4y7v.js", "/assets/Trans-COWa_CB2.js"], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_index-CY3Qr23a.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/chunk-2-DY34j8pW.js", "/assets/clsx-B-dksMZM.js", "/assets/utils-lR0QA9I9.js", "/assets/components-NKq783Lw.js", "/assets/chunk-4-CoigCJVH.js", "/assets/useTranslation-CesOUbzQ.js", "/assets/ChartCard-Djra4y7v.js", "/assets/Trans-COWa_CB2.js"], "css": [] }, "routes/admin": { "id": "routes/admin", "parentId": "root", "path": "admin", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/admin-DK0_MYqW.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/contexts-CgsfAxcF.js", "/assets/components-NKq783Lw.js", "/assets/clsx-B-dksMZM.js", "/assets/requireLogin-BXrannRr.js", "/assets/useTranslation-CesOUbzQ.js"], "css": [] }, "routes/$": { "id": "routes/$", "parentId": "root", "path": "*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/_-Cvi4AfuP.js", "imports": ["/assets/context-vN2-4QuS.js", "/assets/useTranslation-CesOUbzQ.js"], "css": [] } }, "url": "/assets/manifest-59cc2fda.js", "version": "59cc2fda" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "unstable_singleFetch": false, "unstable_lazyRouteDiscovery": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/charts.$name._index": {
    id: "routes/charts.$name._index",
    parentId: "root",
    path: "charts/:name",
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/charts.upload": {
    id: "routes/charts.upload",
    parentId: "root",
    path: "charts/upload",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/discord.error": {
    id: "routes/discord.error",
    parentId: "root",
    path: "discord/error",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/charts.liked": {
    id: "routes/charts.liked",
    parentId: "root",
    path: "charts/liked",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/charts.my": {
    id: "routes/charts.my",
    parentId: "root",
    path: "charts/my",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route6
  },
  "routes/admin": {
    id: "routes/admin",
    parentId: "root",
    path: "admin",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/$": {
    id: "routes/$",
    parentId: "root",
    path: "*",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
