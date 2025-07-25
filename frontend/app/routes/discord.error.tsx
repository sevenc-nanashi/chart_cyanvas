import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunction, MetaFunction } from "react-router";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";

export const loader = (async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "admin");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
}) satisfies LoaderFunction;

export const handle = {
  i18n: "discordError",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [];
  }
  return [
    {
      title: data.title,
    },
  ];
};

const DiscordError = () => {
  const { t } = useTranslation("discordError");

  const code = useRef("");

  useEffect(() => {
    code.current =
      new URLSearchParams(window.location.search).get("code") ?? "unknown";
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <p>{t("description", { code: t(`error.${code.current}`) })}</p>
      </div>
    </div>
  );
};

export default DiscordError;
