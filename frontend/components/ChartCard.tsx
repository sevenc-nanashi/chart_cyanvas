import {
  ClockRegular,
  EditRegular,
  HeartRegular,
  LockClosedRegular,
  MicRegular,
  MusicNote2Regular,
  TagRegular,
} from "@fluentui/react-icons";
import { Link, useNavigate } from "@remix-run/react";
import clsx from "clsx";
import { forwardRef } from "react";
import type { Chart } from "~/lib/types";
import { useRandomValue } from "~/lib/useRandomValue.ts";
import { getRatingColor, useMergeChartTags } from "~/lib/utils.ts";
import OptionalImage from "./OptionalImage.tsx";
import { useTranslation } from "react-i18next";

type Props = { data?: Chart; spacer?: boolean; className?: string };

const ChartCard = forwardRef<HTMLDivElement, Props>(function ChartCard(
  { data, spacer, className }: Props,
  ref,
) {
  const random = useRandomValue();
  const navigate = useNavigate();
  const { t: rootT } = useTranslation();
  const mergeChartTags = useMergeChartTags()
  const tags = data ? mergeChartTags(data) : [];

  if (spacer) {
    return <div className="px-2 h-0 w-full md:w-[480px]" ref={ref} />;
  }
  const retvar = (
    <div
      className={clsx(
        "h-40 md:h-48 w-full md:w-[480px] grid grid-cols-[9rem_1fr] md:grid-cols-[11rem_1fr] relative overflow-x-auto",
        "card",

        data?.visibility === "public" || "card-darker",
        data ? "card-clickable" : className,
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
            className={clsx(
              "absolute text-xs top-2 left-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white",
              getRatingColor(data.rating),
            )}
          >
            Lv. {data.rating}
          </div>
          {data.visibility === "private" && (
            <div
              className={
                "absolute text-xs top-2 right-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white"
              }
            >
              <LockClosedRegular className="h-6 w-6 text-slate-900 dark:text-white" />
            </div>
          )}
          {data.visibility === "scheduled" && (
            <div
              className={
                "absolute text-xs top-2 right-2 p-1 px-2 rounded-br-xl rounded-tl-[10px] font-bold text-white"
              }
            >
              <ClockRegular className="h-6 w-6 text-slate-900 dark:text-white" />
            </div>
          )}
          <div className="ml-2 flex flex-col overflow-hidden">
            <h2
              className={clsx(
                "font-bold text-lg md:text-2xl w-full whitespace-nowrap overflow-hidden overflow-ellipsis",
                data.visibility !== "public" && "pr-8",
              )}
            >
              {data.title}
            </h2>
            <div className="flex-grow" />

            <p className="text-xs whitespace-nowrap overflow-x-hidden overflow-ellipsis">
              <MusicNote2Regular className="mr-1 w-4 h-4" />
              {data.composer}
            </p>
            <p className="text-xs whitespace-nowrap overflow-x-hidden overflow-ellipsis">
              <MicRegular className="mr-1 w-4 h-4" />
              {data.artist || "-"}
            </p>
            <p className="text-xs whitespace-nowrap overflow-x-hidden overflow-ellipsis">
              {tags.length > 0 ? (
                <>
                  <TagRegular className="mr-1 w-4 h-4" />
                  {tags.join(rootT("separator"))}
                </>
              ) : (
                <>
                  <TagRegular className="mr-1 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  -
                </>
              )}
            </p>

            <p className="text-xs blue-link overflow-x-hidden whitespace-nowrap overflow-ellipsis">
              <Link
                to={`/users/${data.author.handle}`}
                onClick={(e) => e.stopPropagation()}
              >
                <EditRegular className="mr-1 w-4 h-4" />
                {data.authorName || data.author.name}
                <span className="text-xs">#{data.author.handle}</span>
              </Link>
            </p>
            <p className="text-xs text-red-400 overflow-x-hidden whitespace-nowrap overflow-ellipsis">
              <HeartRegular className="mr-1 w-4 h-4" />
              {data.likes}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="ml-2 flex flex-col">
            <h2
              className="h-8 bg-gray-500/50 rounded animate-pulse"
              style={{ width: `${50 + random("title") * 50}%` }}
            />

            <div className="flex-grow" />
            <p
              className="h-3 bg-gray-500/50 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + random("composer") * 50}%` }}
            />
            <p
              className="h-3 bg-gray-500/50 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + random("artist") * 50}%` }}
            />
            <p
              className="h-3 bg-gray-500/50 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + random("charter") * 50}%` }}
            />
            <p
              className="h-3 bg-blue-500/50 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${50 + random("charter") * 50}%` }}
            />
            <p
              className="h-3 bg-red-500/50 rounded animate-pulse mt-2 opacity-75"
              style={{ width: `${10 + random("likes") * 20}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
  if (data) {
    return (
      <div
        className={clsx("text-normal cursor-pointer", className)}
        onClick={() => navigate(`/charts/${data.name}`)}
      >
        {retvar}
      </div>
    );
  } else {
    return retvar;
  }
});

export default ChartCard;
