import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import ChartForm from "~/components/ChartForm.tsx";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "upload");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
};

export const handle = {
  i18n: "upload",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

function UploadChart() {
  const { t } = useTranslation("upload");
  const [params] = useSearchParams();
  return (
    <>
      <h1 className="page-title">{t("title")}</h1>

      <ChartForm
        isEdit={false}
        variantOf={params.get("variantOf") || undefined}
      />
    </>
  );
}
export default requireLogin(UploadChart);
