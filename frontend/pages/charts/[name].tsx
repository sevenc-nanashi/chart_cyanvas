import {
  MusicNote2Regular,
  MicRegular,
  EditRegular,
  HeartRegular,
  LockClosedRegular,
  DeleteRegular,
  ClockRegular,
  TagRegular,
  OpenRegular,
  NumberSymbolFilled,
  ArrowTurnLeftDownFilled,
} from "@fluentui/react-icons"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect, useCallback, useRef, createElement } from "react"
import useTranslation from "next-translate/useTranslation"
import urlcat from "urlcat"
import ChartSection from "components/ChartSection"
import OptionalImage from "components/OptionalImage"
import { useSession } from "lib/atom"
import { getRatingColor, className, isMine, host } from "lib/utils"
import ModalPortal from "components/ModalPortal"
import { chartWithCookie } from "lib/chart"
import getConfig from "next/config"

const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const chartData = await fetch(
    urlcat(serverRuntimeConfig.backendHost!, "/api/charts/:name", {
      name: context.params!.name,
    }),
    {
      method: "GET",
    }
  ).then(async (res) => {
    const json = await res.json()

    if (json.code === "ok") {
      return json.chart
    } else {
      return null
    }
  })

  if (!chartData) {
    return {
      props: {
        chartData: null,
      },
      revalidate: 60,
      notFound: true,
    }
  }

  return {
    props: {
      chartData,
    },
    revalidate: 300,
  }
}
const ChartPage: NextPage<{ chartData: Chart }> = ({
  chartData: baseChartData,
}) => {
  const chartData = chartWithCookie(baseChartData)
  const { t: rootT } = useTranslation()
  const { t } = useTranslation("chart")

  const router = useRouter()
  const [session] = useSession()
  const { name } = router.query as { name: string }

  const [sameAuthorCharts, setSameAuthorCharts] = useState<Chart[] | null>(null)

  const isMobile = useRef(true)
  useEffect(() => {
    isMobile.current = window.navigator.maxTouchPoints > 0
  })

  const isSameAuthorChartsFinished = useRef(false)
  const fetchSameAuthorCharts = useCallback(async () => {
    if (!chartData) return
    const res = await fetch(
      urlcat(`/api/charts`, {
        author: chartData.author.handle,
        count: 5,
        offset: sameAuthorCharts?.length || 0,
      })
    )
    const json = await res.json()
    if (json.code == "ok") {
      setSameAuthorCharts((prev) => [...(prev || []), ...json.charts])
      if (json.charts.length < 5) {
        isSameAuthorChartsFinished.current = true
      }
    }
  }, [chartData, sameAuthorCharts])

  useEffect(() => {
    setSameAuthorCharts(null)
    isSameAuthorChartsFinished.current = false
  }, [name, router])

  const [waitForDeletionConfirm, setWaitForDeletionConfirm] =
    useState<CallableFunction | null>(null)

  const deleteChart = useCallback(() => {
    new Promise((resolve) => {
      setWaitForDeletionConfirm(() => resolve)
    }).then(async (confirmed) => {
      if (confirmed == null) {
        return
      }
      setWaitForDeletionConfirm(null)
      if (!confirmed) {
        return
      }
      await fetch(
        urlcat(`/api/charts/:name`, {
          name,
        }),
        {
          method: "DELETE",
        }
      )
      router.push("/charts/my")
    })
  }, [name, router])

  const showManageButton = session?.loggedIn && isMine(session, chartData)

  let wrappedDescription: string
  if (chartData.description.split(/\n/g).length > 3) {
    wrappedDescription =
      chartData.description
        .split(/\n/g)
        .splice(0, 3)
        .join("\n")
        .substring(0, 100) + "\n..."
  } else {
    wrappedDescription = chartData.description
  }

  return (
    <>
      <Head>
        <title>{chartData.title + " | " + rootT("name")}</title>
        <meta name="og:type" content="article" />
        <meta
          name="og:article:published_time"
          content={chartData.publishedAt}
        />
        <meta name="og:article:modified_time" content={chartData.updatedAt} />
        {/*<meta
          name="og:article:author:first_name"
          content={chartData.authorName || chartData.author.name}
        />
        <meta
          name="og:article:author:last_name"
          content={`#${chartData.author.handle}`}
        />*/}

        <meta
          name="og:site_name"
          content={`Chart Cyanvas - ${
            chartData.authorName || chartData.author.name
          }#${chartData.author.handle}`}
        />
        <meta name="og:description" content={wrappedDescription} />
        <meta
          name="og:title"
          content={`${chartData.title} - ${chartData.composer}${
            chartData.artist ? ` / ${chartData.artist}` : ""
          }（Lv. ${chartData.rating}、♡${chartData.likes}）`}
        />
        <meta name="og:url" content={`${host}/charts/${chartData.name}`} />
        <meta
          name="og:image"
          content={
            chartData.cover && chartData.cover.startsWith("/")
              ? `${publicRuntimeConfig.host}${chartData.cover}`
              : chartData.cover
          }
        />
      </Head>
      <ModalPortal isOpen={!!waitForDeletionConfirm}>
        <h1 className="text-xl font-bold text-normal mb-2 break-word">
          {t("deletionModal.title")}
        </h1>
        <p className="text-sm text-gray-500 text-normal mb-1">
          {t("deletionModal.description")}
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <div
            className="px-4 py-2 rounded text-sm border-2 border-slate-500 dark:border-white text-normal cursor-pointer"
            onClick={() => {
              waitForDeletionConfirm?.(false)
            }}
          >
            {rootT("cancel")}
          </div>
          <div
            className={className(
              "px-4 py-2 rounded text-sm bg-red-500 text-white cursor-pointer"
            )}
            onClick={() => {
              waitForDeletionConfirm?.(true)
            }}
          >
            {t("deletionModal.ok")}
          </div>
        </div>
      </ModalPortal>

      <div className="flex flex-col">
        <div className="min-h-[300px] w-full flex relative">
          <div className="flex flex-col flex-grow max-w-[calc(100%_-_128px)]">
            {chartData.variantOf && (
              <Link href={`/charts/${chartData.variantOf.name}`}>
                <h4 className="text-gray-500">
                  <ArrowTurnLeftDownFilled />
                  {chartData.variantOf.title}{" "}
                </h4>
              </Link>
            )}
            <h1
              className={className(
                "text-4xl font-bold break-words",
                !!chartData.data || "text-yellow-700"
              )}
            >
              {chartData.title}
              {chartData.isPublic || (
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
            <Link href={`/users/${chartData.author.handle}`}>
              <p className="text-lg">
                <EditRegular className="mr-1 h-6 w-6" />
                {chartData.authorName || chartData.author.name}
                <span className="text-xs">#{chartData.author.handle}</span>
              </p>
            </Link>

            <p className="text-lg text-red-400">
              <HeartRegular className="mr-1 h-6 w-6" />
              {chartData.likes}
            </p>

            <p className="text-gray-500 font-monospace text-sm">
              <NumberSymbolFilled className="mr-1 h-4 w-4" />
              {name}
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
                  className={
                    "absolute text-xs top-0 left-0 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white " +
                    getRatingColor(chartData.rating)
                  }
                >
                  Lv. {chartData.rating}
                </div>
              )}
            </div>

            <div className="flex flex-col w-32 md:w-40 mt-4 text-center gap-2">
              {[
                (item: {
                  icon: React.FC<{ className: string }>
                  text: string
                }) => (
                  <>
                    {createElement(item.icon, {
                      className: "h-5 w-5 mr-1",
                    })}

                    {item.text}
                  </>
                ),
              ].map((inner) =>
                [
                  ...(showManageButton
                    ? [
                        {
                          href: `/charts/${name}/edit`,
                          icon: EditRegular,
                          className: "bg-theme text-white",
                          text: t("edit"),
                        },
                        {
                          text: t("delete"),
                          icon: DeleteRegular,
                          className: "bg-red-500 text-white",
                          onClick: deleteChart,
                        },
                      ]
                    : []),
                  isMobile && {
                    text: rootT("openInSonolus"),
                    icon: OpenRegular,
                    className: "bg-black text-white",
                    href: `sonolus://${host}/levels/chcy-${chartData.name}`,
                  },
                ]
                  .flatMap((e) => (e ? [e] : []))
                  .map((item, i) =>
                    item.href ? (
                      <Link
                        href={item.href}
                        key={i}
                        className={className(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200",
                          item.className
                        )}
                        onClick={item.onClick}
                      >
                        {inner(item)}
                      </Link>
                    ) : (
                      <div
                        key={i}
                        className={className(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200 cursor-pointer",
                          item.className
                        )}
                        onClick={item.onClick}
                      >
                        {inner(item)}
                      </div>
                    )
                  )
              )}
            </div>
          </div>
        </div>
        <ChartSection
          key={chartData?.name}
          items={[
            {
              title: t("variants"),
              items: chartData?.variants || null,
              isFinished: true,
              fetchMore: async () => {
                null
              },
              itemsCountPerPage: 0,
            },
            {
              title: t("sameAuthor"),
              items: sameAuthorCharts,
              isFinished: isSameAuthorChartsFinished.current,
              fetchMore: fetchSameAuthorCharts,
              itemsCountPerPage: 5,
            },
          ]}
        />
      </div>
    </>
  )
}

export default ChartPage
