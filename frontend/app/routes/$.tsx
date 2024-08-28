import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/react";
import cookie from "cookie";
import { useTranslation } from "react-i18next";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname.startsWith("/ja") || url.pathname.startsWith("/en")) {
    const newUrl = new URL(request.url);
    const language = url.pathname.slice(1, 3);
    newUrl.pathname = newUrl.pathname.replace(/^\/(ja|en)/, "");
    return redirect(newUrl.toString(), {
      status: 308,
      headers: {
        "set-cookie": cookie.serialize("locale", language, {
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 365,
        }),
      },
    });
  }
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "notFound");

  const title = `${t("title")} | ${rootT("name")}`;

  return json({ locale, title }, { status: 404 });
};

export const handle = {
  i18n: "notFound",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.title,
    },
  ];
};

export default function NotFound() {
  const [t] = useTranslation("notFound");
  return (
    <div>
      <h1 className="page-title">{t("heading")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
