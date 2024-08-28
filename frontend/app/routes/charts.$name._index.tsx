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
} from "@fluentui/react-icons";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  defer,
} from "@remix-run/node";
import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { Fragment, createElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import ChartSection from "~/components/ChartSection";
import Checkbox from "~/components/Checkbox";
import InputTitle from "~/components/InputTitle";
import ModalPortal from "~/components/ModalPortal";
import OptionalImage from "~/components/OptionalImage";
import TextInput from "~/components/TextInput";
import { backendUrl, host } from "~/lib/config.server.ts";
import { useServerSettings, useSession } from "~/lib/contexts.ts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import type { Chart } from "~/lib/types.ts";
import { getRatingColor, isAdmin, isMine, sonolusUrl } from "~/lib/utils.ts";

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
      author: chartData.author.handle,
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

  const [showDeletionModal, setShowDeletionModal] = useState(false);

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
                  <ClockRegular />
                </span>
              )}
            </h1>

            <p className="text-lg mt-4">
              <MusicNote2Regular className="mr-1 h-6 w-6" />
              {chartData.composer}
            </p>
            <p className="text-lg">
              <MicRegular className="mr-1 h-6 w-6" />
              {chartData.artist || "-"}
            </p>

            <p className="text-lg">
              {chartData.tags.length > 0 ? (
                <>
                  <TagRegular className="mr-1 w-6 h-6" />
                  {chartData.tags.join("、")}
                </>
              ) : (
                <>
                  <TagRegular className="mr-1 w-6 h-6 text-slate-400 dark:text-slate-500" />
                  -
                </>
              )}
            </p>
            <p className="text-lg">
              <Link to={`/users/${chartData.author.handle}`}>
                <EditRegular className="mr-1 h-6 w-6" />
                {chartData.authorName || chartData.author.name}
                <span className="text-xs">#{chartData.author.handle}</span>
              </Link>
            </p>

            <p className="text-lg text-red-400">
              <HeartRegular className="mr-1 h-6 w-6" />
              {chartData.likes}
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
                className="md:h-40 md:w-40 h-32 w-32 rounded-xl"
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
              {[
                doesUserOwn && [
                  {
                    href: `/charts/${chartName}/edit`,
                    icon: EditRegular,
                    className: "button-primary",
                    text: t("edit") + adminDecoration,
                  },
                  {
                    text: t("delete") + adminDecoration,
                    icon: DeleteRegular,
                    className: "button-danger",
                    onClick: () => {
                      setShowDeletionModal(true);
                    },
                  },
                  {
                    text: t("createVariant"),
                    icon: ArrowTurnDownRightFilled,
                    className: "button-secondary",
                    href: pathcat("/charts/upload", {
                      variantOf: chartName,
                    }),
                  },
                ],
                chartData.chart && [
                  {
                    href: `/api/charts/${chartName}/download_chart`,
                    icon: ArrowDownloadRegular,
                    className: "button-tertiary",
                    text: t("download"),
                  },
                ],
                {
                  text: rootT("openInSonolus"),
                  icon: OpenRegular,
                  className: "bg-black text-white",
                  href: sonolusUrl(serverSettings, `/levels/chcy-${chartName}`),
                },
              ]
                .flat()
                .flatMap((x) => (x ? [x] : []))
                .map((item, i) => {
                  const inner = (
                    <Fragment key={i}>
                      {createElement(item.icon, {
                        className: "h-5 w-5 mr-1",
                      })}

                      {item.text}
                    </Fragment>
                  );

                  return item.href ? (
                    <Link
                      to={item.href}
                      key={i}
                      className={clsx(
                        "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200",
                        item.className,
                      )}
                      onClick={"onClick" in item ? item.onClick : undefined}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div
                      key={i}
                      className={clsx(
                        "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200 cursor-pointer",
                        item.className,
                      )}
                      onClick={"onClick" in item ? item.onClick : undefined}
                    >
                      {inner}
                    </div>
                  );
                })}
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
                user: chartData?.author.handle,
              }),
            },
          ]}
        />
      </div>
    </>
  );
};

export default ChartPage;
