import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import useTranslation from "next-translate/useTranslation"
import Trans from "next-translate/Trans"
import { useInView } from "react-intersection-observer"
import urlcat from "urlcat"

import ChartCard from "../components/ChartCard"

const Home: NextPage = () => {
  const { t } = useTranslation("home")
  const { t: rootT } = useTranslation()
  const [newCharts, setNewCharts] = useState<Chart[]>([])
  const [reachedBottom, setReachedBottom] = useState(false)

  const newChartsRef = useRef<HTMLDivElement>(null)
  const isFetching = useRef(false)

  const fetchNewCharts = useCallback(() => {
    if (isFetching.current) return
    isFetching.current = true
    fetch(
      urlcat(process.env.BACKEND_HOST!, `/api/charts`, {
        offset: newCharts.length,
        count: 20,
      })
    )
      .then(async (res) => {
        const data = await res.json()
        if (data.code === "ok") {
          setNewCharts((prev) => [...prev, ...data.charts])
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
  }, [setNewCharts, setReachedBottom, newCharts])

  useEffect(() => {
    if (newCharts.length) return
    fetchNewCharts()
  }, [newCharts, fetchNewCharts])

  const { ref: firstDummyChartRef, inView: isFirstDummyChartInView } =
    useInView({})

  useEffect(() => {
    if (!isFirstDummyChartInView) return
    if (!newCharts.length) return
    if (!reachedBottom) {
      fetchNewCharts()
    }
  }, [
    reachedBottom,
    fetchNewCharts,
    isFirstDummyChartInView,
    isFetching,
    newCharts,
  ])

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{rootT("name")}</title>
      </Head>

      <div>
        <Trans
          i18nKey="home:welcome"
          components={[<Link href="/info/about" key="1"></Link>]}
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
      </div>
    </div>
  )
}

export default Home
