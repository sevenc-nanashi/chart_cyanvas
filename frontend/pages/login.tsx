import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { useState, useRef, useEffect } from "react"
import useTranslation from "next-translate/useTranslation"
import urlcat from "urlcat"
import { isDev } from "lib/index"
import { useSession } from "lib/atom"
import { host } from "lib/utils"

const Login: NextPage<{ host: string }> = () => {
  const { t } = useTranslation("login")
  const { t: rootT } = useTranslation()

  const [authCode, setAuthCode] = useState("")
  const router = useRouter()
  const [_session, setSession] = useSession()
  const fetchStrictCall = useRef(true)
  const regenerateNonce = () => {
    fetch("/api/auth", { method: "POST" })
      .then((res) => res.json())
      .then((json) => {
        setAuthCode(json.authCode)
      })
  }
  useEffect(() => {
    if (fetchStrictCall.current && isDev) {
      fetchStrictCall.current = false
      return
    }
    regenerateNonce()
  }, [])

  const intervalStrictCall = useRef(true)
  useEffect(() => {
    if (intervalStrictCall.current && isDev) {
      intervalStrictCall.current = false
      return
    }
    const interval = setInterval(() => {
      if (!authCode) return
      fetch(urlcat(`/api/auth`, { code: authCode }), { method: "GET" })
        .then((res) => res.json())
        .then(async (json) => {
          if (json.code === "ok") {
            setSession(null as unknown as Session)
            const params = new URLSearchParams(window.location.search)
            const url = params.get("to")
            if (url) {
              router.push(url)
            } else {
              router.push("/")
            }
          } else if (json.code === "unknown_code") {
            regenerateNonce()
          }
        })
    }, 2500)
    return () => clearInterval(interval)
  }, [authCode, setSession, router])

  return (
    <>
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <div className="">
          {t("step1")}
          <div className="mx-8 my-4 p-4 rounded text-center bg-slate-200 dark:bg-slate-900">
            <div className="text-xl md:text-3xl">{host}/auth</div>
          </div>
          {t("step2")}
          <div className="mx-8 my-4 p-8 rounded text-center bg-slate-200 dark:bg-slate-900">
            <div className="text-6xl md:text-6xl font-monospace tracking-widest">
              {authCode || "--------"}
            </div>
            <div className="text-sm text-gray-500">{t("step2note")}</div>
          </div>
          <span className="leading-snug">{t("alternative")}</span>
          <div className="mt-4">
            <a
              className="p-3 px-6 bg-slate-900 rounded cursor-pointer text-white"
              href={`sonolus://${host}/auth/levels/chcy-sys-auth-confirm-${authCode}`}
            >
              {t("openSonolus")}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
