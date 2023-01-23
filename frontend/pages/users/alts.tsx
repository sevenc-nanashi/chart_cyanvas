import type { NextPage } from "next"
import Head from "next/head"
import useTranslation from "next-translate/useTranslation"

import requireLogin from "lib/requireLogin"
import { useServerError, useSession } from "lib/atom"
import { className } from "lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import DisablePortal from "components/DisablePortal"
import Link from "next/link"
import urlcat from "urlcat"
import ModalPortal from "components/ModalPortal"

const MyAlts: NextPage = () => {
  const { t } = useTranslation("myAlts")
  const { t: rootT } = useTranslation()
  const [session, setSession] = useSession()

  if (!session.loggedIn) {
    throw new Error("Not logged in")
  }

  const [errorText, setErrorText] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  const newNameInput = useRef<HTMLInputElement>(null)
  const setServerError = useServerError()

  const createAltUser = useCallback(async () => {
    if (!newNameInput.current) return
    if (isSending) return

    setErrorText(undefined)
    const name = newNameInput.current.value
    if (name.length < 4) {
      setErrorText("tooShort")
      return
    }

    setIsSending(true)
    const result = await fetch("/api/my/alt_users", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    })
    setIsSending(false)
    if (result.status === 500) {
      setServerError(true)
      return
    }

    const resultData = await result.json()
    if (resultData.code !== "ok") {
      setErrorText(resultData.error)
      return
    }
    setSession((before: Session) => {
      if (!before.loggedIn) return before
      return {
        ...before,
        altUsers: [...before.altUsers, resultData.data],
      }
    })
    newNameInput.current.value = ""
  }, [isSending, setServerError, setSession])

  const editNameInput = useRef<HTMLInputElement>(null)
  const [editingUsersHandle, setEditingUsersHandle] = useState<
    string | undefined
  >(undefined)

  const update = useCallback(async () => {
    if (!editNameInput.current) return
    if (isSending) return

    setErrorText(undefined)
    const name = editNameInput.current.value
    if (name.length < 4) {
      setErrorText("tooShort")
      return
    }

    setIsSending(true)
    const result = await fetch(
      urlcat("/api/my/alt_users/:handle", { handle: editingUsersHandle }),
      {
        method: "PUT",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    setIsSending(false)
    if (result.status === 500) {
      setServerError(true)
      return
    }

    const resultData = await result.json()
    if (resultData.code !== "ok") {
      setErrorText(resultData.error)
      return
    }
    setSession((before: Session) => {
      if (!before.loggedIn) return before
      return {
        ...before,

        altUsers: before.altUsers.map((user) =>
          user.handle === resultData.data.handle ? resultData.data : user
        ),
      }
    })
    setEditingUsersHandle(undefined)
  }, [editingUsersHandle, isSending, setServerError, setSession])

  useEffect(() => {
    setErrorText(undefined)
  }, [editingUsersHandle])

  const [deletingUsersHandle, setDeletingUsersHandle] = useState<
    string | undefined
  >(undefined)

  const deleteAltUser = useCallback(async () => {
    if (isSending) return

    setErrorText(undefined)
    setIsSending(true)
    const result = await fetch(
      urlcat("/api/my/alt_users/:handle", { handle: deletingUsersHandle }),
      {
        method: "DELETE",
      }
    )
    setIsSending(false)
    if (result.status === 500) {
      setServerError(true)
      return
    }

    const resultData = await result.json()
    if (resultData.code !== "ok") {
      setErrorText(resultData.error)
      return
    }
    setSession((before: Session) => {
      if (!before.loggedIn) return before
      return {
        ...before,

        altUsers: before.altUsers.filter(
          (user) => user.handle !== deletingUsersHandle
        ),
      }
    })
    setDeletingUsersHandle(undefined)
  }, [deletingUsersHandle, isSending, setServerError, setSession])

  const deletingUser = session.altUsers.find(
    (u) => u.handle === deletingUsersHandle
  )

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <DisablePortal isShown={isSending} />
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
          {errorText && deletingUsersHandle && t("errors." + errorText)}
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <div
            className="px-4 py-2 button-secondary"
            onClick={() => setDeletingUsersHandle(undefined)}
          >
            {rootT("cancel")}
          </div>
          <div
            className={className("px-4 py-2 button-danger")}
            onClick={() => {
              deleteAltUser()
            }}
          >
            {t("deletionModal.ok")}
          </div>
        </div>
      </ModalPortal>
      <div>
        <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
        <p>
          {t("description")}
          <span className="text-red-500 inline md:hidden">
            <br />
            {t("mobileDescription")}
          </span>
        </p>
        <div className="h-4" />
        <div className="flex flex-col gap-2">
          {session.altUsers.map((altUser) => (
            <div
              key={altUser.handle}
              className="flex flex-row gap-2 items-center bg-slate-100 dark:bg-slate-900 shadow-sm rounded-xl flex dark:shadow-slate-700/25 p-4"
            >
              {editingUsersHandle === altUser.handle ? (
                <>
                  <div
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: altUser.bgColor,
                    }}
                  />
                  <input
                    type="text"
                    className={className(
                      "text-input w-80",
                      errorText && "border-red-500"
                    )}
                    maxLength={16}
                    placeholder={t("namePlaceholder")}
                    defaultValue={altUser.name}
                    ref={editNameInput}
                  />
                  <span className="text-sm">#{altUser.handle}</span>

                  <p className="text-sm text-red-500 ml-4">
                    {errorText && t("errors." + errorText)}
                  </p>
                  <div className="flex-grow" />
                  <button
                    className={className("px-4 py-2 button-secondary")}
                    onClick={update}
                    disabled={
                      !(editNameInput.current?.value !== altUser.name) ||
                      isSending
                    }
                    key="save"
                  >
                    {t("save")}
                  </button>
                  <button
                    className={className("px-4 py-2 button-danger")}
                    onClick={() => setEditingUsersHandle(undefined)}
                    key="cancel"
                    disabled={isSending}
                  >
                    {t("cancel")}
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-8 h-8 rounded"
                    style={{
                      backgroundColor: altUser.bgColor,
                    }}
                  />
                  <Link href={`/users/${altUser.handle}`}>
                    <div className="gap-2 text-xl text-normal">
                      {altUser.name}
                      <span className="text-sm">#{altUser.handle}</span>
                    </div>
                  </Link>
                  <div className="flex-grow" />
                  <button
                    className={className(
                      "px-4 py-2 button-secondary hidden md:inline"
                    )}
                    disabled={!!editingUsersHandle}
                    onClick={() => setEditingUsersHandle(altUser.handle)}
                  >
                    {t("edit")}
                  </button>
                  <button
                    className={className(
                      "px-4 py-2 button-danger hidden md:inline"
                    )}
                    disabled={!!editingUsersHandle}
                    onClick={() => setDeletingUsersHandle(altUser.handle)}
                  >
                    {t("delete")}
                  </button>
                </>
              )}
            </div>
          ))}
          <div
            className={className(
              "flex-row gap-2 items-center border-slate-100 dark:border-slate-900 border-2 shadow-sm rounded-xl",
              "dark:shadow-slate-700/25 p-4 hidden md:flex"
            )}
          >
            <input
              type="text"
              className={className("text-input w-80")}
              maxLength={16}
              placeholder={t("namePlaceholder")}
              ref={newNameInput}
            />
            <p className="text-sm text-red-500">
              {errorText &&
                !editingUsersHandle &&
                !deletingUsersHandle &&
                t("errors." + errorText)}
            </p>

            <div className="flex-grow" />

            <button
              className={className("px-4 py-2 button-primary")}
              disabled={!!editingUsersHandle}
              onClick={createAltUser}
            >
              {t("add")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default requireLogin(MyAlts)
