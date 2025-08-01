import {
  DocumentRegular,
  ImageRegular,
  InfoRegular,
  MusicNote2Regular,
} from "@fluentui/react-icons";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { WithContext as ReactTags } from "react-tag-input";
import {
  useMyFetch,
  useServerSettings,
  useSession,
  useSetIsSubmitting,
} from "~/lib/contexts";
import type { AdminOnlyUserData, Chart, User } from "~/lib/types.ts";
import { isAdmin } from "~/lib/utils.ts";
import Budoux from "./Budoux.tsx";
import Checkbox from "./Checkbox.tsx";
import FileUploadButton from "./FileUploadButton.tsx";
import InputTitle from "./InputTitle.tsx";
import ModalPortal from "./ModalPortal.tsx";
import NumberInput from "./NumberInput.tsx";
import RadioItem, { RadioGroup } from "./RadioButton.tsx";
import RangeInput from "./RangeInput.tsx";
import ScheduleInput from "./ScheduleInput.tsx";
import Select from "./Select.tsx";
import TextInput from "./TextInput.tsx";

type Tag = { id: string; text: string };
type ChartFormData = {
  title: string;
  description: string;
  composer: string;
  artist: string;
  rating: number;
  genre: string;
  tags: Tag[];
  authorHandle: string;
  authorName: string;
  variant: string;
  chart: File | undefined;
  bgm: File | undefined;
  cover: File | undefined;
  isChartPublic: boolean;
  visibility: "public" | "private" | "scheduled";
  scheduledAt: Date | undefined;
};

const ChartForm: React.FC<
  | {
      isEdit: true;
      chartData: ChartFormData;
      chartName: string;
      adminOnlyAuthorData: (AdminOnlyUserData & { user: User }) | undefined;
    }
  | {
      isEdit: false;
      variantOf?: string | undefined;
    }
