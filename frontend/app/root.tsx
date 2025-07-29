import clsx from "clsx";
import { pathcat } from "pathcat";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import type { LinksFunction, LoaderFunctionArgs } from "react-router";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from "react-router";
import favicon from "~/assets/favicon.svg?url";
import DisablePortal from "~/components/DisablePortal";
import Footer from "~/components/Footer.tsx";
import Header from "~/components/Header.tsx";
import ModalPortal from "~/components/ModalPortal";
import { backendUrl, host } from "~/lib/config.server.ts";
import {
  IsSubmittingContext,
  ServerErrorContext,
  ServerSettingsContext,
  SessionContext,
  SetIsSubmittingContext,
  SetSessionContext,
  SetThemeContext,
  ThemeContext,
  useSession,
} from "~/lib/contexts";
import { detectLocale } from "~/lib/i18n.server";
import type { ServerSettings, Session, Warning } from "~/lib/types";

let serverSettingsCachePromise: Promise<ServerSettings> | undefined;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  if (!serverSettingsCachePromise) {
    serverSettingsCachePromise = fetch(pathcat(backendUrl, "/meta")).then(
      (res) => res.json(),
    );
  }
  const meta: {
    discordEnabled: boolean;
    genres: string[];
  } = await serverSettingsCachePromise;
  return {
    locale,
    serverSettings: {
      discordEnabled: meta.discordEnabled,
      genres: meta.genres,
      host,
    } satisfies ServerSettings,
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "icon", type: "image/svg+xml", href: favicon }];
};

export default function App() {
  return <Outlet />;
}

const warnLevels = ["low", "medium", "high", "ban"] as const;

function ServerErrorModal(
  props: React.PropsWithChildren<{
    serverError?: Error;
    setServerError: (error: Error | undefined) => void;
  }>,
) {
  const { t } = useTranslation("root");
  return (
    <ModalPortal isOpen={!!props.serverError}>
      <h1 className="text-xl font-bold mb-2">{t("serverError")}</h1>
      <p className="text-sm text-gray-500">
        <Trans
          components={[<a href="https://discord.gg/2NP3U3r8Rz" key="0" />]}
          i18nKey="serverErrorNote"
        />
      </p>

      <textarea
        readOnly
        className="card font-monospace overflow-scroll block w-[80vw] md:w-[480px] h-48 whitespace-pre"
        value={`${props.serverError?.message}\n${props.serverError?.stack}`}
      />
      <div className="flex justify-end mt-4">
        <button
          className="px-4 py-2 button-cancel"
          onClick={() => props.setServerError(undefined)}
        >
          {t("close")}
        </button>
      </div>
    </ModalPortal>
  );
}

