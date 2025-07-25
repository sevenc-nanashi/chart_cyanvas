import {
  type LoaderFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { useBeforeUnload } from "@remix-run/react";
import { useCallback, useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { detectLocale, i18n } from "~/lib/i18n.server";
import { useLogin } from "~/lib/useLogin.ts";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "login");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
};

export const handle = {
  i18n: "login",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

const Login = () => {
  const { t } = useTranslation("login");

  const { loginState, startLogin, cancelLogin } = useLogin({
    onLoginSuccess: () => {
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("to") || "/";
    },
  });

  useBeforeUnload(useCallback(cancelLogin, []));

  const loginStarted = useRef(false);
  useEffect(() => {
    if (!loginStarted.current) {
      loginStarted.current = true;
      startLogin();
    }
  }, [startLogin]);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <p>
          <Trans
            i18nKey="menu:login.description"
            components={[
              <a key={0} href={loginState?.url.toString()} target="_blank" />,
            ]}
          />
        </p>
      </div>
    </div>
  );
};

export default Login;