> = (props) => {
  const { isEdit, chartData, chartName, variantOf, adminOnlyAuthorData } = {
    chartData: undefined,
    chartName: "",
    variantOf: undefined,
    adminOnlyAuthorData: undefined,
    ...props,
  };
  const { t, i18n } = useTranslation("upload");
  const { t: rootT } = useTranslation();
  const { t: errorT } = useTranslation("errors");
  const navigate = useNavigate();
  const serverSettings = useServerSettings();

  const session = useSession();

  const myFetch = useMyFetch();

  if (!session?.loggedIn) {
    throw new Error("Not logged in");
  }

  const [errors, setErrors] = useState<Record<string, string>>({});
  const mapErrors = useCallback(
    (e: Record<string, string>): Record<string, string> => {
      return Object.fromEntries(
        Object.entries(e).map(([k, v]) => [k, errorT(v)]),
      );
    },
    [errorT],
  );

  const [isAltUserSelectorOpen, setIsAltUserSelectorOpen] = useState(false);

  const [ratingValue, setRatingValueRaw] = useState(chartData?.rating || 30);
  const setRatingValue = useCallback((value: number) => {
    const parsed = value;
    setRatingValueRaw(Math.min(99, Math.max(1, parsed)));
  }, []);

  const [isVisibilityDialogOpen, setIsVisibilityDialogOpen] = useState(false);

  const [visibility, setVisibility] = useState<
    "public" | "scheduled" | "private"
  >(chartData?.visibility || "private");

  const [isChartPublic, setIsChartPublic] = useState(
    !!chartData?.isChartPublic,
  );

  const defaultAuthorHandle = chartData?.authorHandle || session.user.handle;

  const [authorHandle, setAuthorHandle] = useState(defaultAuthorHandle);

  const selectableUsers = useMemo(
    () =>
      isAdmin(session) && adminOnlyAuthorData
        ? [adminOnlyAuthorData.user, ...adminOnlyAuthorData.altUsers]
        : [session.user, ...session.altUsers],
    [session, adminOnlyAuthorData],
  );

  const authorName = useMemo(
    () => selectableUsers.find((u) => u.handle === authorHandle)?.name ?? "",

    [authorHandle, selectableUsers],
  );

  const [genre, setGenre] = useState<string>(chartData?.genre || "");

  const [tags, setTags] = useState<Tag[]>(chartData?.tags || []);
  const closeAltUserSelector = useCallback(() => {
    setIsAltUserSelectorOpen(false);
  }, []);

  const scheduledAt = useRef<Date>(
    (() => {
      if (chartData?.scheduledAt) {
        return new Date(
          Math.max(chartData.scheduledAt.getTime(), new Date().getTime()),
        );
      } else {
        return new Date();
      }
    })(),
  );

  useEffect(() => {
    if (isAltUserSelectorOpen) {
      document.addEventListener("click", closeAltUserSelector);
    } else {
      document.removeEventListener("click", closeAltUserSelector);
    }
    return () => {
      document.removeEventListener("click", closeAltUserSelector);
    };
  }, [isAltUserSelectorOpen, closeAltUserSelector]);

  const setIsSubmitting = useSetIsSubmitting();
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const createFormData = useCallback(() => {
    const errors: Record<string, string> = {};

    const getField = (name: string) => {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`,
      ) as HTMLInputElement;
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`);
      }
      if (
        !fieldElement.value &&
        fieldElement.getAttribute("data-optional") !== "true"
      ) {
        errors[name] = errorT("cannotBeEmpty");
        return undefined;
      }
      return fieldElement.value;
    };
    if (genre === "") {
      errors.genre = errorT("cannotBeEmpty");
    }

    const formData = new FormData();
    const scheduledAtField = scheduledAt.current;
    formData.append(
      "data",
      JSON.stringify({
        title: getField("title"),
        description: getField("description"),
        composer: getField("composer"),
        artist: genre === "instrumental" ? "" : getField("artist"),
        genre,
        tags: tags.map((tag) => tag.text),
        rating: ratingValue,
        authorHandle: authorHandle,
        authorName: getField("authorName"),
        variant: getField("variant"),
        isChartPublic,
        visibility,
        scheduledAt: scheduledAtField.getTime(),
      }),
    );

    for (const name of ["chart", "bgm", "cover"]) {
      const fieldElement = document.querySelector(
        `[data-name='${name}']`,
      ) as HTMLInputElement;
      if (!fieldElement) {
        throw new Error(`unknown field: ${name}`);
      }
      if (fieldElement.files && fieldElement.files.length > 0) {
        formData.append(name, fieldElement.files[0]);
      } else if (!isEdit) {
        errors[name as keyof ChartFormData] = errorT("cannotBeEmpty");
      }
    }
    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return false;
    }
    return formData;
  }, [
    tags,
    ratingValue,
    authorHandle,
    isChartPublic,
    visibility,
    errorT,
    isEdit,
    genre,
  ]);
  const handleResponse = useCallback(
    async (res: Response) => {
      try {
        if (res.status === 413) {
          setShowFileSizeError(true);
          return;
        } else if (res.status === 404) {
          navigate("/");
          return;
        }
        const data = await res.json().catch(() => ({
          code: "error",
          errors: {},
        }));
        if (data.code !== "ok") {
          setErrors(mapErrors(data.errors));

          return;
        }

        return data;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mapErrors, navigate, setIsSubmitting],
  );
  const submitChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }

    setIsSubmitting(true);
    myFetch("/api/charts", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        const data = await handleResponse(res);
        if (!data) {
          return;
        }
        navigate(`/charts/${data.chart.name}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [myFetch, createFormData, handleResponse, navigate, setIsSubmitting]);

  const updateChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }

    setIsSubmitting(true);
    myFetch(
      pathcat("/api/charts/:name", {
        name: chartName,
      }),
      {
        method: "PUT",
        body: formData,
      },
    )
      .then(async (res) => {
        const data = await handleResponse(res);
        if (!data) {
          return;
        }
        navigate(`/charts/${data.chart.name}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [
    myFetch,
    createFormData,
    handleResponse,
    chartName,
    navigate,
    setIsSubmitting,
  ]);

  const [publishConfirms, setPublishConfirms] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const isAllPublicConfirmsChecked = publishConfirms.every(
    (checked) => checked,
  );

  const [waitForPublishConfirm, setWaitForPublishConfirm] =
    useState<CallableFunction | null>(null);

  const publishChart = useCallback(() => {
    setPublishConfirms([false, false, false, false, false]);
    new Promise<boolean>((resolve) => {
      setWaitForPublishConfirm(() => resolve);
    }).then((confirmed) => {
      if (confirmed == null) {
        return;
      }
      setWaitForPublishConfirm(null);
      if (!confirmed) {
        return;
      }
      setIsSubmitting(true);
      const formData = createFormData();
      if (!formData) {
        return;
      }

      myFetch(pathcat("/api/charts/:name", { name: chartName }), {
        method: "PUT",
        body: formData,
      }).then(async (res) => {
        const data = await handleResponse(res);
        if (!data) {
          return;
        }
        navigate(`/charts/${data.chart.name}`);
      });
    });
  }, [
    myFetch,
    navigate,
    chartName,
    handleResponse,
    setIsSubmitting,
    createFormData,
  ]);
  const unpublishChart = useCallback(() => {
    setIsSubmitting(true);
    const formData = createFormData();
    if (!formData) {
      return;
    }
    myFetch(pathcat("/api/charts/:name", { name: chartName }), {
      method: "PUT",
      body: formData,
    })
      .then(async (res) => {
        if (res.status === 413) {
          setShowFileSizeError(true);
          return;
        }
        const data = (await res.json()) as {
          code: string;
          chart: Chart;
          errors: Partial<Record<keyof FormData, string>>;
        };
        if (data.code !== "ok") {
          setErrors(data.errors);

          return;
        }
        navigate(`/charts/${data.chart.name}`);
      })
      .finally(() => setIsSubmitting(false));
  }, [navigate, chartName, createFormData, myFetch, setIsSubmitting]);

  const [unUploadedFiles, setUnUploadedFiles] = useState<File[]>([]);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    const unUploaded: File[] = [];
    for (const file of Array.from(files)) {
      let field: string;
      if (["usc", "sus"].includes(file.name.split(".").pop()!)) {
        field = "chart";
      } else if (["mp3", "wav", "ogg"].includes(file.name.split(".").pop()!)) {
        field = "bgm";
      } else if (
        ["jpg", "jpeg", "png", "webp"].includes(file.name.split(".").pop()!)
      ) {
        field = "cover";
      } else {
        unUploaded.push(file);
        continue;
      }
      const inputElement = document.querySelector(
        `[data-name="${field}"]`,
      ) as HTMLInputElement;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      inputElement.files = dataTransfer.files;
      inputElement.dispatchEvent(new Event("change"));
    }
    if (unUploaded.length) {
      setUnUploadedFiles(unUploaded);
    }
  }, []);

  let canPost = true;
  if (serverSettings.discordEnabled && !session.discord) {
    canPost = false;
  }
  if (session.warnings.some((w) => w.active)) {
    canPost = false;
  }

  const warningEndsAt = session.warnings
    .filter((w) => w.active)
    .reduce((acc, w) => {
      if (!w.endsAt) {
        return acc;
      }
      if (new Date(w.endsAt).getTime() > acc.getTime()) {
        return new Date(w.endsAt);
      }
      return acc;
    }, new Date());
  const hasWarning = session.warnings.some((w) => w.active);
  const isBanned = session.warnings.some((w) => w.active && w.level === "ban");

  return (
    <form
      className="flex flex-col gap-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onSubmit={(e) => {
        e.preventDefault();
        if (isEdit) {
          if (
            (visibility !== "private") !==
            (chartData.visibility !== "private")
          ) {
            if (chartData.visibility !== "private") {
              unpublishChart();
            } else {
              publishChart();
            }
          } else {
            updateChart();
          }
        } else if (canPost) {
          submitChart();
        }
      }}
    >
      <ModalPortal
        isOpen={unUploadedFiles.length > 0}
        close={() => setUnUploadedFiles([])}
      >
        <h1 className="text-xl font-bold mb-2">{t("unUploadedFiles")}</h1>
        <p className="text-sm text-gray-500">{t("unUploadedFilesNote")}</p>
        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 button-cancel"
            onClick={() => setUnUploadedFiles([])}
          >
            {rootT("close")}
          </div>
        </div>
      </ModalPortal>
      <ModalPortal
        isOpen={showFileSizeError}
        close={() => setShowFileSizeError(false)}
      >
        <h1 className="text-xl font-bold mb-2">{t("filesTooLarge")}</h1>
        <p className="text-sm text-gray-500">{t("filesTooLargeNote")}</p>

        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 button-cancel"
            onClick={() => setShowFileSizeError(false)}
          >
            {rootT("close")}
          </div>
        </div>
      </ModalPortal>
      <ModalPortal
        isOpen={isVisibilityDialogOpen}
        close={() => setIsVisibilityDialogOpen(false)}
      >
        <h1 className="text-xl font-bold text-normal mb-2">
          {t("visibility.title")}
        </h1>

        <div className="flex flex-col gap-4">
          <RadioGroup
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as "public" | "scheduled" | "private")
            }
            className="flex flex-col gap-4"
          >
            {(["public", "scheduled", "private"] as const).map((key) => (
              <RadioItem
                key={key}
                value={key}
                className="flex-grow flex flex-col"
              >
                <h5 className="text-lg font-bold">{t(`visibility.${key}`)}</h5>
                <div className="text-sm">
                  {t(`visibility.description.${key}`)}
                </div>
                {key === "scheduled" && (
                  <ScheduleInput
                    name="scheduledAt"
                    defaultValue={scheduledAt.current}
                    onChange={(value) => {
                      scheduledAt.current = value;
                    }}
                  />
                )}
              </RadioItem>
            ))}
          </RadioGroup>
          <Checkbox
            onChange={(checked) => {
              setIsChartPublic(checked);
            }}
            label={t("isChartPublic")}
            checked={isChartPublic}
          />
        </div>

        <div className="flex justify-end mt-4">
          <div
            className="px-4 py-2 button-cancel"
            onClick={() => setIsVisibilityDialogOpen(false)}
          >
            {rootT("close")}
          </div>
        </div>
      </ModalPortal>
      <ModalPortal
        isOpen={waitForPublishConfirm !== null}
        close={() => waitForPublishConfirm?.(false)}
      >
        <h1 className="text-xl font-bold text-normal mb-2">
          {t("publishModal.title")}
        </h1>
        <p className="text-sm text-gray-500 text-normal mb-1">
          {t("publishModal.description")}
        </p>
        <div className="flex flex-col gap-2">
          {publishConfirms.map((checked, i) => (
            <Checkbox
              checked={checked}
              onChange={(checked) => {
                const newConfirms = [...publishConfirms];
                newConfirms[i] = checked;
                setPublishConfirms(newConfirms);
              }}
              size="sm"
              key={i}
            >
              <h5 className="font-bold">
                <Trans t={t} i18nKey={`publishModal.check${i}.title`} />
              </h5>
              {t(`publishModal.check${i}.description`) !==
                `publishModal.check${i}.description` && (
                <p className="text-sm">
                  <Trans t={t} i18nKey={`publishModal.check${i}.description`} />
                </p>
              )}
            </Checkbox>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-normal mt-1">
          <Trans
            i18nKey="upload:publishModal.description2"
            components={[
              <a
                href={`https://cc.sevenc7c.com/wiki/${i18n.language}/guideline`}
                key="0"
                target="_blank"
              />,
            ]}
          />
        </p>
        <div className="flex justify-end mt-4 gap-2">
          <button
            className="px-4 py-2 button-tertiary"
            onClick={() => {
              waitForPublishConfirm?.(false);
            }}
          >
            {rootT("cancel")}
          </button>
          <button
            className="px-4 py-2 button-primary"
            disabled={!isAllPublicConfirmsChecked}
            onClick={() => {
              isAllPublicConfirmsChecked && waitForPublishConfirm?.(true);
            }}
          >
            {t("publishModal.ok")}
          </button>
        </div>
      </ModalPortal>
      <p>
        <Budoux>
          <Trans
            i18nKey="upload:description"
            components={[
              <a
                href={`https://cc.sevenc7c.com/wiki/${i18n.language}/guideline`}
                target="_blank"
                key="0"
              />,
            ]}
          />
        </Budoux>
      </p>
      {isBanned ? (
        <p className="box box-error">{t("warning.banned")}</p>
      ) : hasWarning ? (
        <p className="box box-warning">
          {t("warning.endsAt", {
            endsAt: warningEndsAt.toLocaleString(),
          })}
        </p>
      ) : null}

      {serverSettings.discordEnabled && (
        <p className="mb-2 box box-info">
          <Budoux>
            {t("discordInfo.description")}
            <br />
            {t("discordInfo.status.label")}
            {session.discord ? (
              <>
                {t("discordInfo.status.connected", {
                  username: session.discord.username,
                })}
              </>
            ) : (
              <>{t("discordInfo.status.notConnected")}</>
            )}
            <a
              href={`https://cc.sevenc7c.com/wiki/${i18n.language}/publishing`}
              target="_blank"
              className="ml-2"
            >
              {t("discordInfo.connectGuide")}
            </a>
          </Budoux>
        </p>
      )}
      <fieldset className="relative" disabled={!canPost}>
        {canPost || (
          <div className="absolute z-10 top-0 left-0 w-full h-full bg-white dark:bg-slate-800 bg-opacity-50 cursor-not-allowed" />
        )}
        <div className="grid xl:grid-cols-3 gap-4">
          <FileUploadButton
            accept="image/*"
            name="cover"
            text={t("param.cover")}
            icon={<ImageRegular />}
            error={errors.cover}
            extensions={["jpg", "png", "webp"]}
          />
          <FileUploadButton
            accept="audio/*,.mp3,.wav,.ogg"
            name="bgm"
            text={t("param.bgm")}
            icon={<MusicNote2Regular />}
            error={errors.bgm}
            extensions={["mp3", "wav", "ogg"]}
          />
          <FileUploadButton
            accept=".sus,.usc,.json"
            name="chart"
            text={t("param.chart")}
            icon={<DocumentRegular />}
            error={errors.chart}
            extensions={["usc", "sus"]}
          />
        </div>
        <div className="items-middle pt-2 hidden lg:flex">
          <InfoRegular className="h-6" />
          <span className="text-sm"> {t("dndHint")}</span>
        </div>
        <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-4 gap-2">
          <div className="flex flex-col xl:flex-grow gap-2">
            <InputTitle text={t("param.title")} error={errors.title}>
              <TextInput
                name="title"
                className="w-full"
                defaultValue={chartData?.title}
              />
            </InputTitle>
            <InputTitle text={t("param.composer")} error={errors.composer}>
              <TextInput
                name="composer"
                className="w-full"
                defaultValue={chartData?.composer}
              />
            </InputTitle>
            <InputTitle text={t("param.artist")} error={errors.artist}>
              <TextInput
                key={
                  genre === "instrumental" ? "instrumental" : "non-instrumental"
                }
                name="artist"
                className="w-full"
                optional
                defaultValue={chartData?.artist}
                value={genre === "instrumental" ? "" : undefined}
                disabled={genre === "instrumental"}
              />
            </InputTitle>
            <InputTitle
              text={t("param.rating")}
              tooltip={t("tooltip.rating")}
              className="flex gap-4 items-center"
              error={errors.rating}
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
            <InputTitle text={t("visibility.title")} error={errors.visibility}>
              <div
                className={clsx("button-secondary p-2", isEdit || "disabled")}
                onClick={() => isEdit && setIsVisibilityDialogOpen(true)}
              >
                {t(`visibility.${visibility}`)}
              </div>
            </InputTitle>
          </div>
          <div className="flex flex-col xl:flex-grow gap-2">
            <InputTitle
              text={t("param.author")}
              className="flex gap-2 relative"
              error={errors.author}
            >
              <TextInput
                name="authorName"
                className="flex-grow min-w-0"
                defaultValue={chartData?.authorName || session.user.name}
                placeholder={authorName}
              />
              <Select
                items={selectableUsers.map((user) => ({
                  type: "item",
                  label: `${user.name}#${user.handle}`,
                  value: user.handle,
                }))}
                value={authorHandle}
                onChange={setAuthorHandle}
              >
                #{authorHandle}
              </Select>
            </InputTitle>
            <InputTitle
              text={t("param.variant")}
              optional
              tooltip={t("tooltip.variant")}
              error={errors.variant}
            >
              <TextInput
                name="variant"
                className="w-full"
                monospace
                optional
                prefix="#"
                defaultValue={variantOf || chartData?.variant}
              />
            </InputTitle>
            <InputTitle text={t("param.genre")} error={errors.genre}>
              <Select
                items={serverSettings.genres.map(
                  (genre) =>
                    ({
                      type: "item",
                      label: rootT(`genre.${genre}`),
                      value: genre,
                    }) as const,
                )}
                defaultValue={chartData?.genre || ""}
                value={genre}
                onChange={(value) => {
                  setGenre(value);
                }}
                className="w-full"
              />
            </InputTitle>
            <InputTitle
              text={t("param.tags")}
              tooltip={t("tooltip.tags")}
              error={errors.tags}
            >
              <div
                className={clsx(
                  "flex flex-col gap-2 tag-input",
                  tags.length >= 5 && "[&_.ReactTags__tagInput]_hidden",
                )}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  e.key === "Enter" && e.preventDefault();
                }}
              >
                <ReactTags
                  tags={tags.map((tag) => ({
                    className: "",
                    text: tag.text,
                    id: tag.id,
                  }))}
                  allowDragDrop={false}
                  placeholder=""
                  separators={[" ", ",", "\n"]}
                  handleDelete={(i) => {
                    setTags(tags.filter((_, index) => index !== i));
                  }}
                  handleAddition={(tag) => {
                    setTags((tags) => [...tags, tag] as Tag[]);
                  }}
                />
              </div>
            </InputTitle>
            <InputTitle
              text={t("param.description")}
              className="h-full"
              error={errors.description}
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
          {isEdit ? (
            (visibility !== "private") !==
            (chartData.visibility !== "private") ? (
              chartData.visibility !== "private" ? (
                <button className="p-2 w-full button-danger">
                  {t("unpublish")}
                </button>
              ) : (
                <button className="p-2 w-full button-primary">
                  {t("publish")}
                </button>
              )
            ) : (
              <button className="p-2 w-full button-secondary">
                {t("update")}
              </button>
            )
          ) : (
            <button className="p-2 w-full button-primary">{t("submit")}</button>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default ChartForm;