function WarningModal() {
  const [isOpen, setIsOpen] = useState<undefined | boolean>(undefined);
  const { t, i18n } = useTranslation("root");
  const session = useSession();
  const unseenWarnings = ((session?.loggedIn && session.warnings) || []).filter(
    (w) => !w.seen,
  );
  useEffect(() => {
    if (isOpen !== undefined) {
      return;
    }
    if (!session?.loggedIn) {
      return;
    }
    if (unseenWarnings.length > 0) {
      setIsOpen(true);
    }
  }, [session, unseenWarnings, isOpen]);

  const highestWarningLevel = useMemo(() => {
    return unseenWarnings.reduce(
      (highest, warning) => {
        const currentLevelIndex = warnLevels.indexOf(warning.level);
        const highestLevelIndex = warnLevels.indexOf(highest);
        return currentLevelIndex > highestLevelIndex ? warning.level : highest;
      },
      "low" as Warning["level"],
    );
  }, [unseenWarnings]);

  const sendSeen = async () => {
    setIsOpen(false);
    try {
      const res = await fetch("/api/my/warnings/seen", {
        method: "PUT",
      });
      const json = await res.json();
      if (json.code !== "ok") {
        throw new Error(json.message);
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to mark warnings as seen:", error);
    }
  };

  if (!session?.loggedIn) {
    return null;
  }

  return (
    <ModalPortal isOpen={!!isOpen}>
      <h1 className="text-xl font-bold mb-2">{t("warning.title")}</h1>
      <p>
        {t("warning.deletedDescription", {
          count: unseenWarnings.length,
        })}
      </p>
      <form
        className="flex flex-col gap-2 mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendSeen();
        }}
      >
        {unseenWarnings.map((warning) => (
          <div key={warning.id} className="card flex flex-col gap-1 p-2">
            <p className="font-bold">{warning.chartTitle}</p>
            <p>{warning.reason}</p>
            <p className="text-sm text-gray-500 whitespace-pre-wrap">
              <Trans
                i18nKey="warning.footer"
                components={[
                  <span
                    key={0}
                    className={
                      warning.level === "low"
                        ? "text-green-500"
                        : warning.level === "medium"
                          ? "text-yellow-500"
                          : warning.level === "high"
                            ? "text-red-500"
                            : "text-purple-500"
                    }
                  />,
                ]}
                values={{
                  warnLevel: t(`warning.level.${warning.level}`),
                  date: new Date(warning.createdAt).toLocaleDateString(),
                }}
              />
            </p>
          </div>
        ))}
        <p className="whitespace-pre-wrap">
          <span className="font-bold">
            {t(`warning.levelDescription.${highestWarningLevel}`)}
          </span>
        </p>
        {highestWarningLevel === "ban" ? (
          <button className="px-4 py-2 button-cancel" type="submit">
            {t("close")}
          </button>
        ) : (
          <>
            {highestWarningLevel !== "low" && (
              <p>
                <Trans
                  i18nKey="warning.timeoutNote"
                  components={[
                    <a
                      href={`https://cc.sevenc7c.com/wiki/${i18n.language}/guideline`}
                      key="0"
                      target="_blank"
                    />,
                  ]}
                />
              </p>
            )}

            <button className="px-4 py-2 button-cancel" type="submit">
              {t("gotIt")}
            </button>
          </>
        )}
      </form>
    </ModalPortal>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useRouteLoaderData<typeof loader>("root");
  if (!loaderData) {
    throw new Error("Root loader data not found");
  }

  const [session, setSession] = useState<Session | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<Error | undefined>();
  const navigation = useNavigation();
  const location = useLocation();

  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (theme === "auto") {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setIsDarkMode(theme === "dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => {
      if (theme === "auto") {
        setIsDarkMode(e.matches);
      }
    };
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", listener);
    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [theme]);
  useEffect(() => {
    const rawTheme = localStorage.getItem("theme");
    if (rawTheme === "light" || rawTheme === "dark") {
      setTheme(rawTheme);
    } else {
      setTheme("auto");
    }
  }, []);

  const isSubmittingOrTransitioning = useMemo(
    () => isSubmitting || navigation.state !== "idle",
    [isSubmitting, navigation],
  );
  const { i18n } = useTranslation("root");
  useEffect(() => {
    if (i18n.language !== loaderData.locale) {
      i18n.changeLanguage(loaderData.locale);
    }
  }, [i18n, loaderData.locale]);
  useEffect(() => {
    fetch("/api/login/session", {
      method: "GET",
    }).then(async (res) => {
      const json = await res.json();
      if (json.code === "ok") {
        const [altUsers, discordUser, warnings] = await Promise.all([
          fetch("/api/my/alt-users").then(
            async (res) => (await res.json()).users,
          ),
          fetch("/api/my/discord").then(
            async (res) => (await res.json()).discord,
          ),
          fetch("/api/my/warnings").then(
            async (res) => (await res.json()).warnings,
          ),
        ]);

        setSession({
          loggedIn: true,
          user: json.user,
          altUsers,
          discord: discordUser,
          warnings,
        });
      } else {
        setSession({ loggedIn: false });
      }
    });
  }, []);
  return (
    <html lang={loaderData.locale} className={isDarkMode ? "dark" : ""}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#83ccd2" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-normal min-h-screen flex flex-col font-sans">
        <SessionContext.Provider value={session}>
          <SetSessionContext.Provider value={setSession}>
            <ServerErrorContext.Provider value={setServerError}>
              <ServerSettingsContext.Provider value={loaderData.serverSettings}>
                <IsSubmittingContext.Provider value={isSubmitting}>
                  <SetIsSubmittingContext.Provider value={setIsSubmitting}>
                    <SetThemeContext.Provider value={setTheme}>
                      <ThemeContext.Provider value={theme}>
                        <DisablePortal isShown={isSubmittingOrTransitioning} />
                        <ServerErrorModal
                          serverError={serverError}
                          setServerError={setServerError}
                        />
                        <WarningModal />
                        <Header />
                        <main
                          className={clsx(
                            "py-4 px-4 md:px-40 lg:px-60 max-w-[100vw] flex-grow relative",
                            "starting:translate-y-2 starting:opacity-0 translate-y-0 opacity-100 motion-reduce:!translate-y-0 transition-[transform,_opaicty] duration-300",
                          )}
                          key={location.pathname}
                        >
                          {children}
                        </main>

                        <Footer />

                        <ScrollRestoration />
                        <Scripts />

                        {import.meta.env.PROD && (
                          <script
                            defer
                            src="https://static.cloudflareinsights.com/beacon.min.js"
                            data-cf-beacon='{"token": "5d4e8a97143447a293a04ba13358db27"}'
                          />
                        )}
                      </ThemeContext.Provider>
                    </SetThemeContext.Provider>
                  </SetIsSubmittingContext.Provider>
                </IsSubmittingContext.Provider>
              </ServerSettingsContext.Provider>
            </ServerErrorContext.Provider>
          </SetSessionContext.Provider>
        </SessionContext.Provider>
      </body>
    </html>
  );
}
