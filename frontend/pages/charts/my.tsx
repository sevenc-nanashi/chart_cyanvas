import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import useTranslation from "next-translate/useTranslation"
import Trans from "next-translate/Trans"
import { useInView } from "react-intersection-observer"

import ChartCard from "components/ChartCard"
import urlcat from "urlcat"
import { useRouter } from "next/router"

const MyCharts: NextPage = () => {
  const { t } = useTranslation("my")
  const { t: rootT } = useTranslation()
  const [likedCharts, setLikedCharts] = useState<Chart[]>([])
  const [reachedBottom, setReachedBottom] = useState(false)
  const router = useRouter()

  const likedChartsRef = useRef<HTMLDivElement>(null)
  const isFetching = useRef(false)

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return
    isFetching.current = true
    fetch(
      urlcat("/api/charts", {
        count: 20,
        offset: likedCharts.length,
        include_non_public: true,
      })
    )
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login")
          return
        }
        const data = await res.json()
        if (data.code === "ok") {
          setLikedCharts((prev) => [...prev, ...data.charts])
          if (data.charts.length < 20) {
            setReachedBottom(true)
          }
        }
      })
      .finally(() => {
        setTimeout(() => {
          isFetching.current = false
        }, 0)
      })
  }, [setLikedCharts, setReachedBottom, likedCharts, router])

  useEffect(() => {
    if (likedCharts.length) return
    fetchNewCharts()
  }, [likedCharts, fetchNewCharts])

  const { ref: firstDummyChartRef, inView: isFirstDummyChartInView } =
    useInView({})

  useEffect(() => {
    if (!isFirstDummyChartInView) return
    if (!likedCharts.length) return
    if (!reachedBottom) {
      fetchNewCharts()
    }
  }, [
    reachedBottom,
    fetchNewCharts,
    isFirstDummyChartInView,
    isFetching,
    likedCharts,
  ])

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>

      <div>
        <Trans i18nKey="my:description" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        {likedCharts.length === 0 && reachedBottom ? (
          <div className="text-center">
            <Trans
              i18nKey="my:empty"
              components={[<Link href="/charts/upload" key="0" />]}
            />
          </div>
        ) : (
          <div
            className="flex flex-wrap gap-4 justify-center"
            ref={likedChartsRef}
          >
            {likedCharts.length > 0 &&
              likedCharts.map((chart) => (
                <ChartCard key={chart.name} data={chart} />
              ))}
            {reachedBottom ||
              [...Array(20)].map((_, i) => (
                <ChartCard
                  key={i}
                  ref={i === 0 ? firstDummyChartRef : undefined}
                />
              ))}

            {[...Array(20)].map((_, i) => (
              <ChartCard spacer key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCharts
