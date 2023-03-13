import { NextPage } from "next"
import Head from "next/head"
import useTranslation from "next-translate/useTranslation"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import requireLogin from "lib/requireLogin"
import { className } from "lib/utils"

const Admin: NextPage = () => {
  const { t } = useTranslation("admin")
  const { t: rootT } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin").then(async (res) => {
        const json = await res.json()
        if (json.code === "forbidden") {
          router.push("/")
        }

        setData(json.data)
      })
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  const [data, setData] = useState<{
    stats: {
      charts: number
      users: number
      files: Record<string, number>
      jobs: {
        active: number
        total: number
        success: number
        error: number
      }
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
            <h2 className="text-xl font-bold">{t("stats.users")}</h2>
            <p className="text-4xl font-bold">{data.stats.users}</p>
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.charts")}</h2>
            <p className="text-4xl font-bold">{data.stats.charts}</p>
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
            <h2 className="text-xl font-bold">{t("stats.jobs.title")}</h2>
            <p className="text-4xl font-bold">
              {data.stats.jobs.active} / {data.stats.jobs.total} <br />
              <span className="text-sm">
                {t("stats.jobs.details", {
                  success: data.stats.jobs.success,
                  error: data.stats.jobs.error,
                })}
              </span>
            </p>
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4">{t("actions.title")}</h2>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          <div className={actionCard}>
            <h3 className="text-md font-bold">
              {t("actions.reconvert_sus.title")}
            </h3>
            <p>{t("actions.reconvert_sus.description")}</p>
            <div
              className="button-primary mt-2 p-2"
              onClick={async () => {
                const {
                  data: { count },
                } = await fetch("/api/admin/reconvert_sus", {
                  method: "POST",
                }).then((res) => res.json())
                alert(t("actions.reconvert_sus.success", { count }))
              }}
            >
              {t("actions.reconvert_sus.button")}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default requireLogin(Admin)
