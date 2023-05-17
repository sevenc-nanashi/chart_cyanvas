import { NextPage } from "next"
import Head from "next/head"
import Link from "next/link"
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"
import { Tag, WithOutContext as ReactTags } from "react-tag-input"
import useTranslation from "next-translate/useTranslation"
import Trans from "next-translate/Trans"
import { Range, getTrackBackground } from "react-range"
import {
  ChevronDownRegular,
  DocumentRegular,
  ImageRegular,
  InfoRegular,
  LockClosedRegular,
  MusicNote2Regular,
} from "@fluentui/react-icons"
import urlcat from "urlcat"
import { useRouter } from "next/router"
import { HTML5Backend } from "react-dnd-html5-backend"
import { DndProvider } from "react-dnd"
import { useServerError, useSession } from "lib/atom"
import { className, isAdmin } from "lib/utils"
import ModalPortal from "components/ModalPortal"
import Checkbox from "components/Checkbox"
import requireLogin from "lib/requireLogin"
import DisablePortal from "components/DisablePortal"

const FileUploadButton = (props: {
  accept: string
  name: string
  text: string
  icon: JSX.Element
  error?: string
}) => {
  const fileInput = useRef<HTMLInputElement>(null)
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  useEffect(() => {
    fileInput.current?.addEventListener("change", () => forceUpdate())
  }, [fileInput])
  return (
    <div
      className={className(
        "flex !text-left items-center xl:flex-col flex-row rounded py-4 mb-4",
        "bg-theme dark:text-white bg-opacity-0 hover:bg-opacity-5 dark:hover:bg-opacity-20 border-2",
        "cursor-pointer hover:bg-opacity-20 button relative",
        fileInput.current?.files?.item(0)
          ? "border-theme dark:border-theme"
          : "border-slate-300 dark:border-white"
      )}
      onClick={() => {
        fileInput.current?.click()
      }}
    >
      <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full">
        {props.icon}
      </div>

      <span className="text-lg">
        {fileInput.current?.files?.item(0)?.name || props.text}
        {props.error && (
          <>
            <span className="text-sm text-red-500 xl:absolute xl:left-0 xl:right-0 xl:text-center xl:-bottom-6">
              <br />
              {props.error}
            </span>
          </>
        )}
      </span>
      <input
        type="file"
        data-name={props.name}
        accept={props.accept}
        hidden
        ref={fileInput}
      />
    </div>
  )
}
const InputTitle = (props: {
  text: string
  optional?: boolean
  tooltip?: string | undefined
  className?: string
  containerClassName?: string
  children: ReactNode
  error?: string
}) => {
  const { t } = useTranslation("upload")
  const [isTooltipShown, setIsTooltipShown] = useState(false)
  return (
    <div className={className("mt-2", props.containerClassName)}>
      <h3 className="text-lg font-bold">
        {props.text}
        {props.optional && t("optional")}
        {props.tooltip && (
          <div
            className="inline-block relative cursor-help"
            onMouseOver={() => setIsTooltipShown(true)}
            onMouseLeave={() => setIsTooltipShown(false)}
          >
            {isTooltipShown && (
              <div
                className={className(
                  "absolute bottom-full p-2 rounded font-sans left-[-8rem] right-[-8rem]",
                  "text-sm bg-slate-100 dark:bg-slate-700 shadow pointer-none"
                )}
              >
                {props.tooltip}
              </div>
            )}
            <InfoRegular />
          </div>
        )}
        {props.error && (
          <span className="ml-4 font-sans text-sm text-red-500">
            {props.error}
          </span>
        )}
      </h3>

      <div className={className("w-full", props.className)}>
        {props.children}
      </div>
    </div>
  )
}
const TextInput = (props: {
  name: string
  placeholder?: string
  monospace?: boolean
  prefix?: string
  defaultValue?: string
  error?: string | undefined
  disabled?: boolean
  maxLength?: number
  className?: string
  textarea?: boolean
  optional?: boolean
}) => {
  return props.prefix ? (
    <div
      className={className(
        "text-input !p-0 flex",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      )}
    >
      <div className="border-r-2 bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-slate-700 p-2 dark:text-slate-200">
        {props.prefix}
      </div>
      <input
        type="text"
        className="outline-none p-2 w-full"
        disabled={props.disabled}
        maxLength={props.maxLength}
        defaultValue={props.defaultValue}
        data-name={props.name}
        data-optional={props.optional}
        placeholder={props.placeholder}
      />
    </div>
  ) : props.textarea ? (
    <textarea
      className={className(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      )}
      disabled={props.disabled}
      maxLength={props.maxLength}
      defaultValue={props.defaultValue}
      data-name={props.name}
      data-optional={props.optional}
      placeholder={props.placeholder}
    />
  ) : (
    <input
      type="text"
      className={className(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      )}
      disabled={props.disabled}
      maxLength={props.maxLength}
      defaultValue={props.defaultValue}
      data-name={props.name}
      data-optional={props.optional}
      placeholder={props.placeholder}
    />
  )
}
const NumberInput = (props: {
  name: string
  max?: number
  min?: number
  error?: string | undefined
  monospace?: boolean
  className?: string
  value?: number
  onChange?: (value: number) => void
}) => {
  return (
    <input
      type="number"
      className={className(
        "text-input text-right",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace"
      )}
      onChange={(e) => {
        props.onChange?.(e.target.valueAsNumber)
      }}
      value={props.value}
      max={props.max}
      min={props.min}
    />
  )
}
const RangeInput = (props: {
  min: number
  max: number
  step: number
  name: string
  defaultValue?: number
  value?: number
  onChange?: (value: number) => void
}) => {
  const [values, setValues] = useState([props.defaultValue ?? props.min])

  const value = [
    Math.max(
      props.min,
      Math.min(props.max, props.value != null ? props.value : values[0])
    ),
  ]

  return (
    <>
      <Range
        step={props.step}
        min={props.min}
        max={props.max}
        values={value}
        onChange={(values) => {
          if (props.value != null) {
            props.onChange?.(values[0])
          } else {
            setValues(values)
          }
        }}
        renderTrack={({ props: rProps, children }) => (
          <div
            onMouseDown={rProps.onMouseDown}
            onTouchStart={rProps.onTouchStart}
            style={{
              ...rProps.style,
            }}
            className={"h-2 bg-gray-200 dark:bg-gray-900 rounded flex"}
          >
            <div
              ref={rProps.ref}
              className="h-2 w-full self-center rounded"
              style={{
                background: getTrackBackground({
                  values: value,
                  colors: ["#83ccd2", "#0000"],
                  min: props.min,
                  max: props.max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div {...props} className="w-4 h-4 bg-theme rounded-full" />
        )}
      />
      <input
        type="range"
        value={values[0]}
        data-name={props.name}
        readOnly
        hidden
      />
    </>
  )
}
const ScheduleInput = (props: {
  name: string
  defaultValue?: Date
  onChange?: (value: Date) => void
}) => {
  const currentDate = useMemo(() => {
    const date = new Date()

    return date
  }, [])

  const defaultValue = new Date(props.defaultValue || currentDate)

  defaultValue.setMinutes(
    defaultValue.getMinutes() - defaultValue.getTimezoneOffset()
  )

  const [scheduledAt, setScheduledAt] = useState(defaultValue)

  const displayValue = scheduledAt
    .toISOString()
    .replace(/:[0-9]+\.[0-9]+Z.*/g, "")

  return (
    <input
      type="datetime-local"
      className="text-input w-full mt-2"
      onChange={(e) => {
        const current = new Date()
        current.setMinutes(current.getMinutes() - current.getTimezoneOffset())
        const maybeNew = e.target.valueAsNumber
        const next = new Date(
          maybeNew
            ? current.getTime() > maybeNew
              ? current
              : maybeNew
            : current
        )
        const utcNext = new Date(next)
        utcNext.setMinutes(utcNext.getMinutes() + utcNext.getTimezoneOffset())
        props.onChange?.(utcNext)
        setScheduledAt(next)
      }}
      value={displayValue}
      data-name={props.name}
    />
  )
}
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
  chart: File | undefined
  bgm: File | undefined
  cover: File | undefined
  isChartPublic: boolean
  visibility: "public" | "private" | "scheduled"
  scheduledAt: Date | undefined
}
const UploadChart: NextPage<
  | {
      isEdit: true
      chartData: FormData
      adminAuthorData: AdminUser | undefined
    }
  | {
      isEdit: false
      chartData: undefined
      adminAuthorData: AdminUser | undefined
    }
> = ({ isEdit, chartData, adminAuthorData }) => {
  const { t } = useTranslation("upload")
  const { t: rootT } = useTranslation()
  const { t: errorT } = useTranslation("errors")
  const router = useRouter()

  const [session] = useSession()

  const setServerError = useServerError()

  if (!session.loggedIn) {
    throw new Error("Not logged in")
  }

  const [errors, setErrors] = useState<Record<string, string>>({})
  const mapErrors = useCallback(
    (e: Record<string, string>): Record<string, string> => {
      return Object.fromEntries(
        Object.entries(e).map(([k, v]) => [k, errorT(v)])
      )
    },
    [errorT]
  )

  const [isAltUserSelectorOpen, setIsAltUserSelectorOpen] = useState(false)

  const [ratingValue, setRatingValueRaw] = useState(chartData?.rating || 30)
  const setRatingValue = useCallback(
    (value: number) => {
      const parsed = value
      setRatingValueRaw(Math.min(99, Math.max(1, parsed)))
    },
    [setRatingValueRaw]
  )

  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false)

  const [visibility, setVisibility] = useState<
    "public" | "scheduled" | "private"
  >(chartData?.visibility || "private")

  const [isChartPublic, setIsChartPublic] = useState(!!chartData?.isChartPublic)

  const [authorHandle, setAuthorHandle] = useState(
    chartData?.authorHandle || session.user.handle
  )

  const selectableUsers = useMemo(
    () =>
      isAdmin(session) && adminAuthorData
        ? [adminAuthorData, ...adminAuthorData.altUsers]
        : [session.user, ...session.altUsers],
    [session, adminAuthorData]
  )

  const authorName = useMemo(
    () => selectableUsers.find((u) => u.handle === authorHandle)?.name ?? "",

    [authorHandle, selectableUsers]
  )

  const [tags, setTags] = useState<Tag[]>(chartData?.tags || [])
  const closeAltUserSelector = useCallback(() => {
    setIsAltUserSelectorOpen(false)
  }, [])

  const scheduledAt = useRef<Date>(
    (() => {
      if (chartData?.scheduledAt) {
        return new Date(
          Math.max(chartData.scheduledAt.getTime(), new Date().getTime())
        )
      } else {
        return new Date()
      }
    })()
  )

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

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFileSizeError, setShowFileSizeError] = useState(false)
  const createFormData = useCallback(() => {
    const errors: Record<string, string> = {}

    const getField = (name: string) => {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`
      ) as HTMLInputElement
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`)
      }
      if (
        !fieldElement.value &&
        fieldElement.getAttribute("data-optional") !== "true"
      ) {
        errors[name] = errorT("cannotBeEmpty")
        return undefined
      }
      return fieldElement.value
    }

    const formData = new FormData()
    const scheduledAtField = scheduledAt.current
    formData.append(
      "data",
      JSON.stringify({
        title: getField("title"),
        description: getField("description"),
        composer: getField("composer"),
        artist: getField("artist"),
        tags: tags.map((tag) => tag.text),
        rating: ratingValue,
        authorHandle: authorHandle,
        authorName: getField("authorName"),
        variant: getField("variant"),
        isChartPublic,
        visibility,
        scheduledAt: scheduledAtField.getTime(),
      })
    )

    for (const name of ["chart", "bgm", "cover"]) {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`
      ) as HTMLInputElement
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`)
      }
      if (fieldElement.files && fieldElement.files.length > 0) {
        formData.append(name, fieldElement.files[0])
      } else if (!isEdit) {
        errors[name as keyof FormData] = errorT("cannotBeEmpty")
      }
    }
    setErrors(errors)
    if (Object.keys(errors).length > 0) {
      return false
    }
    return formData
  }, [
    tags,
    ratingValue,
    authorHandle,
    isChartPublic,
    visibility,
    errorT,
    isEdit,
  ])
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
      } else if (res.status === 404) {
        router.push("/")
        return
      }
      const data = await res.json()
      if (data.code !== "ok") {
        setErrors(mapErrors(data.errors))

        setIsSubmitting(false)
        return
      }

      return data
    },
    [setErrors, setServerError, mapErrors, router]
  )
  const submitChart = useCallback(() => {
    const formData = createFormData()
    if (!formData) {
      return
    }

    setIsSubmitting(true)
    fetch("/api/charts", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await handleResponse(res)
      if (!data) {
        return
      }
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
      urlcat(`/api/charts/:name`, {
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
      const formData = createFormData()
      if (!formData) {
        return
      }

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
  }, [router, createFormData])
  const unpublishChart = useCallback(() => {
    setIsSubmitting(true)
    const formData = createFormData()
    if (!formData) {
      return
    }
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
        setErrors(data.errors)

        setIsSubmitting(false)
        return
      }
      router.push(`/charts/${data.chart.name}`)
    })
  }, [router, createFormData, setErrors, setShowFileSizeError, setServerError])

  const [unUploadedFiles, setUnUploadedFiles] = useState<File[]>([])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files

    const unUploaded: File[] = []
    for (const file of Array.from(files)) {
      let field: string
      if (file.name.endsWith(".sus")) {
        field = "chart"
      } else if (["mp3", "wav", "ogg"].includes(file.name.split(".").pop()!)) {
        field = "bgm"
      } else if (["jpg", "jpeg", "png"].includes(file.name.split(".").pop()!)) {
        field = "cover"
      } else {
        unUploaded.push(file)
        continue
      }
      const inputElement = document.querySelector(
        `[data-name="${field}"]`
      ) as HTMLInputElement
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)

      inputElement.files = dataTransfer.files
      inputElement.dispatchEvent(new Event("change"))
    }
    if (unUploaded.length) {
      setUnUploadedFiles(unUploaded)
    }
  }, [])

  return (
    <div
      className="flex flex-col gap-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <fieldset disabled={isSubmitting}>
        <Head>
          <title>{t("title") + " | " + rootT("name")}</title>
        </Head>
        <DisablePortal isShown={isSubmitting} />
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

        <ModalPortal isOpen={isVisibilityDialogOpen}>
          <h1 className="text-xl font-bold text-normal mb-2">
            {t("visibility.title")}
          </h1>

          <div className="flex flex-col gap-4">
            {(["public", "scheduled", "private"] as const).map((key) => (
              <div key={key} className="flex">
                <div className="w-6 mr-2 flex-shrink-0">
                  <div
                    className="rounded-full mt-1 h-6 box-border border-2 border-slate-300 dark:border-slate-700 p-1 cursor-pointer"
                    onClick={() => setVisibility(key)}
                  >
                    {key === visibility && (
                      <div className="rounded-full w-full h-full bg-theme" />
                    )}
                  </div>
                </div>

                <div className="flex-grow flex flex-col">
                  <label
                    onClick={() => setVisibility(key)}
                    className="cursor-pointer"
                  >
                    <h5 className="text-lg font-bold">
                      {t(`visibility.${key}`)}
                    </h5>
                  </label>
                  <div className="text-sm">
                    {t(`visibility.description.${key}`)}
                  </div>
                  {key === "scheduled" && (
                    <ScheduleInput
                      name="scheduledAt"
                      defaultValue={scheduledAt.current}
                      onChange={(value) => (scheduledAt.current = value)}
                    />
                  )}
                </div>
              </div>
            ))}
            <Checkbox
              onChange={(e) => {
                setIsChartPublic(e.target.checked)
              }}
              label={t("isChartPublic")}
              checked={isChartPublic}
            />
          </div>

          <div className="flex justify-end mt-4">
            <div
              className="px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer"
              onClick={() => setIsVisibilityDialogOpen(false)}
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
                <Link
                  href={`https://cc-wiki.sevenc7c.com/${
                    router.locale || "en"
                  }/guideline`}
                  key="0"
                  target="_blank"
                />,
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
                {t("titleEdit", { title: chartData.title })}
                {chartData.visibility === "public" || (
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
              components={[
                <Link
                  href={`https://cc-wiki.sevenc7c.com/${
                    router.locale || "en"
                  }/guideline`}
                  target="_blank"
                  key="0"
                />,
              ]}
            />
          </p>
          <div className="grid xl:grid-cols-3 gap-4">
            <FileUploadButton
              accept="image/*"
              name="cover"
              text={t("param.cover")}
              icon={<ImageRegular />}
              error={errors["cover"]}
            />
            <FileUploadButton
              accept="audio/*,.mp3,.wav,.ogg"
              name="bgm"
              text={t("param.bgm")}
              icon={<MusicNote2Regular />}
              error={errors["bgm"]}
            />
            <FileUploadButton
              accept=".sus"
              name="chart"
              text={t("param.chart")}
              icon={<DocumentRegular />}
              error={errors["chart"]}
            />
          </div>
          <div className="flex items-middle pt-2">
            <InfoRegular className="h-6" />
            <span className="text-sm"> {t("dndHint")}</span>
          </div>
          <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-4 gap-2">
            <div className="flex flex-col xl:flex-grow gap-2">
              <InputTitle text={t("param.title")} error={errors["title"]}>
                <TextInput
                  name="title"
                  className="w-full"
                  defaultValue={chartData?.title}
                />
              </InputTitle>
              <InputTitle text={t("param.composer")} error={errors["composer"]}>
                <TextInput
                  name="composer"
                  className="w-full"
                  defaultValue={chartData?.composer}
                />
              </InputTitle>
              <InputTitle
                text={t("param.artist")}
                optional
                error={errors["artist"]}
              >
                <TextInput
                  name="artist"
                  className="w-full"
                  optional
                  defaultValue={chartData?.artist}
                />
              </InputTitle>
              <InputTitle
                text={t("param.rating")}
                tooltip={t("tooltip.rating")}
                className="flex gap-4 items-center"
                error={errors["rating"]}
              >
                <div className="flex-grow">
                  <RangeInput
                    name="rating"
                    min={1}
                    max={40}
                    value={ratingValue}
                    onChange={(value) => setRatingValue(value)}
                    step={1}
                  />
                </div>
                <NumberInput
                  name="rating"
                  className="w-16"
                  min={1}
                  max={99}
                  value={ratingValue}
                  onChange={(value) => setRatingValue(value)}
                />
              </InputTitle>
              <InputTitle
                text={t("visibility.title")}
                error={errors["visibility"]}
              >
                <div
                  className={className(
                    "button-secondary p-2",
                    isEdit || "disabled"
                  )}
                  onClick={() => isEdit && setIsVisibilityDialogOpen(true)}
                >
                  {t(`visibility.${visibility}`)}
                </div>
              </InputTitle>
            </div>
            <div className="flex flex-col xl:flex-grow gap-2">
              <InputTitle
                text={t("param.author")}
                className="w-full flex gap-2 relative"
                error={errors["author"]}
              >
                <TextInput
                  name="authorName"
                  className="flex-grow min-w-0"
                  defaultValue={chartData?.authorName || session.user.name}
                  placeholder={authorName}
                />
                <div
                  className={className(
                    "text-input hover:border-theme transition-colors duration-200 cursor-pointer flex items-center",
                    isAltUserSelectorOpen && "!border-theme"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAltUserSelectorOpen(true)
                  }}
                >
                  #{authorHandle} <ChevronDownRegular />
                </div>
                <div className="absolute top-full left-1 right-1">
                  <div
                    className="absolute top-[calc(100%_+_4px)] left-[-2px] w-[calc(100%_+_4px)] z-10 border-slate-400 dark:border-slate-600 shadow-md"
                    style={{
                      display: isAltUserSelectorOpen ? "block" : "none",
                    }}
                  >
                    {selectableUsers.map((user) => (
                      <div
                        className={
                          "p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 " +
                          "first:rounded-t last:rounded-b border-x-2 border-t first:border-t-2 last:border-b-2 border-slate-300 dark:border-slate-700 cursor-pointer"
                        }
                        key={user.handle}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsAltUserSelectorOpen(false)
                          setAuthorHandle(user.handle)
                          ;(
                            document.querySelector(
                              "[data-name='authorName']"
                            ) as HTMLInputElement
                          ).value = user.name
                        }}
                      >
                        {user.name}
                        <span className="text-sm">#{user.handle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </InputTitle>
              <InputTitle
                text={t("param.variant")}
                optional
                tooltip={t("tooltip.variant")}
                error={errors["variant"]}
              >
                <TextInput
                  name="variant"
                  className="w-full"
                  monospace
                  optional
                  prefix="#"
                  defaultValue={chartData?.variant}
                />
              </InputTitle>
              <InputTitle
                text={t("param.tags")}
                tooltip={t("tooltip.tags")}
                error={errors["tags"]}
              >
                <div
                  className="flex flex-col gap-2 tag-input"
                  data-reached-max={tags.length >= 5}
                >
                  <ReactTags
                    tags={tags}
                    allowDragDrop={false}
                    placeholder=""
                    delimiters={[
                      13,
                      188,
                      32, // space
                    ]}
                    handleDelete={(i) => {
                      setTags(tags.filter((_, index) => index !== i))
                    }}
                    handleAddition={(tag) => {
                      setTags([...tags, tag])
                    }}
                  />
                </div>
              </InputTitle>
              <InputTitle
                text={t("param.description")}
                className="h-full"
                error={errors["description"]}
              >
                <TextInput
                  name="description"
                  textarea
                  optional
                  className="w-full h-32"
                  defaultValue={chartData?.description}
                />
              </InputTitle>
            </div>
          </div>
          <div className="mt-4 border-t-2 border-slate-300 dark:border-slate-700" />
          <div className="mt-4">
            {[
              isEdit
                ? (visibility !== "private") !==
                  (chartData.visibility !== "private")
                  ? chartData.visibility !== "private"
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
                  "p-2 w-full",
                  button.isDanger
                    ? "button-danger"
                    : button.isPrimary
                    ? "button-primary"
                    : "button-secondary"
                )}
                onClick={button.onClick}
              >
                {button.text}
              </div>
            ))}
          </div>
        </div>
      </fieldset>
    </div>
  )
}
export default requireLogin(
  (props: Omit<Parameters<typeof UploadChart>[0], "adminAuthorData">) => {
    const [session] = useSession()
    const [adminAuthorData, setAdminAuthorData] = useState<
      AdminUser | undefined
    >(undefined)
    useEffect(() => {
      if (isAdmin(session)) {
        ;(async () => {
          console.log("fetching admin info")
          const res = await fetch(
            urlcat(`/api/admin/users/:handle`, {
              handle: props.chartData?.authorHandle,
            })
          )
          const data = await res.json()

          if (data.code === "ok") {
            setAdminAuthorData(data.user)
          }
        })()
      }
    }, [session, props])

    if (isAdmin(session) && !adminAuthorData) {
      return <></>
    }
    return (
      <DndProvider backend={HTML5Backend}>
        {/* @ts-expect-error Typeerror occurs somehow */}
        <UploadChart {...props} adminAuthorData={adminAuthorData} />
      </DndProvider>
    )
  }
)
