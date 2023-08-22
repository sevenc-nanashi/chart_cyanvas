import { MusicNote2Regular, OpenRegular } from "@fluentui/react-icons"
import { GetServerSideProps, NextPage } from "next"
import Head from "next/head"
import { useState, useEffect, useRef, useCallback, createElement } from "react"
import useTranslation from "next-translate/useTranslation"
import urlcat from "urlcat"
import Link from "next/link"
import getConfig from "next/config"
import ChartSection from "components/ChartSection"
import { className, isAdmin, randomize } from "lib/utils"
import { useSession } from "lib/atom"

const { serverRuntimeConfig } = getConfig()

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userData = await fetch(
    urlcat(serverRuntimeConfig.backendHost!, "/api/users/:handle", {
      handle: context.params!.handle,
      with_chart_count: true,
    }),
    {
      method: "GET",
    }
  ).then(async (res) => {
    const json = await res.json()

    if (json.code === "ok") {
      return json.user
    } else {
      return null
    }
  })

  if (!userData) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  return {
    props: {
      user: userData,
    },
  }
}
const UserPage: NextPage<{ user: User }> = ({ user }) => {
  const { t: rootT } = useTranslation()
  const { t } = useTranslation("user")

  const [session] = useSession()

  const [random, setRandom] = useState(0)
  useEffect(() => {
    setRandom(Math.random())
  }, [])

  const [userCharts, setUserCharts] = useState<Chart[] | null>(null)
  useEffect(() => {
    setUserCharts(null)
  }, [user])

  const isMobile = useRef(true)
  useEffect(() => {
    isMobile.current = window.navigator.maxTouchPoints > 0
  })

  const isFinished = useRef(false)

  const [secretUserInfo, setSecretUserInfo] = useState<{
    discord: DiscordInfo
    warnCount: number
  } | null>(null)

  useEffect(() => {
    if (!isAdmin(session)) {
      return
    }
    ;(async () => {
      console.log("fetching admin info")
      const res = await fetch(
        urlcat(`/api/admin/users/:handle`, {
          handle: user.handle,
        })
      )
      const data = await res.json()

      if (data.code === "ok") {
        setSecretUserInfo(data.user)
      }
    })()
  }, [session, user])

  const fetchUserCharts = useCallback(async () => {
    console.log("fetching user charts")
    const res = await fetch(
      urlcat(`/api/charts`, {
        author: user.handle,
        count: 5,
        offset: userCharts?.length || 0,
      })
    )
    const data = await res.json()

    if (data.code === "ok") {
      setUserCharts((prev) =>
        [...(prev || []), ...data.charts].filter(
          (e, i, a) => a.findIndex((f) => f.name === e.name) === i
        )
      )
      if (data.charts.length < 5) {
        isFinished.current = true
      }
    }
  }, [userCharts, user])

  return (
    <>
      <Head>
        <title>{user.name + "#" + user.handle + " | " + rootT("name")}</title>
      </Head>
      <div className="flex flex-col">
        <div className="min-h-[300px] w-full flex relative">
          <div className="flex flex-col flex-grow max-w-[calc(100%_-_128px)]">
            {user ? (
              <>
                <h1 className="text-4xl font-bold">
                  {user.name}
                  <span className="text-xl">#{user.handle}</span>
                </h1>

                <p className="text-lg mt-4">
                  <MusicNote2Regular className="mr-1 w-6 h-6" />
                  {t("totalCharts", { count: user.chartCount })}
                </p>

                {secretUserInfo && (
                  <p className="text-md mt-4">
                    Discord: {secretUserInfo.discord.username}, Warn:{" "}
                    {secretUserInfo.warnCount}
                  </p>
                )}
                <p className="flex-grow mt-4 mr-4 whitespace-pre-wrap break-words w-full">
                  {user.aboutMe}
                </p>
              </>
            ) : (
              <>
                <h1
                  className="h-10 bg-gray-300 rounded animate-pulse"
                  style={{ width: `${150 + randomize(random, 1) * 100}px` }}
                />

                <p className="h-6 bg-gray-300 rounded animate-pulse mt-6 opacity-75 w-[150px]" />

                <p className="h-6 bg-gray-300 rounded animate-pulse mt-2 mb-2 opacity-75 w-[150px]" />

                {[...Array(3)].map((_, i) => (
                  <p
                    className="h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75"
                    style={{
                      width: `${150 + randomize(random, 10) * 300}px`,
                    }}
                    key={i}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col">
            <div
              className="md:h-40 md:w-40 rounded-xl bg-gray-300 square w-32 h-32"
              style={{ backgroundColor: user?.bgColor }}
            />
            <div className="flex flex-col w-32 md:w-40 mt-4 text-center gap-2">
              {[
                (item: {
                  icon: React.FC<{ className: string }>
                  text: string
                }) => (
                  <>
                    {createElement(item.icon, {
                      className: "h-5 w-5 mr-1",
                    })}

                    {item.text}
                  </>
                ),
              ].map((inner) =>
                [
                  // ...(showManageButton
                  //   ? [
                  //       {
                  //         href: `/charts/${name}/edit`,
                  //         icon: EditRegular,
                  //         className: "bg-theme text-white",
                  //         text: t("edit"),
                  //       },
                  //       {
                  //         text: t("delete"),
                  //         icon: DeleteRegular,
                  //         className: "bg-red-500 text-white",
                  //         onClick: deleteChart,
                  //       },
                  //     ]
                  //   : []),
                  isMobile && {
                    text: rootT("openInSonolus"),
                    icon: OpenRegular,
                    className: "bg-black text-white",
                    href: `sonolus://players/id/${user.handle}`,
                  },
                ]
                  .flatMap((e) => (e ? [e] : []))
                  .map((item, i) =>
                    item.href ? (
                      <Link
                        href={item.href}
                        key={i}
                        className={className(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200",
                          item.className
                        )}
                      >
                        {inner(item)}
                      </Link>
                    ) : (
                      <div
                        key={i}
                        className={className(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200 cursor-pointer",
                          item.className
                        )}
                      >
                        {inner(item)}
                      </div>
                    )
                  )
              )}
            </div>
          </div>
        </div>
        <ChartSection
          key={user?.name}
          items={[
            {
              title: t("userCharts"),
              items: userCharts,
              fetchMore: fetchUserCharts,
              itemsCountPerPage: 5,
              isFinished: isFinished.current,
            },
          ]}
        />
      </div>
    </>
  )
}

export default UserPage
