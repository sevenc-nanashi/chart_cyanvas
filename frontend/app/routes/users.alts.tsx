import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ModalPortal from "~/components/ModalPortal.tsx";
import SonolusAvatar from "~/components/SonolusAvatar";
import {
  useIsSubmitting,
  useMyFetch,
  useSession,
  useSetIsSubmitting,
  useSetSession,
} from "~/lib/contexts.ts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";
import type { Session } from "~/lib/types.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "myAlts");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
};

export const handle = {
  i18n: "myAlts",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

const MyAlts = () => {
  const { t } = useTranslation("myAlts");
  const { t: rootT } = useTranslation();
  const session = useSession();
  const setSession = useSetSession();
  const isSubmitting = useIsSubmitting();
  const setIsSubmitting = useSetIsSubmitting();

  if (!session?.loggedIn) {
    throw new Error("Not logged in");
  }

  const [errorText, setErrorText] = useState<string | undefined>(undefined);
  const newNameInput = useRef<HTMLInputElement>(null);
  const myFetch = useMyFetch();

  const createAltUser = useCallback(async () => {
    if (!newNameInput.current) return;
    if (isSubmitting) return;

    setErrorText(undefined);
    const name = newNameInput.current.value;
    if (name.length < 4) {
      setErrorText("tooShort");
      return;
    }

    setIsSubmitting(true);
    const result = await myFetch("/api/my/alt_users", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    }).finally(() => setIsSubmitting(false));

    const resultData = await result.json();
    if (resultData.code !== "ok") {
      setErrorText(resultData.error);
      return;
    }
    newNameInput.current.value = "";
    setSession((before: Session | undefined) => {
      if (!before?.loggedIn) return before;
      return {
        ...before,

        altUsers: [...before.altUsers, resultData.data],
      };
    });
  }, [isSubmitting, myFetch, setIsSubmitting, setSession]);

  const editNameInput = useRef<HTMLInputElement>(null);
  const [editingUsersHandle, setEditingUsersHandle] = useState<
    string | undefined
  >(undefined);

  const update = useCallback(async () => {
    if (!editNameInput.current) return;
    if (isSubmitting) return;

    setErrorText(undefined);
    const name = editNameInput.current.value;
    if (name.length < 4) {
      setErrorText("tooShort");
      return;
    }

    setIsSubmitting(true);
    const result = await myFetch(
      pathcat("/api/my/alt_users/:handle", { handle: editingUsersHandle }),
      {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).finally(() => setIsSubmitting(false));

    const resultData = await result.json();
    if (resultData.code !== "ok") {
      setErrorText(resultData.error);
      return;
    }
    setSession((before: Session | undefined) => {
      if (!before?.loggedIn) return before;
      return {
        ...before,

        altUsers: before.altUsers.map((user) =>
          user.handle === resultData.data.handle ? resultData.data : user,
        ),
      };
    });
    setEditingUsersHandle(undefined);
  }, [editingUsersHandle, isSubmitting, myFetch, setSession, setIsSubmitting]);

  const [deletingUsersHandle, setDeletingUsersHandle] = useState<
    string | undefined
  >(undefined);

  const deleteAltUser = useCallback(async () => {
    if (isSubmitting) return;

    setErrorText(undefined);
    setIsSubmitting(true);
    const result = await myFetch(
      pathcat("/api/my/alt_users/:handle", { handle: deletingUsersHandle }),
      {
        method: "DELETE",
      },
    ).finally(() => setIsSubmitting(false));

    const resultData = await result.json();
    if (resultData.code !== "ok") {
      setErrorText(resultData.error);
      return;
    }
    setSession((before: Session | undefined) => {
      if (!before?.loggedIn) return before;
      return {
        ...before,

        altUsers: before.altUsers.filter(
          (user) => user.handle !== deletingUsersHandle,
        ),
      };
    });
    setDeletingUsersHandle(undefined);
  }, [deletingUsersHandle, isSubmitting, myFetch, setSession, setIsSubmitting]);

  const deletingUser = session.altUsers.find(
    (u) => u.handle === deletingUsersHandle,
  );

  return (
    <div className="flex flex-col gap-2">
      <ModalPortal isOpen={!!deletingUsersHandle}>
        <h1 className="text-xl font-bold text-normal mb-2 break-word">
          {t("deletionModal.title")}
        </h1>
        <p className="text-sm text-gray-500 text-normal mb-1">
          {t("deletionModal.description")}
          {deletingUser && deletingUser.chartCount > 0 && (
            <>
              <br />
              {t("deletionModal.nameChangeWarning", {
                count: deletingUser.chartCount,
                currentUser: `${session.user.name}#${session.user.handle}`,
              })}
            </>
          )}
        </p>
        <p className="text-sm text-red-500">
          {errorText && deletingUsersHandle && t(`errors.${errorText}`)}
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <div
            className="px-4 py-2 button-secondary"
            onClick={() => setDeletingUsersHandle(undefined)}
          >
            {rootT("cancel")}
          </div>
          <div
            className="px-4 py-2 button-danger"
            onClick={() => {
              deleteAltUser();
            }}
          >
            {t("deletionModal.ok")}
          </div>
        </div>
      </ModalPortal>
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <p>{t("description")}</p>
        <div className="h-4" />
        <div className="flex flex-col gap-2">
          {session.altUsers.map((altUser) =>
            editingUsersHandle === altUser.handle ? (
              <div
                key={altUser.handle}
                className="flex flex-col xl:flex-row gap-2 items-center px-4 card"
              >
                <div className="flex flex-row gap-2 items-center w-full">
                  <SonolusAvatar
                    avatar={altUser.avatar}
                    containerClassName="w-8 h-8 rounded"
                    innerClassName="w-1/2 h-1/2"
                  />
                  <input
                    type="text"
                    className={clsx(
                      "text-input w-full md:w-80",
                      errorText && "border-red-500",
                    )}
                    maxLength={16}
                    placeholder={t("namePlaceholder")}
                    defaultValue={altUser.name}
                    ref={editNameInput}
                  />
                  <span className="hidden md:inline text-sm">
                    #{altUser.handle}
                  </span>
                </div>
                <div className="flex flex-row justify-end gap-2 items-center w-full">
                  <p className="text-sm text-red-500 mr-4">
                    {errorText && t(`errors.${errorText}`)}
                  </p>
                  <button
                    className="px-4 py-2 button-secondary"
                    onClick={update}
                    disabled={
                      !(editNameInput.current?.value !== altUser.name) ||
                      isSubmitting
                    }
                    key="save"
                  >
                    {t("save")}
                  </button>
                  <button
                    className="px-4 py-2 button-danger"
                    onClick={() => setEditingUsersHandle(undefined)}
                    key="cancel"
                    disabled={isSubmitting}
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div
                key={altUser.handle}
                className="flex flex-row gap-2 items-center px-4 card"
              >
                <SonolusAvatar
                  avatar={altUser.avatar}
                  containerClassName="w-8 h-8 rounded"
                  innerClassName="w-1/2 h-1/2"
                />
                <div className="gap-2 text-xl text-normal gray-link">
                  <Link to={`/users/${altUser.handle}`}>
                    {altUser.name}
                    <span className="text-sm">#{altUser.handle}</span>
                  </Link>
                </div>
                <div className="flex-grow" />
                <button
                  className="px-4 py-2 button-secondary inline"
                  disabled={!!editingUsersHandle}
                  onClick={() => setEditingUsersHandle(altUser.handle)}
                >
                  {t("edit")}
                </button>
                <button
                  className="px-4 py-2 button-danger inline"
                  disabled={!!editingUsersHandle}
                  onClick={() => setDeletingUsersHandle(altUser.handle)}
                >
                  {t("delete")}
                </button>
              </div>
            ),
          )}
          <div className="flex flex-col xl:flex-row gap-2 items-center card card-darker">
            <div className="flex flex-row w-full gap-2 justify-start items-center">
              <input
                type="text"
                className={"text-input w-80"}
                maxLength={16}
                placeholder={t("namePlaceholder")}
                ref={newNameInput}
              />
            </div>

            <div className="flex flex-row w-full gap-2 justify-end items-center">
              <p className="text-sm text-red-500 mr-4">
                {errorText &&
                  !editingUsersHandle &&
                  !deletingUsersHandle &&
                  t(`errors.${errorText}`)}
              </p>

              <button
                className={clsx("px-4 py-2 button-primary")}
                disabled={!!editingUsersHandle}
                onClick={createAltUser}
              >
                {t("add")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default requireLogin(MyAlts);
