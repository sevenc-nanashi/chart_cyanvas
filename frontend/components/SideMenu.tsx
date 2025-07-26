import {
  DataBarVerticalRegular,
  DocumentAddRegular,
  DocumentBriefcaseRegular,
  DocumentTextRegular,
  HeartRegular,
  PersonArrowRightFilled,
  SearchRegular,
  SettingsRegular,
  SignOutRegular,
  TagRegular,
} from "@fluentui/react-icons";
import clsx from "clsx";
import i18next from "i18next";
import { createElement, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useSession } from "~/lib/contexts.ts";
import { useLogin } from "~/lib/useLogin.ts";
import ModalPortal from "./ModalPortal.tsx";
import SettingsDialog from "./SettingsDialog.tsx";
import SonolusAvatar from "./SonolusAvatar.tsx";

type MenuItem =
  | {
      type: "line";
    }
  | {
      type: "space";
    }
  | {
      type: "button";
      text: string;
      icon?: React.ComponentType<{ className: string }>;
      href?: string;
      onClick?: () => void;
      className?: string;
      external?: boolean;
    };

const SideMenu: React.FC<{ close: () => void }> = ({ close }) => {
  const session = useSession();
  const { t } = useTranslation("menu");
  const [settingsOpen, setSettingsOpen] = useState(false);

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
            t={t}
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

      <ModalPortal
        isOpen={settingsOpen}
        close={() => {
          setSettingsOpen(false);
        }}
      >
        <SettingsDialog close={() => setSettingsOpen(false)} />
      </ModalPortal>
      <div
        className="top-0 left-0 right-0 h-[100lvh] fixed bg-slate-900 dark:bg-black bg-opacity-20 dark:bg-opacity-40 z-50"
        onClick={close}
      >
        <div
          className="absolute right-2 top-2 min-w-64 h-[calc(100svh_-_16px)] bg-background shadow-lg rounded-lg p-4 flex flex-col overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {session?.loggedIn ? (
            <Link to={`/users/${session.user.handle}`} onClick={close}>
              <div className="flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer">
                <SonolusAvatar
                  avatar={session.user.avatar}
                  containerClassName="rounded-full w-10 h-10 mr-2 grid place-items-center shadow-md"
                  innerClassName="w-1/2 h-1/2"
                />
                <div className="font-bold text-2xl text-normal">
                  {session.user.name}
                  <span className="text-sm">#{session.user.handle}</span>
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer text-theme-text"
              onClick={startLogin}
            >
              <PersonArrowRightFilled className="w-10 h-10 mr-2" />
              <div className="text-2xl">{t("login.button")}</div>
            </div>
          )}
          <div className="w-full h-[1px] my-2 bg-slate-200 dark:bg-slate-500" />
          <div className="flex flex-col flex-grow">
            {[
              {
                type: "button",
                text: t("search"),
                icon: SearchRegular,

                href: "/charts",
              },
              session?.loggedIn && [
                {
                  type: "line",
                },

                {
                  type: "button",
                  text: t("post"),
                  icon: DocumentAddRegular,

                  href: "/charts/upload",
                },
                {
                  type: "line",
                },

                {
                  type: "button",
                  text: t("my"),
                  icon: DocumentBriefcaseRegular,

                  href: "/charts/my",
                },
                {
                  type: "button",
                  text: t("liked"),
                  icon: HeartRegular,

                  href: "/charts/liked",
                },
                {
                  type: "line",
                },
                {
                  type: "button",
                  text: t("myAlts"),
                  icon: TagRegular,

                  href: "/users/alts",
                },

                session.user.userType === "admin" && [
                  {
                    type: "line",
                  },
                  {
                    type: "button",
                    text: t("admin"),
                    icon: DataBarVerticalRegular,

                    href: "/admin",
                  },
                ],
              ],
              {
                type: "space",
              },
              {
                type: "button",
                text: t("settings"),
                icon: SettingsRegular,

                onClick: () => {
                  setSettingsOpen(true);
                },
              },

              {
                type: "button",
                text: t("guideline"),
                icon: DocumentTextRegular,

                href: `https://cc.sevenc7c.com/wiki/${
                  i18next.language
                }/guideline`,
                external: true,
              },

              session?.loggedIn && [
                {
                  type: "line",
                },
                {
                  type: "button",
                  icon: SignOutRegular,
                  text: t("logout"),
                  className: "text-red-400",

                  onClick: () => {
                    fetch("/api/login/session", { method: "delete" }).then(
                      () => {
                        window.location.href = "/";
                      },
                    );
                  },
                },
              ],
            ]
              .flat(Number.POSITIVE_INFINITY)
              .filter((item) => !!item)
              .map((item) => item as MenuItem)
              .map((item, i) => {
                switch (item.type) {
                  case "line":
                    return (
                      <div
                        className="w-full h-[1px] my-2 bg-slate-100 dark:bg-slate-700"
                        key={i}
                      />
                    );
                  case "space":
                    return <div className="min-h-4 flex-grow" key={i} />;
                  case "button": {
                    const inner = (
                      <div
                        className={clsx(
                          "flex items-center bg-theme p-2 bg-opacity-0 hover:bg-opacity-10 transition-colors duration-250 rounded cursor-pointer",
                          "className" in item && item.className,
                        )}
                        key={i}
                        role="button"
                      >
                        {item.icon && (
                          <div className="mr-2 h-6 w-6">
                            {createElement(item.icon, {
                              className: "h-full w-full",
                            })}
                          </div>
                        )}
                        <div className="text-lg">{item.text}</div>
                      </div>
                    );

                    if ("href" in item && item.href) {
                      if (item.external) {
                        return (
                          <a
                            href={item.href}
                            key={i}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={close}
                          >
                            {inner}
                          </a>
                        );
                      } else {
                        return (
                          <Link to={item.href} key={i} onClick={close}>
                            {inner}
                          </Link>
                        );
                      }
                    } else if ("onClick" in item) {
                      return (
                        <div key={i} onClick={item.onClick}>
                          {inner}
                        </div>
                      );
                    } else {
                      throw new Error(
                        "Either href or onClick must be provided",
                      );
                    }
                  }
                  default:
                    throw new Error(`Unknown item type: ${item}`);
                }
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
