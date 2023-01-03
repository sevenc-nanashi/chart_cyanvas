import Link from "next/link"
import { useState } from "react"
import useTranslation from "next-translate/useTranslation"
import { useSession } from "../lib/atom"
import SideMenu from "./SideMenu"

const Header = () => {
  const { t } = useTranslation("header")
  const { t: rootT } = useTranslation()

  const [session] = useSession()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <header className="bg-theme dark:bg-slate-900 flex items-center px-8 h-20 shadow-sm shadow-[#83ccd288]">
        <Link href="/">
          <h1 className="text-4xl text-white dark:text-theme font-extrabold">
            {rootT("name")}
          </h1>
        </Link>
        <div className="flex-grow" />

        {session ? (
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
            <Link href="/login">
              <div className="p-2 px-4 rounded font-bold bg-white dark:bg-theme text-theme dark:text-slate-900">
                {t("login")}
              </div>
            </Link>
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
