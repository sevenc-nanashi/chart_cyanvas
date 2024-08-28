import { OpenRegular } from "@fluentui/react-icons";
import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ChartList from "~/components/ChartList";
import { useServerSettings } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import type { Chart } from "~/lib/types";
import { sonolusUrl } from "~/lib/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");

  const title = rootT("name");

  return json({ title });
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
  const serverSettings = useServerSettings();

  const { t, i18n } = useTranslation("home");
  const [newCharts, setNewCharts] = useState<Chart[] | undefined>(undefined);

  const isFetching = useRef(false);

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        offset: newCharts?.length || 0,
        count: 20,
      }),
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.code === "ok") {
          setNewCharts((prev) => [...(prev || []), ...data.charts]);
        }
      })
      .finally(() => {
        setTimeout(() => {
          isFetching.current = false;
        }, 0);
      });
  }, [newCharts]);

  useEffect(() => {
    if (newCharts?.length) return;
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
      <div className="flex justify-center">
        <a
          className="px-2 py-1 button bg-black text-white inline-flex items-center"
          href={sonolusUrl(serverSettings, "/")}
        >
          <OpenRegular className="h-5 w-5 mr-1" />
          {t("openInSonolus")}
        </a>
      </div>
      <div>
        <h1 className="page-title">{t("newCharts")}</h1>
        <ChartList charts={newCharts} />
      </div>
    </div>
  );
};

export default Home;
