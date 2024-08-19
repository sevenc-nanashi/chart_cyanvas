import type { NextPage } from "next"

import Head from "next/head"
import useTranslation from "next-translate/useTranslation"

import Trans from "next-translate/Trans"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { useLogin } from "lib/useLogin"

const Login: NextPage = () => {
  const { t } = useTranslation("login")
  const { t: rootT } = useTranslation()

  const { loginState, startLogin } = useLogin({
    onLoginSuccess: () => {
      const params = new URLSearchParams(window.location.search)
      window.location.href = params.get("to") || "/"
    },
  })

  const loginStarted = useRef(false)
  useEffect(() => {
    if (!loginStarted.current) {
      loginStarted.current = true
      startLogin()
    }
  }, [startLogin])

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <Trans
          i18nKey="header:login.description"
          components={{
            link: <Link href={loginState?.url || ""} target="_blank" />,
            br: <br />,
          }}
        />
      </div>
    </div>
  )
}

export default Login
