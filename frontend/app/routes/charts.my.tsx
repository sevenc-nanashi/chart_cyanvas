import { type LoaderFunction, json } from "@remix-run/node";
import { Link, type MetaFunction } from "@remix-run/react";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ChartList from "~/components/ChartList.tsx";
import { useMyFetch } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";
import type { Chart } from "~/lib/types.ts";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "my");

  const title = `${t("title")} | ${rootT("name")}`;

  return json({ locale, title });
};

export const handle = {
  i18n: "my",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.title,
    },
  ];
};

const MyCharts = () => {
  const { t } = useTranslation("my");
  const myFetch = useMyFetch();

  const fetchCharts = useCallback(
    async (page: number) => {
      const res = await myFetch(
        pathcat("/api/charts", {
          count: 20,
          offset: page * 20,
          includeNonPublic: true,
        }),
      );
      const data = await res.json();
      if (data.code === "ok") {
        return { charts: data.charts, totalPages: Math.ceil(data.total / 20) };
      }
      throw new Error(data.message);
    },
    [myFetch],
  );

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <Trans i18nKey="my:description" />
        <div className="h-4" />
        <ChartList
          fetchCharts={fetchCharts}
          pagination
          onEmpty={() => (
            <div className="text-center">
              <Trans
                i18nKey="my:empty"
                components={[<Link to="/charts/upload" key="0" />]}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default requireLogin(MyCharts);
