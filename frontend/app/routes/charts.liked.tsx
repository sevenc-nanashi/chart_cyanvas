import { type LoaderFunctionArgs, json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import ChartList from "~/components/ChartList.tsx";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";
import type { Chart } from "~/lib/types.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
      title: data!.title,
    },
  ];
};

const MyCharts = () => {
  const { t } = useTranslation("liked");
  const [likedCharts, setLikedCharts] = useState<Chart[] | undefined>(
    undefined,
  );

  const isFetching = useRef(false);

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return;
    isFetching.current = true;
    fetch(
      pathcat("/api/charts", {
        count: 20,
        offset: likedCharts?.length || 0,
        liked: true,
      }),
    )
      .then(async (res) => {
        const data = await res.json();
        if (data.code === "ok") {
          setLikedCharts(data.charts);
        }
      })
      .finally(() => {
        setTimeout(() => {
          isFetching.current = false;
        }, 0);
      });
  }, [likedCharts]);

  useEffect(() => {
    if (likedCharts?.length) return;
    fetchNewCharts();
  }, [likedCharts, fetchNewCharts]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <Trans i18nKey="liked:description" />
        <div className="h-4" />
        {likedCharts?.length === 0 ? (
          <div className="text-center">{t("empty")}</div>
        ) : (
          <ChartList charts={likedCharts} />
        )}
      </div>
    </div>
  );
};

export default requireLogin(MyCharts);
