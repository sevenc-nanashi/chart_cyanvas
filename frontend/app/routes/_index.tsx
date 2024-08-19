import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { pathcat } from "pathcat";
import { Link, useLoaderData } from "@remix-run/react";
import type { Chart } from "~/lib/types";
import ChartCard from "~/components/ChartCard";
import { type LoaderFunction, json } from "@remix-run/node";
import { i18n } from "~/lib/i18n";
import { useChangeLanguage } from "remix-i18next/react";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await i18n.getLocale(request);
  return json({ locale });
};
export const handle = {
  i18n: "home",
};

export const Home = () => {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);

  const { t, i18n } = useTranslation("home");
  const { t: rootT } = useTranslation();
  const [newCharts, setNewCharts] = useState<Chart[]>([]);
  const [reachedBottom, setReachedBottom] = useState(false);

  const newChartsRef = useRef<HTMLDivElement>(null);
  const isFetching = useRef(false);

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        offset: newCharts.length,
        count: 20,
      }),
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.code === "ok") {
          setNewCharts((prev) => [...prev, ...data.charts]);
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
  }, [newCharts]);

  useEffect(() => {
    if (newCharts.length) return;
    fetchNewCharts();
  }, [newCharts, fetchNewCharts]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Trans
          i18nKey="home:welcome"
          components={[
            <Link
              to={`https://cc-wiki.sevenc7c.com/${i18n.language}/welcome`}
              key="1"
              target="_blank"
            />,
          ]}
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{t("newCharts")}</h1>
        <div
          className="flex flex-wrap mt-2 gap-4 justify-center"
          ref={newChartsRef}
        >
          {newCharts.length > 0 &&
            newCharts.map((chart) => (
              <ChartCard key={chart.name} data={chart} />
            ))}
          {[...Array(20)].map((_, i) => (
            <ChartCard spacer key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
