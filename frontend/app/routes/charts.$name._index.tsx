import {
  ArrowDownloadRegular,
  ArrowTurnDownRightFilled,
  ArrowTurnLeftDownFilled,
  ClockRegular,
  DeleteRegular,
  EditRegular,
  HeartRegular,
  LockClosedRegular,
  MicRegular,
  MusicNote2Regular,
  NumberSymbolFilled,
  OpenRegular,
  TagRegular,
  WarningRegular,
} from "@fluentui/react-icons";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  defer,
} from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ChartSection from "~/components/ChartSection";
import Checkbox from "~/components/Checkbox";
import InputTitle from "~/components/InputTitle";
import ModalPortal from "~/components/ModalPortal";
import OptionalImage from "~/components/OptionalImage";
import TextInput from "~/components/TextInput";
import Tooltip from "~/components/Tooltip";
import { backendUrl, host } from "~/lib/config.server.ts";
import { useServerSettings, useSession } from "~/lib/contexts.ts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import type { Chart } from "~/lib/types.ts";
import {
  getRatingColor,
  isAdmin,
  isMine,
  sonolusUrl,
  useMergeChartTags,
} from "~/lib/utils.ts";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");

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

  const chartsByThisCharter = fetch(
    pathcat(backendUrl, "/api/charts", {
      authorHandles: chartData.author.handle,
    }),
    {
      method: "GET",
    },
  ).then(async (res) => {
    const json = await res.json();

    if (json.code === "ok") {
      return json.charts as Chart[];
    } else {
      return [];
    }
  });

  const title = `${chartData.title} | ${rootT("name")}`;

  return defer({
    chartData,
    chartsByThisCharter,
    title,
    host,
  });
};
export const handle = {
  i18n: "chart",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const chartData = data!.chartData;
  return [
    {
      title: data!.title,
    },

    {
      name: "og:type",
      content: "article",
    },
    {
      name: "og:article:published_time",
      content: chartData.publishedAt,
    },
    {
      name: "og:article:modified_time",
      content: chartData.updatedAt,
    },
    {
      name: "og:site_name",
      content: `Chart Cyanvas - ${chartData.authorName || chartData.author.name}#${chartData.author.handle}`,
    },
    {
      name: "og:description",
      content: chartData.description,
    },
    {
      name: "og:title",
      content: `${chartData.title} - ${chartData.composer}${chartData.artist ? ` / ${chartData.artist}` : ""} (Lv. ${chartData.rating}, \u{2661}${chartData.likes})`,
    },
    {
      name: "og:url",
      content: `${data!.host}/charts/${chartData.name}`,
    },
    {
      name: "og:image",
      content: chartData.cover?.startsWith("/")
        ? `${data!.host}${chartData.cover}`
        : chartData.cover,
    },
  ];
};

