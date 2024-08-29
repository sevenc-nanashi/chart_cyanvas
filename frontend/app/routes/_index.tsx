import { ArrowRightFilled, OpenRegular } from "@fluentui/react-icons";
import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { pathcat } from "pathcat";
import { useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import ChartList from "~/components/ChartList";
import { useMyFetch, useServerSettings } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
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
  const myFetch = useMyFetch();

  const fetchNewCharts = useCallback(
    async (page: number) => {
      const res = await myFetch(
        pathcat("/api/charts", {
          count: 20,
          offset: page * 20,
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
        <h1 className="page-title">
          <Link to="/charts" className="flex items-center">
            {t("newCharts")}
            <ArrowRightFilled className="ml-2" />
          </Link>
        </h1>
        <ChartList
          fetchCharts={fetchNewCharts}
          onEmpty={() => <div className="text-center">{t("empty")}</div>}
        />
        <div className="flex justify-center">
          <Link to="/charts" className="px-2 py-1 button-primary">
            {t("more")}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Home;
