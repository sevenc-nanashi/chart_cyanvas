import * as cookies from "cookie";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSetTheme, useTheme } from "~/lib/contexts.ts";
import { languageNames } from "~/lib/translations.ts";
import type { Theme } from "~/lib/types.ts";
import InputTitle from "./InputTitle.tsx";
import Select, { type SelectItems } from "./Select.tsx";

type Language = "auto" | keyof typeof languageNames;

const SettingsDialog = (props: {
  close: () => void;
}) => {
  const { t } = useTranslation("settings");
  const { t: rootT } = useTranslation("root");

  const languageOptions = [
    {
      type: "item",
      value: "auto",
      label: t("lang.auto"),
    },
    ...Object.entries(languageNames).map(([lang, languageName]) => ({
      type: "item" as const,
      value: lang as Language,
      label: languageName,
    })),
  ] satisfies SelectItems<Language>;
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("auto");
  useEffect(() => {
    const lang = cookies.parse(document.cookie).locale;
    if (lang && lang in languageNames) {
      setSelectedLanguage(lang as Language);
    } else {
      setSelectedLanguage("auto");
    }
  }, []);

  const theme = useTheme();
  const setTheme = useSetTheme();

  return (
    <div className="flex flex-col w-96 gap-2">
      <h1 className="page-title">{t("title")}</h1>

      <InputTitle text={t("lang.title")}>
        <Select
          className="w-full"
          items={languageOptions}
          value={selectedLanguage}
          onChange={(value) => {
            setSelectedLanguage(value as Language);
            document.cookie = cookies.serialize("locale", value, {
              maxAge: 60 * 60 * 24 * 365,
              sameSite: "lax",
            });
            window.location.reload();
          }}
        >
          {selectedLanguage === "auto"
            ? t("lang.auto")
            : languageNames[selectedLanguage]}
        </Select>
      </InputTitle>

      <InputTitle text={t("theme.title")}>
        <Select
          className="w-full"
          items={[
            {
              type: "item",
              value: "auto",
              label: t("theme.auto"),
            },
            {
              type: "item",
              value: "light",
              label: t("theme.light"),
            },
            {
              type: "item",
              value: "dark",
              label: t("theme.dark"),
            },
          ]}
          value={theme}
          onChange={(value) => {
            setTheme(value as Theme);
          }}
        >
          {t(`theme.${theme}`)}
        </Select>
      </InputTitle>

      <div className="flex justify-end">
        <button className="px-4 py-2 button-cancel" onClick={props.close}>
          {rootT("close")}
        </button>
      </div>
    </div>
  );
};

export default SettingsDialog;
