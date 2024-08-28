import {
  DocumentRegular,
  ImageRegular,
  InfoRegular,
  MusicNote2Regular,
} from "@fluentui/react-icons";
import { Link, useNavigate } from "@remix-run/react";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { WithContext as ReactTags } from "react-tag-input";
import {
  useServerSettings,
  useSession,
  useSetServerError,
} from "~/lib/contexts";
import type { AdminOnlyUserData, Chart } from "~/lib/types.ts";
import { isAdmin } from "~/lib/utils.ts";
import Checkbox from "./Checkbox.tsx";
import DisablePortal from "./DisablePortal.tsx";
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
      adminOnlyAuthorData: AdminOnlyUserData | undefined;
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

  const setServerError = useSetServerError();

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
        ? [adminOnlyAuthorData, ...adminOnlyAuthorData.altUsers]
        : [session.user, ...session.altUsers],
    [session, adminOnlyAuthorData],
  );

  const authorName = useMemo(
    () => selectableUsers.find((u) => u.handle === authorHandle)?.name ?? "",

    [authorHandle, selectableUsers],
  );

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

  const [isSubmitting, setIsSubmitting] = useState(false);
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

    const formData = new FormData();
    const scheduledAtField = scheduledAt.current;
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
  ]);
  const handleResponse = useCallback(
    async (res: Response) => {
      try {
        if (res.status === 500) {
          setServerError(new Error("/api/charts returned 500"));
          return;
        } else if (res.status === 413) {
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
    [setServerError, mapErrors, navigate],
  );
  const submitChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }

    setIsSubmitting(true);
    fetch("/api/charts", {
      method: "POST",
      body: formData,
    }).then(async (res) => {
      const data = await handleResponse(res);
      if (!data) {
        return;
      }
      navigate(`/charts/${data.chart.name}`);
    });
  }, [createFormData, handleResponse, navigate]);

  const updateChart = useCallback(() => {
    const formData = createFormData();
    if (!formData) {
      return;
    }

    setIsSubmitting(true);
    fetch(
      pathcat("/api/charts/:name", {
        name: chartName,
      }),
      {
        method: "PUT",
        body: formData,
      },
    ).then(async (res) => {
      const data = await handleResponse(res);
      if (!data) {
        return;
      }
      navigate(`/charts/${data.chart.name}`);
    });
  }, [createFormData, handleResponse, chartName, navigate]);

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

      fetch(pathcat("/api/charts/:name", { name: chartName }), {
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
  }, [navigate, chartName, handleResponse, createFormData]);
  const unpublishChart = useCallback(() => {
    setIsSubmitting(true);
    const formData = createFormData();
    if (!formData) {
      return;
    }
    fetch(pathcat("/api/charts/:name", { name: chartName }), {
      method: "PUT",
      body: formData,
    }).then(async (res) => {
      if (res.status === 500) {
        setServerError(new Error(`PUT /api/charts/${chartName} returned 500`));
        setIsSubmitting(false);
        return;
      } else if (res.status === 413) {
        setShowFileSizeError(true);
        setIsSubmitting(false);
        return;
      }
      const data = (await res.json()) as {
        code: string;
        chart: Chart;
        errors: Partial<Record<keyof FormData, string>>;
      };
      if (data.code !== "ok") {
        setErrors(data.errors);

        setIsSubmitting(false);
        return;
      }
      navigate(`/charts/${data.chart.name}`);
    });
  }, [navigate, chartName, createFormData, setServerError]);

  const [unUploadedFiles, setUnUploadedFiles] = useState<File[]>([]);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;

    const unUploaded: File[] = [];
    for (const file of Array.from(files)) {
      let field: string;
      if (["usc"].includes(file.name.split(".").pop()!)) {
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

  const canPost = !serverSettings.discordEnabled || !!session.discord;

  return (
    <form
      className="flex flex-col gap-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <DisablePortal isShown={isSubmitting} />
      <ModalPortal
        isOpen={unUploadedFiles.length > 0}
        close={() => setUnUploadedFiles([])}
      >
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

      <ModalPortal
        isOpen={showFileSizeError}
        close={() => setShowFileSizeError(false)}
      >
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
            className="px-4 py-2 rounded text-sm bg-theme text-white cursor-pointer"
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
        <p className="text-sm text-gray-500 text-normal mt-1">
          <Trans
            i18nKey="upload:publishModal.description2"
            components={[
              <Link
                to={`https://cc-wiki.sevenc7c.com/${i18n.language}/guideline`}
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

      <p className="mb-4">
        <budoux-ja>
          <Trans
            i18nKey="upload:description"
            components={[
              <Link
                to={`https://cc-wiki.sevenc7c.com/${i18n.language}/guideline`}
                target="_blank"
                key="0"
              />,
            ]}
          />
          {serverSettings.discordEnabled && (
            <>
              <br />
              <br />
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
              <Link
                to={`https://cc-wiki.sevenc7c.com/${
                  i18n.language
                }/publishing-chart`}
                target="_blank"
                className="ml-2"
              >
                {t("discordInfo.connectGuide")}
              </Link>
            </>
          )}
        </budoux-ja>
      </p>

      <div className="relative">
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
            <InputTitle text={t("param.artist")} optional error={errors.artist}>
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
                defaultValue={defaultAuthorHandle}
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
            <InputTitle
              text={t("param.tags")}
              tooltip={t("tooltip.tags")}
              error={errors.tags}
            >
              <div
                className="flex flex-col gap-2 tag-input"
                data-reached-max={tags.length >= 5}
              >
                <ReactTags
                  tags={tags.map((tag) => ({
                    className: "",
                    text: tag.text,
                    id: tag.id,
                  }))}
                  allowDragDrop={false}
                  placeholder=""
                  separators={[" ", ","]}
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
              className={clsx(
                "p-2 w-full",
                button.isDanger
                  ? "button-danger"
                  : button.isPrimary
                    ? "button-primary"
                    : "button-secondary",
              )}
              onClick={button.onClick}
            >
              {button.text}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};

export default ChartForm;
