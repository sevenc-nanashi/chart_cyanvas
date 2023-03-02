import {
  EditRegular,
  HeartRegular,
  LockClosedRegular,
  MicRegular,
  MusicNote2Regular,
  TagRegular,
} from "@fluentui/react-icons"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect, forwardRef } from "react"
import { className, getRatingColor, randomize } from "../lib/utils"
import OptionalImage from "./OptionalImage"

type Props = { data?: Chart; spacer?: boolean }

const ChartCard = forwardRef<HTMLDivElement, Props>(function ChartCard(
  { data, spacer },
  ref
) {
  const [random, setRandom] = useState(0)
  const router = useRouter()
  useEffect(() => {
    setRandom(Math.random())
  }, [])
  if (spacer) {
    return <div className="p-2 h-0 w-[480px]" ref={ref} />
  }
  const retvar = (
    <div
      className={className(
        "p-2 h-40 md:h-48 w-[480px] max-w-[calc(100vw_-_2rem)] shadow-sm rounded-xl flex relative",
        "dark:shadow-slate-700/25",
        data?.isPublic
          ? "bg-slate-100 dark:bg-slate-900"
          : "bg-slate-200 dark:bg-gray-900",
        data && "transition-shadow duration-200 hover:shadow-theme/50"
      )}
      ref={ref}
    >
      <OptionalImage
        src={data?.cover}
        alt={data?.title}
        className="rounded-xl square w-36 md:w-44"
        width={176}
        height={176}
      />

      {data ? (
        <>
          <div
            className={className(
              "absolute text-xs top-2 left-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white",
              getRatingColor(data.rating)
            )}
          >
            Lv. {data.rating}
          </div>
          {data.isPublic || (
            <div
              className={
                "absolute text-xs top-2 right-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white"
              }
            >
              <LockClosedRegular className="h-6 w-6 text-slate-900 dark:text-white" />
            </div>
          )}
          <div className="ml-2 flex flex-col flex-grow">
            <h2 className="font-bold text-2xl w-full break-all overflow-hidden">
              {data.title}
            </h2>
            <div className="flex-grow" />

            <p className="text-xs">
              <MusicNote2Regular className="mr-1 w-4 h-4" />
              {data.composer}
            </p>
            <p className="text-xs">
              <MicRegular className="mr-1 w-4 h-4" />
              {data.artist || "-"}
            </p>
            <p className="text-xs">
              {data.tags.length > 0 ? (
                <>
                  <TagRegular className="mr-1 w-4 h-4" />
                  {data.tags.join("、")}
                </>
              ) : (
                <>
                  <TagRegular className="mr-1 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  -
                </>
              )}
            </p>
            <Link
              href={`/users/${data.author.handle}`}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs hover:text-blue-400 transition-colors duration-200">
                <EditRegular className="mr-1 w-4 h-4" />
                {data.authorName || data.author.name}
                <span className="text-xs">#{data.author.handle}</span>
              </p>
            </Link>
            <p className="text-xs text-red-400">
              <HeartRegular className="mr-1 w-4 h-4" />
              {data.likes}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="ml-2 flex flex-col">
            <h2
              className="h-8 bg-gray-300 rounded animate-pulse mt-4"
              style={{ width: `${50 + random * 50}%` }}
            />

            <div className="flex-grow" />
            <p
              className="h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + randomize(random, 1) * 50}%` }}
            />
            <p
              className="h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + randomize(random, 3) * 50}%` }}
            />
            <p
              className="h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + randomize(random, 5) * 50}%` }}
            />
            <p
              className="h-4 bg-red-300 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + randomize(random, 5) * 50}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
  if (data) {
    return (
      <div
        className="text-normal cursor-pointer"
        onClick={() => router.push(`/charts/${data.name}`)}
      >
        {retvar}
      </div>
    )
  } else {
    return retvar
  }
})

export default ChartCard
