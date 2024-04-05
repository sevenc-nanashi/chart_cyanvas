import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import useTranslation from "next-translate/useTranslation"
import LogoCF from "public/logo-cf.svg"
import Trans from "next-translate/Trans"
import urlcat from "urlcat"
import { useSession } from "../lib/atom"
import SideMenu from "./SideMenu"
import ModalPortal from "./ModalPortal"

type LoginState = { uuid: string; url: URL }
const Header = () => {
  const { t } = useTranslation("header")

  const [session] = useSession()
  const [showMenu, setShowMenu] = useState(false)

  const [loginState, setLoginState] = useState<LoginState | undefined>()
  const loginUuid = useRef<string | undefined>()
  useEffect(() => {
    if (loginState) {
      loginUuid.current = loginState.uuid
    }
  }, [loginState])
  const loginInterval = useRef<number | undefined>()
  const checkLogin = useCallback(() => {
    fetch(urlcat("/api/login/status", { uuid: loginUuid.current }), {
      method: "GET",
    })
      .then((res) => res.json())
      .then((state: { code: string }) => {
        if (state.code === "ok") {
          window.location.reload()
        }
      })
  }, [])
  const onLogin = useCallback(() => {
    fetch("/api/login/start", { method: "POST" })
      .then((res) => res.json())
      .then((state: { uuid: string; url: string }) => {
        setLoginState({ uuid: state.uuid, url: new URL(state.url) })
        loginInterval.current = setInterval(
          checkLogin,
          2500
        ) as unknown as number
        window.open(state.url, "_blank")
      })
  }, [setLoginState, checkLogin])

  return (
    <>
      <ModalPortal
        isOpen={!!loginState}
        close={() => {
          setLoginState(undefined)
          clearInterval(loginInterval.current)
        }}
      >
        <h1 className="text-xl font-bold mb-2">{t("login.title")}</h1>
        <p className="whitespace-pre-wrap">
          <Trans
            i18nKey="header:login.description"
            components={{
              link: <Link href={loginState?.url || ""} target="_blank" />,
              br: <br />,
            }}
          />
        </p>
      </ModalPortal>
      <header className="bg-theme dark:bg-gray-800 flex items-center pl-4 pr-8 h-20 shadow-sm shadow-[#83ccd288]">
        <Link href="/" className="flex items-center">
          <LogoCF
            alt="logo"
            className="text-white dark:text-theme"
            width="56px"
            height="56px"
            viewBox="0 0 512 512"
          />
          <span className="text-2xl md:text-4xl text-white dark:text-theme font-extrabold">
            Chart
            <br className="block md:hidden" />
            <span className="hidden md:inline"> </span>
            Cyanvas β
            {process.env.NODE_ENV !== "production" && (
              <span className="ml-2 opacity-50">(dev)</span>
            )}
          </span>
        </Link>
        <div className="flex-grow" />

        {session && session.loggedIn !== undefined ? (
          session.loggedIn ? (
            <div
              className="flex items-end text-white bg-white p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer"
              onClick={() => setShowMenu(true)}
            >
              <div
                className="rounded-full w-8 h-8 md:mr-2"
                style={{
                  backgroundColor: session.user.bgColor,
                }}
              />
              <div className="font-bold text-xl text-white md:block hidden">
                {session.user.name}
                <span className="text-sm">#{session.user.handle}</span>
              </div>
            </div>
          ) : (
            <button
              className="p-2 px-4 rounded font-bold bg-white dark:bg-theme text-theme dark:text-slate-900 ml-2"
              onClick={onLogin}
            >
              {t("login.button")}
            </button>
          )
        ) : (
          <div className="p-4 w-32 rounded font-bold bg-slate-100 dark:bg-theme text-theme dark:text-slate-900 animate-pulse" />
        )}
      </header>
      {showMenu && session && session.loggedIn && (
        <SideMenu close={() => setShowMenu(false)} />
      )}
    </>
  )
}

export default Header