const ChartPage = () => {
  const { chartData, chartsByThisCharter } = useLoaderData<typeof loader>();
  const { name: chartName } = useParams();
  if (!chartName) {
    throw new Error("chartName is required");
  }
  const { t: rootT } = useTranslation();
  const { t } = useTranslation("chart");

  const navigate = useNavigate();
  const serverSettings = useServerSettings();
  const session = useSession();
  const mergeChartTags = useMergeChartTags();

  const [showDeletionModal, setShowDeletionModal] = useState(false);

  const [publishedAt, setPublishedAt] = useState("-");

  const tags = mergeChartTags(chartData);

  useEffect(() => {
    if (chartData.publishedAt) {
      const date = new Date(chartData.publishedAt);
      setPublishedAt(
        new Intl.DateTimeFormat([], {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date),
      );
    }
  }, [chartData.publishedAt]);

  const [warnAuthor, setWarnAuthor] = useState(false);

  const sendDeleteRequest = useCallback(async () => {
    if (session?.loggedIn && session.user.userType === "admin") {
      await fetch("/api/admin/delete-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: chartName,
          warn: warnAuthor,
          reason: (
            document.querySelector("[data-name=warnReason]") as HTMLInputElement
          ).value,
        }),
      });
      navigate(
        pathcat("/users/:handle", {
          handle: chartData.author.handle,
        }),
      );
    } else {
      await fetch(
        pathcat("/api/charts/:name", {
          name: chartName,
        }),
        {
          method: "DELETE",
        },
      );
      navigate("/charts/my");
    }
  }, [chartName, navigate, session, warnAuthor, chartData]);

  const doesUserOwn =
    isMine(session, chartData) ||
    (session?.loggedIn && session.user.userType === "admin");
  const adminDecoration = isAdmin(session) ? rootT("adminDecorate") : "";

  return (
    <>
      <ModalPortal isOpen={showDeletionModal}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendDeleteRequest();
          }}
        >
          <h1 className="text-xl font-bold text-normal mb-2 break-word">
            {t("deletionModal.title")}
          </h1>
          {isAdmin(session) ? (
            <>
              <Checkbox
                label={t("deletionModal.warnAuthor")}
                checked={warnAuthor}
                onChange={(e) => setWarnAuthor(e)}
              />
              <InputTitle text={t("deletionModal.warnReason")}>
                <TextInput
                  name="warnReason"
                  textarea
                  optional
                  className="w-full h-32"
                  disabled={!warnAuthor}
                />
              </InputTitle>
            </>
          ) : (
            <p className="text-sm text-gray-500 text-normal mb-1">
              {t("deletionModal.description")}
            </p>
          )}
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="px-4 py-2 button-cancel"
              onClick={() => {
                setShowDeletionModal(false);
              }}
            >
              {rootT("cancel")}
            </button>
            <button type="submit" className={clsx("px-4 py-2 button-danger")}>
              {t("deletionModal.ok")}
            </button>
          </div>
        </form>
      </ModalPortal>

      <div className="flex flex-col">
        <div className="min-h-[300px] w-full flex relative">
          <div className="flex flex-col flex-grow max-w-[calc(100%_-_128px)]">
            {chartData.variantOf && (
              <h4 className="text-gray-500">
                <Link to={`/charts/${chartData.variantOf.name}`}>
                  <ArrowTurnLeftDownFilled />
                  {chartData.variantOf.title}{" "}
                </Link>
              </h4>
            )}
            <h1
              className={clsx(
                "page-title-larger break-words mr-2",
                !!chartData.data || "text-yellow-700",
              )}
            >
              {chartData.title}
              {chartData.visibility === "scheduled" && (
                <span className="ml-2 text-slate-900 dark:text-white">
                  <ClockRegular />
                </span>
              )}
              {chartData.visibility === "private" && (
                <span className="ml-2 text-slate-900 dark:text-white">
                  <LockClosedRegular />
                </span>
              )}
              {!!chartData.data || (
                <span className="ml-2 text-yellow-700">
                  <Tooltip text={t("noLevelData")}>
                    <WarningRegular />
                  </Tooltip>
                </span>
              )}
            </h1>

            <p className="mt-4">
              <MusicNote2Regular className="mr-1 h-6 w-6" />
              {chartData.composer}
            </p>
            <p>
              <MicRegular className="mr-1 h-6 w-6" />
              {chartData.artist || "-"}
            </p>

            <p>
              {tags.length > 0 ? (
                <>
                  <TagRegular className="mr-1 w-6 h-6" />
                  {tags.map((tag, i) => (
                    <Fragment key={i}>
                      {i === 0 && chartData.genre !== "other" ? (
                        <Link
                          to={pathcat("/charts", { genres: chartData.genre })}
                        >
                          {tag}
                        </Link>
                      ) : (
                        <Link to={pathcat("/charts", { tags: tag })}>
                          {tag}
                        </Link>
                      )}
                      {i < tags.length - 1 && rootT("separator")}
                    </Fragment>
                  ))}
                </>
              ) : (
                <>
                  <TagRegular className="mr-1 w-6 h-6 text-slate-400 dark:text-slate-500" />
                  -
                </>
              )}
            </p>
            <p>
              <Link to={`/users/${chartData.author.handle}`}>
                <EditRegular className="mr-1 h-6 w-6" />
                {chartData.authorName || chartData.author.name}
                <span className="text-xs">#{chartData.author.handle}</span>
              </Link>
            </p>

            <p className="text-red-400">
              <HeartRegular className="mr-1 h-6 w-6" />
              {chartData.likes}
            </p>

            <p>
              <ClockRegular className="mr-1 h-6 w-6" />
              {publishedAt === "-" ? (
                "-"
              ) : (
                <time dateTime={chartData.publishedAt}>{publishedAt}</time>
              )}
            </p>

            <p className="text-gray-500 font-monospace text-sm">
              <NumberSymbolFilled className="mr-1 h-4 w-4" />
              {chartName}
            </p>

            <p className="flex-grow mt-4 whitespace-pre-wrap">
              {chartData.description}
            </p>
          </div>

          <div className="flex flex-col">
            <div className="md:h-40 md:w-40 rounded-xl square w-32 h-32 relative">
              <OptionalImage
                src={chartData?.cover}
                alt={chartData?.title}
                className="md:h-40 md:w-40 h-32 w-32 rounded-xl shadow-lg"
                width={160}
                height={160}
              />
              {chartData && (
                <div
                  className={`absolute text-xs top-0 left-0 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white ${getRatingColor(chartData.rating)}`}
                >
                  Lv. {chartData.rating}
                </div>
              )}
            </div>

            <div className="flex flex-col w-32 md:w-40 mt-4 text-center gap-2">
              {doesUserOwn && (
                <>
                  <Link
                    to={pathcat("/charts/:name/edit", { name: chartName })}
                    className="button button-primary text-center p-1"
                  >
                    <EditRegular className="small-button-icon" />
                    {t("edit") + adminDecoration}
                  </Link>
                  <button
                    className="button button-danger text-center p-1"
                    onClick={() => {
                      setShowDeletionModal(true);
                    }}
                  >
                    <DeleteRegular className="h-5 w-5 mr-1" />
                    {t("delete") + adminDecoration}
                  </button>
                  <Link
                    to={pathcat("/charts/upload", { variantOf: chartName })}
                    className="button button-secondary text-center p-1"
                  >
                    <ArrowTurnDownRightFilled className="small-button-icon" />
                    {t("createVariant")}
                  </Link>
                </>
              )}
              {chartData.chart && (
                <a
                  href={pathcat("/api/charts/:name/download_chart", {
                    name: chartName,
                  })}
                  target="_blank"
                  className="button-tertiary text-center p-1"
                >
                  <ArrowDownloadRegular className="small-button-icon" />
                  {t("download")}
                </a>
              )}

              <a
                href={sonolusUrl(serverSettings, `/levels/chcy-${chartName}`)}
                target="_blank"
                className="button button-sonolus text-center p-1"
              >
                <OpenRegular className="small-button-icon" />
                {rootT("openInSonolus")}
              </a>
            </div>
          </div>
        </div>
        <ChartSection
          key={chartData?.name}
          sections={[
            {
              title: t("variants"),
              items: chartData?.variants || null,
            },
            {
              title: t("sameAuthor"),
              items: chartsByThisCharter,
              listUrl: pathcat("/charts", {
                authorHandles: chartData?.author.handle,
              }),
            },
          ]}
        />
      </div>
    </>
  );
};

export default ChartPage;
