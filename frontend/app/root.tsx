import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  json,
  useRouteLoaderData,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import favicon from "~/assets/favicon.svg?url";
import Footer from "~/components/Footer.tsx";
import Header from "~/components/Header.tsx";
import {
  ServerErrorContext,
  ServerSettingsContext,
  SessionContext,
} from "~/lib/contexts";
import styles from "~/styles/globals.scss?url";
import { useEffect, useState } from "react";
import type { ServerSettings, Session } from "~/lib/types";
import { discordEnabled, host } from "~/lib/config.server.ts";

export const loader = async () => {
  return json({
    serverSettings: {
      discordEnabled,
      host,
    } satisfies ServerSettings,
  });
};

export const links: LinksFunction = () => {
  // <link rel="icon" type="image/svg+xml" href={favicon} />
  // <link rel="stylesheet" href={styles} />
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
  const [serverError, setServerError] = useState<Error | undefined>();
  const { i18n } = useTranslation();
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
    <html lang={i18n.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#83ccd2" />
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-slate-800 text-normal min-h-screen flex flex-col">
        <SessionContext.Provider value={session}>
          <ServerErrorContext.Provider value={setServerError}>
            <ServerSettingsContext.Provider value={loaderData.serverSettings}>
              <Header />
              <main className="py-4 px-4 md:px-40 lg:px-60 max-w-[100vw] flex-grow">
                {children}
              </main>

              <Footer />

              <ScrollRestoration />
              <Scripts />
            </ServerSettingsContext.Provider>
          </ServerErrorContext.Provider>
        </SessionContext.Provider>
      </body>
    </html>
  );
}
