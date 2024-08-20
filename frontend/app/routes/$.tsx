import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";

export const loader: LoaderFunction = async ({ request }) => {
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
