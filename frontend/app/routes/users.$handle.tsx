import { MusicNote2Regular, OpenRegular } from "@fluentui/react-icons";
import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { pathcat } from "pathcat";
import { createElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ChartSection from "~/components/ChartSection";
import { useSession } from "~/lib/contexts.ts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import type { Chart, DiscordInfo, User } from "~/lib/types.ts";
import { isAdmin } from "~/lib/utils.ts";
import { backendUrl, host } from "~/lib/config.server.ts";
import clsx from "clsx";
import { useRandomValue } from "~/lib/useRandomValue";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");

  const userData = await fetch(
    pathcat(backendUrl, "/api/users/:handle", {
      handle: params.handle,
    }),
    {
      method: "GET",
    },
  ).then(async (res) => {
    const json = await res.json();

    if (json.code === "ok") {
      return json.user as User;
    } else {
      return null;
    }
  });

  if (!userData) {
    throw new Response(null, {
      status: 404,
    });
  }

  const userCharts = await fetch(
    pathcat(backendUrl, "/api/charts", {
      author: userData.handle,
    }),
    {
      method: "GET",
    },
  ).then(async (res) => {
    const json = await res.json();

    if (json.code === "ok") {
      return json.charts as Chart[];
    } else {
      return [];
    }
  });

  const title = `${userData.name}#${userData.handle} | ${rootT("name")}`;

  return json({
    userData,
    userCharts,
    title,
    host,
  });
};

export const handle = {
  i18n: "user",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

const UserPage = () => {
  const { t: rootT } = useTranslation("root");
  const { t } = useTranslation("user");
  const { userData, userCharts } = useLoaderData<typeof loader>();

  const random = useRandomValue();

  const session = useSession();

  const [secretUserInfo, setSecretUserInfo] = useState<{
    discord: DiscordInfo;
    warnCount: number;
  } | null>(null);

  useEffect(() => {
    if (!isAdmin(session)) {
      return;
    }
    (async () => {
      console.log("fetching admin info");
      const res = await fetch(
        pathcat("/api/admin/users/:handle", {
          handle: userData.handle,
        }),
      );
      const data = await res.json();

      if (data.code === "ok") {
        setSecretUserInfo(data.user);
      }
    })();
  }, [session, userData]);

  return (
    <>
      <div className="flex flex-col">
        <div className="min-h-[300px] w-full flex relative">
          <div className="flex flex-col flex-grow">
            {userData ? (
              <>
                <h1 className="page-title-larger">
                  {userData.name}
                  <span className="text-xl">#{userData.handle}</span>
                </h1>

                <p className="text-lg mt-4">
                  <MusicNote2Regular className="mr-1 w-6 h-6" />
                  {t("totalCharts", { count: userData.chartCount })}
                </p>

                {secretUserInfo && (
                  <p className="text-md mt-4 card">
                    {t("secretUserInfo", {
                      discord: secretUserInfo.discord.username,
                      warn: secretUserInfo.warnCount,
                    })}
                  </p>
                )}
                <p className="flex-grow mt-4 mr-4 whitespace-pre-wrap break-words w-full">
                  {userData.aboutMe}
                </p>
              </>
            ) : (
              <>
                <h1
                  className="h-10 bg-gray-300 rounded animate-pulse"
                  style={{ width: `${150 + random("name") * 100}px` }}
                />

                <p className="h-6 bg-gray-300 rounded animate-pulse mt-6 opacity-75 w-[150px]" />

                <p className="h-6 bg-gray-300 rounded animate-pulse mt-2 mb-2 opacity-75 w-[150px]" />

                {[...Array(3)].map((_, i) => (
                  <p
                    className="h-4 bg-gray-300 rounded animate-pulse mt-2 opacity-75"
                    style={{
                      width: `${150 + random("description", i) * 300}px`,
                    }}
                    key={i}
                  />
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col ml-2">
            <div
              className="md:h-40 md:w-40 rounded-xl bg-gray-300 square w-32 h-32"
              style={{ backgroundColor: userData.bgColor }}
            />
            <div className="flex flex-col w-32 md:w-40 mt-4 text-center gap-2">
              {[
                (item: {
                  icon: React.FC<{ className: string }>;
                  text: string;
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
                  {
                    text: rootT("openInSonolus"),
                    icon: OpenRegular,
                    className: "bg-black text-white",
                    href: `https://open.sonolus.com/players/id/${userData.handle}`,
                  },
                ]
                  .flatMap((e) => (e ? [e] : []))
                  .map((item, i) =>
                    item.href ? (
                      <Link
                        to={item.href}
                        key={i}
                        className={clsx(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200",
                          item.className,
                        )}
                      >
                        {inner(item)}
                      </Link>
                    ) : (
                      <div
                        key={i}
                        className={clsx(
                          "text-center p-1 rounded focus:bg-opacity-75 hover:bg-opacity-75 transition-colors duration-200 cursor-pointer",
                          item.className,
                        )}
                      >
                        {inner(item)}
                      </div>
                    ),
                  ),
              )}
            </div>
          </div>
        </div>
        <ChartSection
          key={userData?.name}
          sections={[
            {
              title: t("userCharts"),
              items: userCharts,
              listUrl: pathcat("/charts", {
                user: userData?.handle,
              }),
            },
          ]}
        />
      </div>
    </>
  );
};

export default UserPage;
