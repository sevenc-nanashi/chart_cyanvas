import { useTranslation } from "react-i18next";

export default function NotFound() {
  const [t] = useTranslation("notFound");
  return (
    <div>
      <h1>{t("heading")}</h1>
    </div>
  );
}
