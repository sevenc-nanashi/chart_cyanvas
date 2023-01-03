import "styles/globals.scss"
import type { AppProps } from "next/app"
import Header from "components/Header"
import "i18n"
import { useEffect } from "react"
import { useSession } from "lib/atom"
import urlcat from "urlcat"

import "styles/markdown.scss"

function App({ Component, pageProps }: AppProps) {
  const [session, setSession] = useSession()
  useEffect(() => {
    if (session) return
    fetch(urlcat(process.env.BACKEND_HOST!, `/api/auth/session`), {
      method: "GET",
    }).then(async (res) => {
      const json = await res.json()
      if (json.code === "ok") {
        const altUsers = await fetch(
          urlcat(process.env.BACKEND_HOST!, `/api/my/alt_users`)
        ).then(async (res) => (await res.json()).users)
        setSession({ loggedIn: true, user: json.user, altUsers })
      } else {
        setSession({ loggedIn: false })
      }
    })
  }, [session, setSession])
  return (
    <div className="bg-white dark:bg-slate-800 text-normal min-h-screen">
      <Header />
      {session && (
        <div className="p-4 md:px-40">
          <Component {...pageProps} />
        </div>
      )}
    </div>
  )
}

export default App
