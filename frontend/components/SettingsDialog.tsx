import { useTranslation } from "react-i18next";
import { languageNames } from "~/lib/translations.ts";
import InputTitle from "./InputTitle.tsx";
import Select, { type SelectItems } from "./Select.tsx";
import { useEffect, useState } from "react";
import cookies from "cookie";

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
      label: t("langAuto"),
    },
    ...Object.entries(languageNames).map(([lang, languageName]) => ({
      type: "item" as const,
      value: lang,
      label: languageName,
    })),
  ] satisfies SelectItems;
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("auto");
  useEffect(() => {
    const lang = cookies.parse(document.cookie).locale;
    if (lang && lang in languageNames) {
      setSelectedLanguage(lang as Language);
    } else {
      setSelectedLanguage("auto");
    }
  }, []);

  return (
    <div className="flex flex-col w-96 gap-2">
      <h1 className="page-title">{t("title")}</h1>

      <InputTitle text={t("lang")}>
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
            ? t("langAuto")
            : languageNames[selectedLanguage]}
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
