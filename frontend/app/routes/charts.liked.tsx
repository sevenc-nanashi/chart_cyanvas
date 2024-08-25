import { useCallback, useEffect, useRef, useState } from "react";
import { Link, type MetaFunction } from "@remix-run/react";
import requireLogin from "~/lib/requireLogin.tsx";
import { Trans, useTranslation } from "react-i18next";
import { pathcat } from "pathcat";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import { type LoaderFunction, json } from "@remix-run/node";
import type { Chart } from "~/lib/types.ts";
import ChartCard from "~/components/ChartCard";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "liked");

  const title = `${t("title")} | ${rootT("name")}`;

  return json({ locale, title });
};

export const handle = {
  i18n: "liked",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.title,
    },
  ];
};

const MyCharts = () => {
  const { t } = useTranslation("liked");
  const [myCharts, setLikedCharts] = useState<Chart[]>([]);
  const [reachedBottom, setReachedBottom] = useState(false);

  const isFetching = useRef(false);

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        count: 20,
        offset: myCharts.length,
        liked: true,
      }),
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.code === "ok") {
          setLikedCharts((prev) => [...prev, ...data.charts]);
          if (data.charts.length < 20) {
            setReachedBottom(true);
          }
        }
      })
      .finally(() => {
        setTimeout(() => {
          isFetching.current = false;
        }, 0);
      });
  }, [myCharts]);

  useEffect(() => {
    if (myCharts.length) return;
    fetchNewCharts();
  }, [myCharts, fetchNewCharts]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <Trans i18nKey="liked:description" />
        <div className="h-4" />
        {myCharts.length === 0 && reachedBottom ? (
          <div className="text-center">{t("empty")}</div>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {myCharts.length > 0
              ? myCharts.map((chart) => (
                  <ChartCard key={chart.name} data={chart} />
                ))
              : new Array(20)
                  .fill(undefined)
                  .map((_, i) => <ChartCard data={undefined} key={i} />)}

            {new Array(20).fill(undefined).map((_, i) => (
              <ChartCard spacer key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default requireLogin(MyCharts);
