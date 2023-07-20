import type { NextPage } from "next"

import Head from "next/head"
import useTranslation from "next-translate/useTranslation"

import { useEffect, useRef } from "react"

const DiscordError: NextPage = () => {
  const { t } = useTranslation("discordError")
  const { t: rootT } = useTranslation()

  const code = useRef("")

  useEffect(() => {
    code.current =
      new URLSearchParams(window.location.search).get("code") ?? "unknown"
  }, [code])

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p>{t("description", { code: t(`error.${code.current}`) })}</p>
      </div>
    </div>
  )
}

export default DiscordError
