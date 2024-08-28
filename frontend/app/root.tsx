import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useLocation,
  useNavigation,
  useRouteLoaderData,
} from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import favicon from "~/assets/favicon.svg?url";
import DisablePortal from "~/components/DisablePortal";
import Footer from "~/components/Footer.tsx";
import Header from "~/components/Header.tsx";
import { discordEnabled, host } from "~/lib/config.server.ts";
import {
  IsSubmittingContext,
  ServerErrorContext,
  ServerSettingsContext,
  SessionContext,
  SetIsSubmittingContext,
  SetSessionContext,
} from "~/lib/contexts";
import { detectLocale } from "~/lib/i18n.server";
import type { ServerSettings, Session } from "~/lib/types";
import styles from "~/styles/globals.scss?url";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  return json({
    locale,
    serverSettings: {
      discordEnabled,
      host,
    } satisfies ServerSettings,
  });
};

export const links: LinksFunction = () => {
  return [
    { rel: "icon", type: "image/svg+xml", href: favicon },
    { rel: "stylesheet", href: styles },
  ];
};

export default function App() {
  return <Outlet />;
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
  const mainNodeRef = useRef(null);
  const prevChildrenRef = useRef<
    [React.ReactNode, React.ReactNode | undefined]
  >([undefined, children]);
  useEffect(() => {
    prevChildrenRef.current = [prevChildrenRef.current[1], children];
  }, [children]);

  const isSubmittingOrTransitioning = useMemo(
    () => isSubmitting || navigation.state !== "idle",
    [isSubmitting, navigation],
  );
  const { i18n } = useTranslation();
  if (i18n.language !== loaderData.locale) {
    i18n.changeLanguage(loaderData.locale);
  }
  useEffect(() => {
    if (session && session.loggedIn !== undefined) {
      return;
    }
    fetch("/api/login/session", {
      method: "GET",
    }).then(async (res) => {
      const json = await res.json();
      if (json.code === "ok") {
        const [altUsers, discordUser] = await Promise.all([
          fetch("/api/my/alt_users").then(
            async (res) => (await res.json()).users,
          ),
          fetch("/api/my/discord").then(
            async (res) => (await res.json()).discord,
          ),
        ]);

        setSession({
          loggedIn: true,
          user: json.user,
          altUsers,
          discord: discordUser,
        });
      } else {
        setSession({ loggedIn: false });
      }
    });
  }, [session]);
  return (
    <html lang={loaderData.locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#83ccd2" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-normal min-h-screen flex flex-col">
        <SessionContext.Provider value={session}>
          <SetSessionContext.Provider value={setSession}>
            <ServerErrorContext.Provider value={setServerError}>
              <ServerSettingsContext.Provider value={loaderData.serverSettings}>
                <IsSubmittingContext.Provider value={isSubmitting}>
                  <SetIsSubmittingContext.Provider value={setIsSubmitting}>
                    <DisablePortal isShown={isSubmittingOrTransitioning} />
                    <Header />
                    <main
                      ref={mainNodeRef}
                      className="py-4 px-4 md:px-40 lg:px-60 max-w-[100vw] flex-grow"
                      key={location.pathname}
                    >
                      {children}
                    </main>

                    <Footer />

                    <ScrollRestoration />
                    <Scripts />
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
