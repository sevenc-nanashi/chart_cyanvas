import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import favicon from "~/assets/favicon.svg?url";
import Footer from "~/components/Footer.tsx";
import Header from "~/components/Header.tsx";
import enTranslation from "~/i18n/en.yml";
import jaTranslation from "~/i18n/ja.yml";
import { SessionContext } from "~/lib/contexts";
import styles from "~/styles/globals.scss?url";
import { useEffect, useState } from "react";
import type { Session } from "~/lib/types";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: styles },
    {
      rel: "icon",
      type: "image/svg+xml",
      href: favicon,
    },
  ];
};

export default function App() {
  return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | undefined>(undefined);
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
        <Meta />
        <Links />
      </head>
      <body className="bg-white dark:bg-slate-800 text-normal min-h-screen flex flex-col">
        <SessionContext.Provider value={session}>
          <Header />
          <main className="py-4 px-4 md:px-40 lg:px-60 flex-grow">
            {children}
          </main>

          <Footer />

          <ScrollRestoration />
          <Scripts />
        </SessionContext.Provider>
      </body>
    </html>
  );
}
