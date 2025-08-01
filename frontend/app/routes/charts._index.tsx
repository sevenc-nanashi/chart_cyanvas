import { ChevronDownFilled, ChevronUpFilled } from "@fluentui/react-icons";
import * as RadixCollapsible from "@radix-ui/react-collapsible";
import clsx from "clsx";
import { pathcat } from "pathcat";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import { type MetaFunction, useSearchParams } from "react-router";
import { WithContext as ReactTags } from "react-tag-input";
import ChartList from "~/components/ChartList.tsx";
import Checkbox from "~/components/Checkbox";
import InputTitle from "~/components/InputTitle.tsx";
import NumberInput from "~/components/NumberInput.tsx";
import RangeInput from "~/components/RangeInput";
import Select from "~/components/Select.tsx";
import TextInput from "~/components/TextInput.tsx";
import { useMyFetch, useServerSettings } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "searchCharts");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
};

export const handle = {
  i18n: "searchCharts",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

const sorts = ["publishedAt", "updatedAt", "likes"] as const;
type Sort = (typeof sorts)[number];

const Search = () => {
  const [params, setParams] = useSearchParams();
  const { t: rootT } = useTranslation("root");
  const { t } = useTranslation("searchCharts");
  const { t: errorT } = useTranslation("errors");

  const [searchCount, setSearchCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mapErrors = useCallback(
    (e: Record<string, string>): Record<string, string> => {
      return Object.fromEntries(
        Object.entries(e).map(([k, v]) => [k, errorT(v)]),
      );
    },
    [errorT],
  );

  const myFetch = useMyFetch();
  const serverSettings = useServerSettings();
  const form = useForm<{
    title: string;
    composer: string;
    artist: string;
    authorName: string;
    authorHandles: string[];
    genres: string[];
    tags: string[];
    ratingMin: number;
    ratingMax: number;
    sort: Sort;
  }>({
    defaultValues: {
      title: params.get("title") || "",
      composer: params.get("composer") || "",
      artist: params.get("artist") || "",
      authorName: params.get("authorName") || "",
      authorHandles: params.get("authorHandles")?.split(/[, ]/) || [],
      genres: params.get("genres")?.split(/[, ]/) || serverSettings.genres,
      tags: params.get("tags")?.split(/[, ]/) || [],
      ratingMin: Number.parseInt(params.get("ratingMin") || "1"),
      ratingMax: Number.parseInt(params.get("ratingMax") || "99"),
      sort: sorts.includes(params.get("sort") as Sort)
        ? (params.get("sort") as Sort)
        : "publishedAt",
    },
  });

  const search = useCallback(() => {
    const {
      title,
      composer,
      artist,
      ratingMin,
      ratingMax,
      authorName,
      authorHandles,
      genres,
      tags,
      sort,
    } = form.getValues();
    const allGenreSelected =
      genres.length === serverSettings.genres.length &&
      serverSettings.genres.every((g) => genres.includes(g));
    const newParams = {
      title: title || undefined,
      composer: composer || undefined,
      artist: artist || undefined,
      ratingMin: ratingMin === 1 ? undefined : ratingMin.toString(),
      ratingMax: ratingMax === 99 ? undefined : ratingMax.toString(),
      authorName: authorName || undefined,
      authorHandles: authorHandles.join(" ") || undefined,
      genres: allGenreSelected ? undefined : genres.join(" ") || undefined,
      tags: tags.join(" ") || undefined,
      sort: sort || undefined,
    };

    setCurrentQuery(buildCurrentQuery());
    setParams(
      Object.entries(newParams).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    );
    setErrors({});
    setSearchCount((c) => c + 1);
  }, [form, setParams, serverSettings.genres]);

  const fetchCharts = useCallback(
    async (page: number) => {
      const res = await myFetch(
        pathcat(
          "/api/charts",
          Object.fromEntries(
            Object.entries({
              count: 20,
              offset: page * 20,
              title: form.watch("title"),
              composer: form.watch("composer"),
              artist: form.watch("artist"),
              authorName: form.watch("authorName"),
              authorHandles: form.watch("authorHandles").join(" "),
              genres: form.watch("genres").join(" "),
              tags: form.watch("tags").join(" "),
              ratingMin: form.watch("ratingMin"),
              ratingMax: form.watch("ratingMax"),
              sort: form.watch("sort"),
            }).filter(([, v]) => v !== ""),
          ),
        ),
      );
      const data = await res.json();
      if (data.code === "ok") {
        return { charts: data.charts, totalPages: Math.ceil(data.total / 20) };
      } else {
        setErrors(mapErrors(data.errors));

        return { charts: [], totalPages: 0 };
      }
    },
    [myFetch, form, mapErrors],
  );

  const buildCurrentQuery = useCallback(() => {
    const params = form.getValues();

    const mappedParams: Record<string, string> = {};
    if (params.title) {
      mappedParams[t("param.title")] = params.title;
    }
    if (params.composer) {
      mappedParams[t("param.composer")] = params.composer;
    }
    if (params.artist) {
      mappedParams[t("param.artist")] = params.artist;
    }
    if (params.authorName) {
      mappedParams[t("param.authorName")] = params.authorName;
    }
    if (params.authorHandles.length > 0) {
      mappedParams[t("param.authorHandles")] = params.authorHandles.join(
        rootT("separator"),
      );
    }
    if (params.genres.length > 0) {
      if (params.genres.length === serverSettings.genres.length) {
        mappedParams[t("param.genres")] = rootT("all");
      } else {
        mappedParams[t("param.genres")] = params.genres
          .map((g) => rootT(`genre.${g}`))
          .join(rootT("separator"));
      }
    }
    if (params.tags.length > 0) {
      mappedParams[t("param.tags")] = params.tags.join(rootT("separator"));
    }
    if (params.ratingMin !== 1 || params.ratingMax !== 99) {
      mappedParams[t("param.rating")] =
        `${params.ratingMin} - ${params.ratingMax}`;
    }
    mappedParams[t("param.sort")] = t(`sort.${params.sort}`);

    return Object.entries(mappedParams)
      .map(([key, value]) => rootT("kv", { key, value }))
      .join(rootT("separator"));
  }, [form, t, rootT, serverSettings]);
  const [currentQuery, setCurrentQuery] = useState(buildCurrentQuery);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <div className="card">
          <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
            <RadixCollapsible.Trigger className="flex max-sm:justify-between items-center w-full p-2 cursor-pointer">
              <h2 className="font-bold text-lg mr-2">{t("queries")}</h2>
              {open ? <ChevronUpFilled /> : <ChevronDownFilled />}
              <div className="ml-4 h-6 contain-strict flex-grow overflow-ellipsis overflow-hidden whitespace-nowrap text-right break-keep">
                {currentQuery}
              </div>
            </RadixCollapsible.Trigger>
            <RadixCollapsible.Content className="flex flex-col gap-2">
              <div className="mt-2 border-t-2 border-slate-300 dark:border-slate-700" />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  search();
                }}
              >
                <div className="flex flex-col xl:grid xl:grid-cols-2 xl:gap-4 gap-2">
                  <div className="flex flex-col xl:flex-grow gap-2">
                    <InputTitle text={t("param.title")} error={errors.title}>
                      <TextInput
                        name="title"
                        className="w-full"
                        value={form.watch("title")}
                        onChange={(v) => form.setValue("title", v)}
                      />
                    </InputTitle>
                    <InputTitle
                      text={t("param.composer")}
                      error={errors.composer}
                    >
                      <TextInput
                        name="composer"
                        className="w-full"
                        value={form.watch("composer")}
                        onChange={(v) => form.setValue("composer", v)}
                      />
                    </InputTitle>
                    <InputTitle text={t("param.artist")} error={errors.artist}>
                      <TextInput
                        name="artist"
                        className="w-full"
                        value={form.watch("artist")}
                        onChange={(v) => form.setValue("artist", v)}
                      />
                    </InputTitle>
                    <InputTitle
                      text={t("param.rating")}
                      tooltip={t("description.rating")}
                      error={errors.rating}
                      className="flex gap-4 items-center"
                    >
                      <NumberInput
                        className="w-16"
                        name="rating"
                        min={1}
                        max={99}
                        value={form.watch("ratingMin")}
                        onChange={(value) => form.setValue("ratingMin", value)}
                      />

                      <div className="flex-grow">
                        <RangeInput
                          name="rating"
                          dual
                          min={1}
                          max={40}
                          step={1}
                          value={[
                            form.watch("ratingMin"),
                            form.watch("ratingMax"),
                          ]}
                          onChange={(values) => {
                            form.setValue("ratingMin", values[0]);
                            form.setValue("ratingMax", values[1]);
                          }}
                        />
                      </div>
                      <NumberInput
                        name="rating"
                        className="w-16"
                        min={1}
                        max={99}
                        value={form.watch("ratingMax")}
                        onChange={(value) => form.setValue("ratingMax", value)}
                      />
                    </InputTitle>
                  </div>

                  <div className="flex flex-col xl:flex-grow gap-2">
                    <InputTitle text={t("param.genres")} error={errors.genres}>
                      <div className="flex flex-wrap gap-2">
                        {serverSettings.genres.map((genre) => (
                          <Checkbox
                            key={genre}
                            name="genres"
                            checked={form.watch("genres").includes(genre)}
                            onChange={(checked) => {
                              if (checked) {
                                form.setValue("genres", [
                                  ...form.getValues("genres"),
                                  genre,
                                ]);
                              } else {
                                form.setValue(
                                  "genres",
                                  form
                                    .getValues("genres")
                                    .filter((g) => g !== genre),
                                );
                              }
                            }}
                          >
                            {rootT(`genre.${genre}`)}
                          </Checkbox>
                        ))}
                      </div>
                    </InputTitle>
                    <InputTitle text={t("param.tags")} error={errors.tags}>
                      <div
                        className={clsx(
                          "flex flex-col gap-2 tag-input",
                          form.watch("tags").length >= 5 &&
                            "[&_.ReactTags__tagInput]_hidden",
                        )}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <ReactTags
                          tags={form.watch("tags").map((handle) => ({
                            className: "",
                            text: handle,
                            id: handle,
                          }))}
                          allowDragDrop={false}
                          placeholder=""
                          separators={[" ", ",", "\n"]}
                          handleDelete={(i) => {
                            form.setValue(
                              "tags",
                              form.getValues("tags").filter((_, j) => i !== j),
                            );
                          }}
                          handleAddition={(tag) => {
                            if (form.getValues("tags").length >= 5) {
                              return;
                            }
                            form.setValue("tags", [
                              ...form.getValues("tags"),
                              tag.text,
                            ]);
                          }}
                        />
                      </div>
                    </InputTitle>
                    <InputTitle
                      text={t("param.authorName")}
                      error={errors.authorName}
                    >
                      <TextInput
                        name="authorName"
                        className="w-full"
                        value={form.watch("authorName")}
                        onChange={(v) => form.setValue("authorName", v)}
                      />
                    </InputTitle>
                    <InputTitle
                      text={t("param.authorHandles")}
                      tooltip={t("description.authorHandles")}
                      error={errors.authorHandles}
                    >
                      <div
                        className="flex flex-col gap-2 tag-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <ReactTags
                          tags={form.watch("authorHandles").map((handle) => ({
                            className: "",
                            text: handle,
                            id: handle,
                          }))}
                          allowDragDrop={false}
                          placeholder=""
                          separators={[" ", ",", "\n"]}
                          handleDelete={(i) => {
                            form.setValue(
                              "authorHandles",
                              form
                                .getValues("authorHandles")
                                .filter((_, j) => i !== j),
                            );
                          }}
                          handleAddition={(tag) => {
                            form.setValue("authorHandles", [
                              ...form.getValues("authorHandles"),
                              tag.text,
                            ]);
                          }}
                        />
                      </div>
                    </InputTitle>
                    <InputTitle text={t("param.sort")} error={errors.sort}>
                      <Select
                        className="w-full"
                        value={form.watch("sort")}
                        onChange={(value) =>
                          form.setValue("sort", value as Sort)
                        }
                        items={sorts.map((sort) => ({
                          type: "item" as const,
                          value: sort,
                          label: t(`sort.${sort}`),
                        }))}
                      >
                        {t(`sort.${form.watch("sort")}`)}
                      </Select>
                    </InputTitle>
                  </div>
                </div>
                <div className="mt-4 border-t-2 border-slate-300 dark:border-slate-700" />
                <div className="mt-4">
                  <button type="submit" className="p-2 w-full button-primary">
                    {t("search")}
                  </button>
                </div>
              </form>
            </RadixCollapsible.Content>
          </RadixCollapsible.Root>
        </div>
        <div className="h-4" />
        <ChartList
          key={searchCount}
          fetchCharts={fetchCharts}
          pagination
          onEmpty={() => <div className="text-center">{t("empty")}</div>}
        />
      </div>
    </div>
  );
};

export default Search;
