import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next/react";
import ChartCard from "~/components/ChartCard";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import type { Chart } from "~/lib/types";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");

  const title = rootT("name");

  return json({ locale, title });
};

export const handle = {
  i18n: "home",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.title,
    },
  ];
};

export const Home = () => {
  const { locale } = useLoaderData<typeof loader>();
  useChangeLanguage(locale);

  const { t, i18n } = useTranslation("home");
  const [newCharts, setNewCharts] = useState<Chart[]>([]);

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
      <p>
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
      </p>
      <div>
        <h1 className="page-title">{t("newCharts")}</h1>
        <div
          className="flex flex-col md:flex-row md:flex-wrap mt-2 gap-4 justify-center"
          ref={newChartsRef}
        >
          {newCharts.length > 0
            ? newCharts.map((chart) => (
                <ChartCard key={chart.name} data={chart} />
              ))
            : new Array(20)
                .fill(undefined)
                .map((_, i) => <ChartCard data={undefined} key={i} />)}

          {new Array(20).fill(undefined).map((_, i) => (
            <ChartCard spacer key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
