import { MusicNote2Regular } from "@fluentui/react-icons"
import { GetStaticPaths, GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { useState, useEffect, useRef, useCallback } from "react"
import useTranslation from "next-translate/useTranslation"
import urlcat from "urlcat"
import ChartSection from "components/ChartSection"
import { randomize } from "lib/utils"

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const userData = await fetch(
    urlcat(process.env.BACKEND_HOST!, "/api/users/:handle", {
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
    revalidate: 300,
  }
}
const UserPage: NextPage<{ user: User }> = ({ user }) => {
  const { t: rootT } = useTranslation()
  const { t } = useTranslation("user")

  const [random, setRandom] = useState(0)
  useEffect(() => {
    setRandom(Math.random())
  }, [])

  const [userCharts, setUserCharts] = useState<Chart[] | null>(null)
  useEffect(() => {
    setUserCharts(null)
  }, [user])

  const isFinished = useRef(false)

  const fetchUserCharts = useCallback(async () => {
    console.log("fetching user charts")
    const res = await fetch(
      urlcat(process.env.BACKEND_HOST!, `/api/charts`, {
        author: user.handle,
        count: 5,
        offeset: userCharts?.length || 0,
      })
    )
    const data = await res.json()

    if (data.code === "ok") {
      setUserCharts((prev) =>
        [...(prev || []), ...data.charts].filter(
          (e, i, a) => a.findIndex((f) => f.id === e.id) === i
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
        <div className="min-h-40 w-full flex">
          <div className="flex flex-col flex-grow">
            {user ? (
              <>
                <h1 className="text-4xl font-bold">
                  {user.name}
                  <span className="text-xl font-semibold">#{user.handle}</span>
                </h1>

                <p className="text-lg mt-4">
                  <MusicNote2Regular className="mr-1 w-6 h-6" />
                  {t("totalCharts", { count: user.chartCount })}
                </p>
                <p className="flex-grow mt-4 whitespace-pre break-all">
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

          <div
            className="md:h-40 md:w-40 rounded-xl bg-gray-300 square w-30 h-30 max-w-[30vw] max-h-[30vw] ml-4"
            style={{ backgroundColor: user?.bgColor }}
          />
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
