import requireLogin from "~/lib/requireLogin.tsx";
import ChartForm from "~/components/ChartForm.tsx";
import {
  type MetaFunction,
  json,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "upload");

  const title = `${t("title")} | ${rootT("name")}`;

  return json({ locale, title });
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
  return <ChartForm isEdit={false} />;
}
export default requireLogin(UploadChart);
