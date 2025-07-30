import { ArrowLeftFilled, LockClosedRegular } from "@fluentui/react-icons";
import { pathcat } from "pathcat";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData, useParams } from "react-router";
import ChartForm from "~/components/ChartForm.tsx";
import { backendUrl } from "~/lib/config.server.ts";
import { useSession } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";
import type { AdminOnlyUserData, Chart, User } from "~/lib/types.ts";
import { isAdmin } from "~/lib/utils.ts";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const chartData = await fetch(
    pathcat(backendUrl, "/api/charts/:name", {
      name: params.name,
    }),
    {
      method: "GET",
    },
  ).then(async (res) => {
    const json = await res.json();

    if (json.code === "ok") {
      return json.chart as Chart;
    } else {
      return null;
    }
  });

  if (!chartData) {
    throw new Response(null, {
      status: 404,
    });
  }

  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "upload");

  const title = `${t("titleEdit", { title: chartData.title })} | ${rootT("name")}`;

  return { locale, title, chartData };
};

export const handle = {
  i18n: "upload",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

function EditChart() {
  const { chartData } = useLoaderData<typeof loader>();
  const { name } = useParams();
  const scheduledAt = chartData.scheduledAt
    ? new Date(chartData.scheduledAt)
    : undefined;
  const session = useSession();
  const { t } = useTranslation("upload");

  const [adminOnlyUserData, setAdminOnlyUserData] = useState<
    (AdminOnlyUserData & { user: User }) | undefined
  >(undefined);
  useEffect(() => {
    if (isAdmin(session) && chartData) {
      (async () => {
        console.log("fetching admin info");
        const res = await fetch(
          pathcat("/api/admin/users/:handle", {
            handle: chartData.author.handle,
          }),
        );
        const data = await res.json();

        if (data.code === "ok") {
          console.log("fetching user data");
          const res = await fetch(
            pathcat("/api/users/:handle", {
              handle: chartData.author.handle,
            }),
          );
          const user = await res.json();

          setAdminOnlyUserData({
            ...data.user,
            user: user.user,
          });
        }
      })();
    }
  }, [session, chartData]);
  return (
    <>
      <h1 className="page-title">
        <Link
          to={`/charts/${name}`}
          className="underline text-theme-text flex items-center mr-2"
        >
          <ArrowLeftFilled />
        </Link>
        {t("titleEdit", { title: chartData.title })}
        {chartData.visibility === "public" || <LockClosedRegular />}
      </h1>
      <ChartForm
        isEdit={true}
        chartName={name!}
        chartData={{
          title: chartData.title,
          description: chartData.description,
          composer: chartData.composer,
          artist: chartData.artist || "",
          genre: chartData.genre || "others",
          tags: chartData.tags.map((tag) => ({ id: tag, text: tag })),
          rating: chartData.rating,
          authorHandle: chartData.author.handle,
          authorName: chartData.authorName || chartData.author.name,
          visibility: chartData.visibility,
          isChartPublic: !!chartData.chart,
          variant: chartData.variantOf?.name || "",
          scheduledAt,

          chart: undefined,
          bgm: undefined,
          cover: undefined,
        }}
        adminOnlyAuthorData={adminOnlyUserData}
      />
    </>
  );
}
export default requireLogin(EditChart);
