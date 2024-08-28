import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { pathcat } from "pathcat";
import { Link } from "@remix-run/react";
import LogoCF from "~/assets/logo-cf.svg?react";
import { useSession } from "~/lib/contexts";
import SideMenu from "./SideMenu.tsx";
import ModalPortal from "./ModalPortal.tsx";
import { useLogin } from "~/lib/useLogin.ts";

type LoginState = { uuid: string; url: URL };
const Header = () => {
  const { t } = useTranslation("header");

  const session = useSession();
  const [showMenu, setShowMenu] = useState(false);

  const { loginState, startLogin, cancelLogin } = useLogin({
    onLoginSuccess: () => {
      window.location.reload();
    },
  });

  return (
    <>
      <ModalPortal
        isOpen={!!loginState}
        close={() => {
          cancelLogin();
        }}
      >
        <h1 className="text-xl font-bold mb-2">{t("login.title")}</h1>
        <p className="whitespace-pre-wrap">
          <Trans
            ns="header"
            i18nKey="login.description"
            components={[
              <a
                key={0}
                href={loginState?.url?.toString() || ""}
                target="_blank"
              />,
            ]}
          />
        </p>
      </ModalPortal>
      <header className="bg-theme dark:bg-gray-800 flex items-center pl-4 pr-8 h-20 shadow-sm shadow-[#83ccd288]">
        <Link to="/" className="flex items-center">
          <LogoCF
            className="text-white dark:text-theme"
            width="56px"
            height="56px"
            viewBox="0 0 512 512"
          />
          <span className="text-2xl md:text-4xl text-white dark:text-theme font-extrabold">
            Chart
            <br className="block md:hidden" />
            <span className="hidden md:inline"> </span>
            Cyanvas
            {import.meta.env.DEV && (
              <span className="ml-2 opacity-50">(dev)</span>
            )}
          </span>
        </Link>
        <div className="flex-grow" />

        {session !== undefined ? (
          session.loggedIn ? (
            <div
              className="flex items-end text-white bg-white p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer"
              onClick={() => setShowMenu(true)}
            >
              <div
                className="rounded-full w-8 h-8 md:mr-2"
                style={{
                  backgroundColor: session.user.bgColor,
                }}
              />
              <div className="font-bold text-xl text-white md:block hidden">
                {session.user.name}
                <span className="text-sm">#{session.user.handle}</span>
              </div>
            </div>
          ) : (
            <button
              className="p-2 px-4 rounded font-bold bg-white dark:bg-theme text-theme dark:text-slate-900 ml-2"
              onClick={startLogin}
            >
              {t("login.button")}
            </button>
          )
        ) : (
          <div className="p-4 w-32 rounded font-bold bg-slate-100 dark:bg-theme text-theme dark:text-slate-900 animate-pulse" />
        )}
      </header>
      {showMenu && session && session.loggedIn && (
        <SideMenu close={() => setShowMenu(false)} />
      )}
    </>
  );
};

export default Header;
