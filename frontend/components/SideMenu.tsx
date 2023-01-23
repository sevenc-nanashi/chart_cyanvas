import {
  DocumentAddRegular,
  DocumentBriefcaseRegular,
  DocumentTextRegular,
  HeartRegular,
  SignOutRegular,
  TagRegular,
} from "@fluentui/react-icons"
import Link from "next/link"
import router from "next/router"
import useTranslation from "next-translate/useTranslation"
import { useSession } from "lib/atom"
import { createElement } from "react"

const SideMenu: React.FC<{ close: () => void }> = ({ close }) => {
  const [session, setSession] = useSession()
  const { t } = useTranslation("menu")
  if (!session || !session.loggedIn) return null

  return (
    <div
      className="top-0 left-0 right-0 h-[100lvh] fixed bg-slate-900 dark:bg-slate-100 bg-opacity-20 dark:bg-opacity-20 z-50"
      onClick={close}
    >
      <div
        className="absolute right-2 top-2 min-w-64 h-[calc(100svh_-_16px)] bg-white dark:bg-slate-900 shadow-lg rounded-lg p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href={`/users/${session.user.handle}`} onClick={close}>
          <div className="flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer">
            <div
              className="rounded-full w-10 h-10 mr-2"
              style={{
                backgroundColor: session.user.bgColor,
              }}
            />
            <div className="font-bold text-2xl text-normal">
              {session.user.name}
              <span className="text-sm">#{session.user.handle}</span>
            </div>
          </div>
        </Link>
        <div className="w-full h-[1px] my-2 bg-slate-200 dark:bg-slate-700" />
        <div className="flex flex-col flex-grow">
          {[
            {
              type: "button",
              text: t("post"),
              icon: DocumentAddRegular,

              href: `/charts/upload`,
            },
            {
              type: "line",
            },

            {
              type: "button",
              text: t("my"),
              icon: DocumentBriefcaseRegular,

              href: `/charts/my`,
            },
            {
              type: "button",
              text: t("liked"),
              icon: HeartRegular,

              href: `/charts/liked`,
            },
            {
              type: "line",
            },
            {
              type: "button",
              text: t("myAlts"),
              icon: TagRegular,

              href: "/users/alts",
            },
            {
              type: "space",
            },
            {
              type: "button",
              text: t("guideline"),
              icon: DocumentTextRegular,

              href: "/info/guideline",
            },
            {
              type: "line",
            },
            {
              type: "button",
              icon: SignOutRegular,
              text: t("logout"),
              className: "text-red-400",

              onClick: () => {
                setSession({ loggedIn: false })
                fetch("/api/auth/session", { method: "delete" }).then(() => {
                  router.push("/")
                })
              },
            },
          ].map((item, i) => {
            switch (item.type) {
              case "line":
                return (
                  <div
                    className="w-full h-[1px] my-2 bg-slate-100 dark:bg-slate-800"
                    key={i}
                  />
                )
              case "space":
                return <div className="min-h-4 flex-grow" key={i} />
              case "button":
                return (
                  <div
                    className={
                      "flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer " +
                      item.className
                    }
                    onClick={() => {
                      if (item.href) {
                        router.push(item.href)
                      } else {
                        item.onClick?.()
                      }
                      close()
                    }}
                    key={i}
                    role="button"
                  >
                    {item.icon && (
                      <div className="mr-2 h-6 w-6">
                        {createElement(item.icon, {
                          className: "h-full w-full",
                        })}
                      </div>
                    )}
                    <div className="text-lg">{item.text}</div>
                  </div>
                )
              default:
                throw new Error(`Unknown item type: ${item.type}`)
            }
          })}
        </div>
      </div>
    </div>
  )
}

export default SideMenu
