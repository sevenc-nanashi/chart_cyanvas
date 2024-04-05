import "styles/globals.scss"
import type { AppProps } from "next/app"
import Trans from "next-translate/Trans"
import useTranslation from "next-translate/useTranslation"
import { useAtom } from "jotai"
import { useEffect } from "react"
import Header from "components/Header"
import "i18n"
import { serverErrorAtom, useSession } from "lib/atom"

import "styles/markdown.scss"
import ModalPortal from "components/ModalPortal"
import Footer from "components/Footer"

function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useSession()
  const [serverError, setServerError] = useAtom(serverErrorAtom)
  const { t } = useTranslation()

  useEffect(() => {
    if (session && session.loggedIn !== undefined) {
      return
    }
    fetch(`/api/login/session`, {
      method: "GET",
    }).then(async (res) => {
      const json = await res.json()
      if (json.code === "ok") {
        const [altUsers, discordUser] = await Promise.all([
          fetch(`/api/my/alt_users`).then(
            async (res) => (await res.json()).users
          ),
          fetch(`/api/my/discord`).then(
            async (res) => (await res.json()).discord
          ),
        ])

        setSession({
          loggedIn: true,
          user: json.user,
          altUsers,
          discord: discordUser,
        })
      } else {
        setSession({ loggedIn: false })
      }
    })
  }, [session, setSession])
  return (
    <div className="bg-white dark:bg-slate-800 text-normal min-h-screen flex flex-col">
      <Header />
      <ModalPortal isOpen={serverError}>
        <h1 className="text-xl font-bold mb-2">{t("serverError")}</h1>
        <p className="text-sm text-gray-500">
          <Trans
            components={[<a href="https://discord.gg/2NP3U3r8Rz" key="0" />]}
            i18nKey="serverErrorNote"
          />
        </p>
        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer"
            onClick={() => setServerError(false)}
          >
            {t("close")}
          </div>
        </div>
      </ModalPortal>
      <div className="p-4 md:px-40 lg:px-60 flex-grow">
        <Component {...pageProps} />
      </div>
      <Footer />
    </div>
  )
}

export default App
