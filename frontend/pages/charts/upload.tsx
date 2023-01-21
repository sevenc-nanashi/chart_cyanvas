import type { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { WithContext as ReactTags } from "react-tag-input"
import useTranslation from "next-translate/useTranslation"
import Trans from "next-translate/Trans"

import {
  ChevronDownRegular,
  DocumentAddRegular,
  LockClosedRegular,
} from "@fluentui/react-icons"

import urlcat from "urlcat"
import { useServerError, useSession } from "lib/atom"
import { useRouter } from "next/router"

import FileInput from "components/FileInput"
import { className } from "lib/utils"
import ModalPortal from "components/ModalPortal"
import Checkbox from "components/Checkbox"
import { saveChart } from "lib/chart"

type FormData = {
  title: string
  description: string
  composer: string
  artist: string
  rating: number
  tags: { id: string; text: string }[]
  authorHandle: string
  authorName: string
  variant: string
  isPublic: boolean
  chart: File | null
  bgm: File | null
  cover: File | null
}

const UploadChart: NextPage<
  { isEdit: true; chartData: FormData } | { isEdit: false; chartData: null }
> = ({ isEdit, chartData: firstForm }) => {
  const { t } = useTranslation("upload")
  const { t: rootT } = useTranslation()
  const { t: errorT } = useTranslation("errors")
  const router = useRouter()

  const [session] = useSession()
  const setServerError = useServerError()

  const fields = useMemo(
    () =>
      [
        [
          {
            name: "title",
            type: "input",
          },
          {
            name: "composer",

            type: "input",
          },
          {
            name: "artist",
            type: "input",
            optional: true,
          },

          {
            name: "tags",
            type: "tags",
            optional: true,
          },
          {
            name: "rating",
            type: "number",
            min: 1,
            max: 99,
            defaultValue: 30,
          },
          {
            name: "description",
            type: "textarea",
          },
        ],
        [
          {
            name: "variant",
            max: 22,
            prefix: "#",
            monospace: true,
            optional: true,
          },
          {
            name: "author",
            type: "author",
          },
          {
            name: "cover",
            type: "file",
            placeholder: "cover.png",
            fileTypes: ".png,.jpg,.jpeg",
            optional: isEdit,
          },
          {
            name: "bgm",
            type: "file",
            placeholder: "bgm.mp3",
            fileTypes: ".mp3,.wav,.ogg",
            optional: isEdit,
          },
          {
            name: "chart",
            type: "file",
            placeholder: "data.sus",
            fileTypes: ".sus",
            optional: isEdit,
          },
          {
            name: "isPublic",
            type: "checkbox",
            disabled: !isEdit,
          },
          {
            name: "" as keyof FormData,
            type: "submit",
          },
        ],
      ] as {
        name: keyof FormData
        type:
          | "file"
          | "textarea"
          | "input"
          | "submit"
          | "number"
          | "tags"
          | "author"
          | "checkbox"
        disabled?: boolean
        monospace?: boolean
        placeholder?: string
        prefix?: string
        optional?: boolean
        fileTypes?: string
        min?: number
        max?: number
        defaultValue?: number
      }[][],
    [isEdit]
  )

  const formDefault = useMemo(
    () =>
      ({
        title: "",
        description: "",
        composer: "",
        artist: "",
        tags: [],
        rating: 30,
        authorHandle: (session?.loggedIn && session.user.handle) || "",
        authorName: "",
        variant: "",
        isPublic: false,
        chart: null,
        bgm: null,
        cover: null,
      } as const),
    [session]
  )
  const [form, setForm] = useState<FormData>(
    firstForm || JSON.parse(JSON.stringify(formDefault))
  )
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  )
  const [isAltUserSelectorOpen, setIsAltUserSelectorOpen] = useState(false)

  const closeAltUserSelector = useCallback(() => {
    setIsAltUserSelectorOpen(false)
  }, [])

  useEffect(() => {
    if (isAltUserSelectorOpen) {
      document.addEventListener("click", closeAltUserSelector)
    } else {
      document.removeEventListener("click", closeAltUserSelector)
    }
    return () => {
      document.removeEventListener("click", closeAltUserSelector)
    }
  }, [isAltUserSelectorOpen, closeAltUserSelector])

  const updateFormFile = useCallback(
    (name: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) {
        setForm((form) => ({
          ...form,
          [name]: files[0],
        }))
      }
    },
    []
  )

  type Preprocess = (value: string) => string | number
  const updateForm = useCallback(
    (name: keyof FormData, preprocess?: Preprocess) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value: string | number = e.target.value
        if (preprocess) {
          value = preprocess(value)
        }
        setForm((form) => ({
          ...form,
          [name]: value,
        }))
      },
    []
  )

  const updateFormCheckbox = useCallback(
    (name: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((form) => ({
        ...form,
        [name]: e.target.checked,
      }))
    },
    []
  )

  const handleErrors = useCallback(
    (errors: Partial<Record<keyof FormData, string>>) => {
      if (!errors) return
      setErrors(errors)
    },
    []
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFileSizeError, setShowFileSizeError] = useState(false)
  const createFormData = useCallback(
    (extra: object = {}) => {
      const emptyFields: string[] = []
      setErrors({})
      for (const field of fields.flat()) {
        if (field.optional) {
          continue
        }
        const formValue = form[field.name]
        switch (field.type) {
          case "input":
          case "textarea":
          case "number":
            if (typeof formValue === "string" && formValue.trim() === "") {
              emptyFields.push(field.name)
            }
            break
          case "file":
            if (formValue === null) {
              emptyFields.push(field.name)
            }
            break
        }
      }
      if (emptyFields.length) {
        setErrors((errors) => ({
          ...errors,
          ...emptyFields.reduce(
            (acc, cur) => ({ ...acc, [cur]: "cannotBeEmpty" }),
            {}
          ),
        }))
        return
      }

      const formData = new FormData()
      formData.append(
        "data",
        JSON.stringify({
          title: form.title,
          description: form.description,
          composer: form.composer,
          artist: form.artist,
          tags: form.tags.map((tag) => tag.text),
          rating: form.rating,
          author_handle: form.authorHandle,
          author_name: form.authorName,
          variant: form.variant,
          ...extra,
        })
      )
      form.chart && formData.append("chart", form.chart)
      form.bgm && formData.append("bgm", form.bgm)
      form.cover && formData.append("cover", form.cover)
      return formData
    },
    [form, fields]
  )
  const handleResponse = useCallback(
    async (res: Response) => {
      if (res.status === 500) {
        setServerError(true)
        setIsSubmitting(false)
        return
      } else if (res.status === 413) {
        setShowFileSizeError(true)
        setIsSubmitting(false)
        return
      }
      const data = await res.json()
      if (data.code !== "ok") {
        handleErrors(data.errors)

        setIsSubmitting(false)
        return
      }

      return data
    },
    [handleErrors, setServerError]
  )
  const submitChart = useCallback(() => {
    const formData = createFormData()
    if (!formData) {
      return
    }

    setIsSubmitting(true)
    fetch(urlcat(process.env.BACKEND_HOST!, "/api/charts"), {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await handleResponse(res)
      if (!data) {
        return
      }
      saveChart(data.chart)
      router.push(`/charts/${data.chart.name}`)
    })
  }, [createFormData, handleResponse, router])

  const updateChart = useCallback(() => {
    const formData = createFormData()
    if (!formData) {
      return
    }

    setIsSubmitting(true)
    fetch(
      urlcat(process.env.BACKEND_HOST!, `/api/charts/:name`, {
        name: router.query.name,
      }),
      {
        method: "PUT",
        body: formData,
      }
    ).then(async (res) => {
      const data = await handleResponse(res)
      if (!data) {
        return
      }
      saveChart(data.chart)
      router.push(`/charts/${data.chart.name}`)
    })
  }, [createFormData, router, handleResponse])

  const publishConfirms = [useState(false), useState(false), useState(false)]
  const isAllPublicConfirmsChecked = publishConfirms.every(([value]) => value)

  const [waitForPublishConfirm, setWaitForPublishConfirm] =
    useState<CallableFunction | null>(null)

  const publishChart = useCallback(() => {
    publishConfirms.forEach(([_, setter]) => setter(false))
    new Promise<boolean>((resolve) => {
      setWaitForPublishConfirm(() => resolve)
    }).then((confirmed) => {
      if (confirmed == null) {
        return
      }
      setWaitForPublishConfirm(null)
      if (!confirmed) {
        return
      }
      setIsSubmitting(true)
      const formData = createFormData({ is_public: true })

      fetch(urlcat("/api/charts/:name", { name: router.query.name }), {
        method: "PUT",
        body: formData,
      }).then(async (res) => {
        const data = await handleResponse(res)
        if (!data) {
          return
        }
        router.push(`/charts/${data.chart.name}`)
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, createFormData, handleErrors])
  const unpublishChart = useCallback(() => {
    setIsSubmitting(true)
    const formData = createFormData({ is_public: false })
    fetch(urlcat("/api/charts/:name", { name: router.query.name }), {
      method: "PUT",
      body: formData,
    }).then(async (res) => {
      if (res.status === 500) {
        setServerError(true)
        setIsSubmitting(false)
        return
      } else if (res.status === 413) {
        setShowFileSizeError(true)
        setIsSubmitting(false)
        return
      }
      const data = (await res.json()) as {
        code: string
        chart: Chart
        errors: Partial<Record<keyof FormData, string>>
      }
      if (data.code !== "ok") {
        handleErrors(data.errors)

        setIsSubmitting(false)
        return
      }
      router.push(`/charts/${data.chart.name}`)
    })
  }, [
    router,
    createFormData,
    handleErrors,
    setShowFileSizeError,
    setServerError,
  ])

  const [isDragOver, setIsDragOver] = useState(false)
  const [unUploadedFiles, setUnUploadedFiles] = useState<File[]>([])
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files

    const unUploaded: File[] = []
    for (const file of Array.from(files)) {
      if (file.name.endsWith(".sus")) {
        setForm((form) => ({
          ...form,
          chart: file,
        }))
      } else if (["mp3", "wav", "ogg"].includes(file.name.split(".").pop()!)) {
        setForm((form) => ({
          ...form,
          bgm: file,
        }))
      } else if (["jpg", "jpeg", "png"].includes(file.name.split(".").pop()!)) {
        setForm((form) => ({
          ...form,
          cover: file,
        }))
      } else {
        unUploaded.push(file)
      }
    }
    if (unUploaded.length) {
      setUnUploadedFiles(unUploaded)
    }
  }, [])

  if (!session?.loggedIn) {
    if (typeof window !== "undefined") {
      router.replace("/login")
    }
    return null
  }

  const user = session.user

  const hasNote = (name: keyof FormData) =>
    t("param." + name + "Note") !== "param." + name + "Note"

  return (
    <div className="flex flex-col gap-2">
      <Head>
        <title>{t("title") + " | " + rootT("name")}</title>
      </Head>
      <ModalPortal isOpen={unUploadedFiles.length > 0}>
        <h1 className="text-xl font-bold mb-2">{t("unUploadedFiles")}</h1>
        <p className="text-sm text-gray-500">{t("unUploadedFilesNote")}</p>
        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer"
            onClick={() => setUnUploadedFiles([])}
          >
            {rootT("close")}
          </div>
        </div>
      </ModalPortal>

      <ModalPortal isOpen={showFileSizeError}>
        <h1 className="text-xl font-bold mb-2">{t("filesTooLarge")}</h1>
        <p className="text-sm text-gray-500">{t("filesTooLargeNote")}</p>

        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer"
            onClick={() => setShowFileSizeError(false)}
          >
            {rootT("close")}
          </div>
        </div>
      </ModalPortal>

      <ModalPortal isOpen={waitForPublishConfirm !== null}>
        <h1 className="text-xl font-bold text-normal mb-2">
          {t("publishModal.title")}
        </h1>
        <p className="text-sm text-gray-500 text-normal mb-1">
          {t("publishModal.description")}
        </p>
        {publishConfirms.map(([checked, setChecked], i) => (
          <Checkbox
            label={t(`publishModal.check${i}`)}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            size="sm"
            key={i}
          />
        ))}
        <p className="text-sm text-gray-500 text-normal mt-1">
          <Trans
            i18nKey="upload:publishModal.description2"
            components={[
              <Link href="/info/guideline" key="0" target="_blank" />,
            ]}
          />
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <div
            className="px-4 py-2 rounded text-sm border-2 border-slate-500 dark:border-white text-normal cursor-pointer"
            onClick={() => {
              waitForPublishConfirm?.(false)
            }}
          >
            {rootT("cancel")}
          </div>
          <div
            className={className(
              "px-4 py-2 rounded text-sm bg-theme text-white",
              isAllPublicConfirmsChecked
                ? "cursor-pointer"
                : "bg-opacity-70 cursor-not-allowed"
            )}
            onClick={() => {
              isAllPublicConfirmsChecked && waitForPublishConfirm?.(true)
            }}
          >
            {t("publishModal.ok")}
          </div>
        </div>
      </ModalPortal>
      <div>
        <h1 className="text-2xl font-bold mb-2">
          {isEdit ? (
            <>
              {t("titleEdit", { title: firstForm.title })}
              {firstForm.isPublic || (
                <span className="ml-2 text-slate-900 dark:text-white">
                  <LockClosedRegular />
                </span>
              )}
            </>
          ) : (
            t("title")
          )}
        </h1>
        <p className="mb-4">
          <Trans
            i18nKey="upload:description"
            components={[<Link href="/info/guideline" key="0" />]}
          />
        </p>

        <fieldset
          className="flex flex-col md:flex-row gap-4 w-full relative"
          disabled={isSubmitting}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div
            className="absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-800 !bg-opacity-50 z-20"
            style={{ display: isSubmitting ? "block" : "none" }}
          />

          <div
            className={
              "absolute top-0 left-0 w-full h-full bg-white dark:bg-slate-800 !bg-opacity-50 z-20 " +
              "transition-opacity duration-100 grid place-items-center backdrop-filter backdrop-blur-sm"
            }
            style={{
              opacity: isDragOver ? 1 : 0,
              pointerEvents: isDragOver ? "auto" : "none",
            }}
          >
            <div className="text-2xl font-bold text-center">
              <DocumentAddRegular className="w-32 h-32 text-gray-400" />
              <p className="text-gray-400">{t("dropHere")}</p>
            </div>
          </div>
          {fields.map((fields, i) => (
            <div
              className="flex flex-col w-full md:flex-grow md:max-w-1/2 gap-2"
              key={i}
            >
              {fields.map((field) =>
                field.type === "checkbox" ? (
                  <Checkbox
                    onChange={updateFormCheckbox(field.name)}
                    key={field.name}
                    label={t("param." + field.name)}
                    checked={form[field.name] as boolean}
                    disabled={field.disabled}
                  />
                ) : field.type === "submit" ? (
                  <>
                    <div className="flex-grow" />
                    <div className="flex justify-end gap-2">
                      {[
                        isEdit
                          ? form.isPublic !== firstForm.isPublic
                            ? firstForm.isPublic
                              ? {
                                  isPrimary: true,
                                  text: t("unpublish"),
                                  onClick: unpublishChart,
                                  isDanger: true,
                                }
                              : {
                                  isPrimary: true,
                                  text: t("publish"),
                                  onClick: publishChart,
                                }
                            : {
                                text: t("update"),
                                onClick: updateChart,
                              }
                          : {
                              isPrimary: true,
                              text: t("submit"),
                              onClick: submitChart,
                            },
                      ].map((button, i) => (
                        <div
                          key={i}
                          className={className(
                            "p-2 w-full box-border rounded cursor-pointer text-center",
                            "transition-colors transition-200",
                            button.isDanger
                              ? "bg-red-500 text-white bg-opacity-100 hover:bg-opacity-80 focus:bg-opacity-80"
                              : button.isPrimary
                              ? "bg-theme text-white bg-opacity-100 hover:bg-opacity-80 focus:bg-opacity-80"
                              : "text-theme border-2 border-theme bg-theme bg-opacity-0 hover:bg-opacity-10 focus:bg-opacity-10 py-[6px]"
                          )}
                          onClick={button.onClick}
                        >
                          {button.text}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div key={field.name}>
                    <h2
                      className={className(
                        "text-xl font-bold",
                        hasNote(field.name) || "mb-2"
                      )}
                    >
                      {t("param." + field.name)}{" "}
                      {field.optional && t("optional")}
                    </h2>

                    {hasNote(field.name) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t("param." + field.name + "Note")}
                      </p>
                    )}
                    {field.type === "textarea" ? (
                      <textarea
                        className={className(
                          "text-input w-full h-40",
                          errors[field.name] && "text-input-error"
                        )}
                        value={form[field.name] as string}
                        onChange={updateForm(field.name)}
                        disabled={field.disabled}
                      />
                    ) : field.type === "file" ? (
                      <FileInput
                        placeholder={field.placeholder || ""}
                        accept={field.fileTypes || "*"}
                        onChange={updateFormFile(field.name)}
                        className={
                          errors[field.name] ? "text-input-error" : undefined
                        }
                        value={form[field.name] as File | undefined}
                        disabled={field.disabled}
                      />
                    ) : field.type === "tags" ? (
                      <div
                        className="flex flex-col gap-2 tag-input"
                        data-reached-max={form.tags.length >= 5}
                      >
                        <ReactTags
                          tags={form.tags}
                          allowDragDrop={false}
                          placeholder=""
                          delimiters={[
                            13, // enter
                            188, // comma
                            32, // space
                          ]}
                          handleDelete={(i) => {
                            setForm((form) => ({
                              ...form,
                              tags: form.tags.filter((_, index) => index !== i),
                            }))
                          }}
                          handleAddition={(tag) => {
                            setForm((form) => ({
                              ...form,
                              tags: [...form.tags, tag],
                            }))
                          }}
                        />
                      </div>
                    ) : field.type === "number" ? (
                      <input
                        type="number"
                        className={className(
                          "text-input w-full",
                          errors[field.name] && "text-input-error"
                        )}
                        min={field.min}
                        max={field.max}
                        step={1}
                        defaultValue={field.defaultValue}
                        value={form[field.name] as string}
                        disabled={field.disabled}
                        onChange={updateForm(field.name, (value: string) => {
                          let num = parseInt(value)

                          if (isNaN(num)) {
                            num = field.defaultValue || 0
                          } else if (field.min && num < field.min) {
                            num = field.min
                          } else if (field.max && num > field.max) {
                            num = field.max
                          }

                          return num
                        })}
                      />
                    ) : field.type === "author" ? (
                      <>
                        <div
                          className={className(
                            "text-input w-full flex cursor-pointer relative",
                            isAltUserSelectorOpen && "!border-theme",
                            errors[field.name] && "border-red-500"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsAltUserSelectorOpen(true)
                          }}
                        >
                          <p className="flex-grow">
                            {user.name}
                            <span className="text-sm">#{user.handle}</span>
                          </p>
                          <p className="text-slate-400 dark:text-slate-600 ml-2 border-l border-slate-400 dark:border-slate-600 pl-2">
                            <ChevronDownRegular />
                          </p>
                          <div
                            className="absolute top-[calc(100%_+_4px)] left-[-2px] w-[calc(100%_+_4px)] z-10 border-slate-400 dark:border-slate-600 drop-shadow"
                            style={{
                              display: isAltUserSelectorOpen ? "block" : "none",
                            }}
                          >
                            {session.altUsers.map((user) => (
                              <div
                                className={
                                  "p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 " +
                                  "first:rounded-t last:rounded-b border-x-2 border-t first:border-t-2 last:border-b-2 border-slate-400 dark:border-slate-600"
                                }
                                key={user.handle}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setIsAltUserSelectorOpen(false)
                                  setForm((form) => ({
                                    ...form,
                                    authorHandle: user.handle,
                                    authorName: "",
                                  }))
                                }}
                              >
                                {user.name}
                                <span className="text-sm">#{user.handle}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-input w-full mt-2 flex">
                          <input
                            type="text"
                            className={className(
                              "outline-none flex-grow w-0",
                              errors[field.name] && "text-input-error"
                            )}
                            maxLength={32}
                            placeholder={user.name}
                            value={form.authorName}
                            onChange={updateForm("authorName")}
                          />

                          <p className="text-slate-400 dark:text-slate-600 ml-2 border-l border-slate-400 dark:border-slate-600 pl-2">
                            #{user.handle}
                          </p>
                        </div>
                      </>
                    ) : field.prefix ? (
                      <div className="text-input w-full flex">
                        <p className="text-slate-400 dark:text-slate-600 mr-2 border-r border-slate-400 dark:border-slate-600 pr-2">
                          {field.prefix}
                        </p>
                        <input
                          type="text"
                          className={className(
                            "outline-none w-full",
                            errors[field.name] && "text-input-error",
                            field.monospace && "font-monospace"
                          )}
                          maxLength={field.max}
                          disabled={field.disabled}
                          value={form[field.name] as string}
                          onChange={updateForm(field.name)}
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={className(
                          "text-input w-full",
                          errors[field.name] && "text-input-error",
                          field.monospace && "font-monospace"
                        )}
                        disabled={field.disabled}
                        maxLength={field.max}
                        value={form[field.name] as string}
                        onChange={updateForm(field.name)}
                      />
                    )}
                    {errors[field.name] && (
                      <p className="text-sm text-red-500 h-4">
                        {errorT(errors[field.name]!)}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          ))}
        </fieldset>
      </div>
    </div>
  )
}

export default UploadChart
