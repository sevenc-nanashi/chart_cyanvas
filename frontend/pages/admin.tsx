import { NextPage } from "next"
import Head from "next/head"
import useTranslation from "next-translate/useTranslation"
import Link from "next/link"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import requireLogin from "lib/requireLogin"
import { className } from "lib/utils"

const Admin: NextPage = () => {
  const { t } = useTranslation("admin")
  const { t: rootT } = useTranslation()
  const router = useRouter()

  const fetchAdmin = useCallback(() => {
    fetch("/api/admin").then(async (res) => {
      const json = await res.json()
      if (json.code === "forbidden") {
        router.push("/")
      }

      setData(json.data)
    })
  }, [router])
  useEffect(() => {
    fetchAdmin()
    const interval = setInterval(fetchAdmin, 10000)
    return () => clearInterval(interval)
  }, [fetchAdmin])

  const [data, setData] = useState<{
    stats: {
      charts: {
        public: number
        private: number
      }

      users: {
        original: number
        alt: number
        discord: number
      }
      files: Record<string, number>
    }
  } | null>(null)

  const card = "bg-slate-100 dark:bg-slate-800 rounded-md p-4"
  const statCard = className(card, "w-full md:w-80")
  const actionCard = className(card, "w-full")

  if (!data) return null

  return (
    <>
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.users.title")}</h2>
            <p className="text-4xl font-bold">
              {data.stats.users.original + data.stats.users.alt}
            </p>
            <div className="flex flex-col">
              <div className="flex">
                <p className="flex-1">{t("stats.users.original")}</p>
                <p className="flex-1 text-right">{data.stats.users.original}</p>
              </div>
              <div className="flex">
                <p className="flex-1">{t("stats.users.alt")}</p>
                <p className="flex-1 text-right">{data.stats.users.alt}</p>
              </div>
              <div className="flex">
                <p className="flex-1">{t("stats.users.discord")}</p>
                <p className="flex-1 text-right">{data.stats.users.discord}</p>
              </div>
            </div>
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.charts.title")}</h2>
            <p className="text-4xl font-bold">
              {data.stats.charts.public + data.stats.charts.private}
            </p>
            <div className="flex flex-col">
              <div className="flex">
                <p className="flex-1">{t("stats.charts.public")}</p>
                <p className="flex-1 text-right">{data.stats.charts.public}</p>
              </div>
              <div className="flex">
                <p className="flex-1">{t("stats.charts.private")}</p>
                <p className="flex-1 text-right">{data.stats.charts.private}</p>
              </div>
            </div>
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.files")}</h2>
            <p className="text-4xl font-bold">
              {[...Object.values(data.stats.files)].reduce((a, b) => a + b, 0)}
            </p>
            <div className="flex flex-col">
              {Object.entries(data.stats.files).map(([key, value]) => (
                <div key={key} className="flex">
                  <p className="flex-1">{key}</p>
                  <p className="flex-1 text-right">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("sidekiq.title")}</h2>
            <p className="text-md">
              <Link href="/admin/sidekiq" target="_blank">
                {t("sidekiq.description")}
              </Link>
            </p>
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4">{t("actions.title")}</h2>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          <div className={actionCard}>
            <h3 className="text-md font-bold">
              {t("actions.reconvert_chart.title")}
            </h3>
            <p>{t("actions.reconvert_chart.description")}</p>
            <div
              className="button-primary mt-2 p-2"
              onClick={async () => {
                const {
                  data: { count },
                } = await fetch("/api/admin/reconvert_chart", {
                  method: "POST",
                }).then((res) => res.json())
                alert(t("actions.reconvert_chart.success", { count }))
              }}
            >
              {t("actions.reconvert_chart.button")}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default requireLogin(Admin)
