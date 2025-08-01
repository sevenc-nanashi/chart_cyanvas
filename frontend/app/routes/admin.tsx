import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { LoaderFunctionArgs } from "react-router";
import { Link, type MetaFunction, useNavigate } from "react-router";
import { useMyFetch } from "~/lib/contexts";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import requireLogin from "~/lib/requireLogin.tsx";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const locale = await detectLocale(request);
  const rootT = await i18n.getFixedT(locale, "root");
  const t = await i18n.getFixedT(locale, "admin");

  const title = `${t("title")} | ${rootT("name")}`;

  return { locale, title };
};

export const handle = {
  i18n: "admin",
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data!.title,
    },
  ];
};

const Admin = () => {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const myFetch = useMyFetch();

  const fetchDbStat = useCallback(() => {
    myFetch("/api/admin/db-stat").then(async (res) => {
      const json = await res.json();
      if (json.code === "forbidden") {
        navigate("/");
      }

      setDbStat(json.data);
    });
  }, [navigate, myFetch]);
  const fetchItemStat = useCallback(() => {
    myFetch("/api/admin/item-stat").then(async (res) => {
      const json = await res.json();
      if (json.code === "forbidden") {
        navigate("/");
      }

      setItemStat(json.data);
    });
  }, [navigate, myFetch]);
  useEffect(() => {
    fetchDbStat();
    fetchItemStat();
    const interval = setInterval(() => {
      fetchDbStat();
      fetchItemStat();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchDbStat, fetchItemStat]);

  const [itemStat, setItemStat] = useState<{
    charts: {
      public: number;
      private: number;
    };

    users: {
      original: number;
      alt: number;
      discord: number;
    };
    files: Record<string, number>;
  } | null>(null);
  const [dbStat, setDbStat] = useState<{
    size: number;
    connections: number;
    busy: number;
    dead: number;
    idle: number;
    waiting: number;
    checkout_timeout: number;
  } | null>(null);

  const card = "bg-slate-100 dark:bg-slate-900 rounded-md p-4";
  const statCard = clsx(card, "w-full md:w-80");
  const actionCard = clsx(card, "w-full");

  return (
    <>
      <div>
        <h1 className="page-title">{t("title")}</h1>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.users.title")}</h2>
            {itemStat ? (
              <>
                <p className="text-4xl font-bold">
                  {itemStat.users.original + itemStat.users.alt}
                </p>
                <div className="flex flex-col">
                  <div className="flex">
                    <p className="flex-1">{t("stats.users.original")}</p>
                    <p className="flex-1 text-right">
                      {itemStat.users.original}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="flex-1">{t("stats.users.alt")}</p>
                    <p className="flex-1 text-right">{itemStat.users.alt}</p>
                  </div>
                  <div className="flex">
                    <p className="flex-1">{t("stats.users.discord")}</p>
                    <p className="flex-1 text-right">
                      {itemStat.users.discord}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p>...</p>
            )}
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.charts.title")}</h2>
            {itemStat ? (
              <>
                <p className="text-4xl font-bold">
                  {itemStat.charts.public + itemStat.charts.private}
                </p>
                <div className="flex flex-col">
                  <div className="flex">
                    <p className="flex-1">{t("stats.charts.public")}</p>
                    <p className="flex-1 text-right">
                      {itemStat.charts.public}
                    </p>
                  </div>
                  <div className="flex">
                    <p className="flex-1">{t("stats.charts.private")}</p>
                    <p className="flex-1 text-right">
                      {itemStat.charts.private}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p>...</p>
            )}
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.files")}</h2>
            {itemStat ? (
              <>
                <p className="text-4xl font-bold">
                  {[...Object.values(itemStat.files)].reduce(
                    (a, b) => a + b,
                    0,
                  )}
                </p>
                <div className="flex flex-col">
                  {Object.entries(itemStat.files).map(([key, value]) => (
                    <div key={key} className="flex">
                      <p className="flex-1">{key}</p>
                      <p className="flex-1 text-right">{value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>...</p>
            )}
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("stats.db.title")}</h2>
            {dbStat ? (
              <div className="flex flex-col">
                <p className="flex-1">{t("stats.db.connections", dbStat)}</p>
              </div>
            ) : (
              <p>...</p>
            )}
          </div>
          <div className={statCard}>
            <h2 className="text-xl font-bold">{t("sidekiq.title")}</h2>
            <p className="text-md">
              <Link to="/admin/sidekiq" target="_blank">
                {t("sidekiq.description")}
              </Link>
            </p>
          </div>
        </div>
        <h2 className="text-xl font-bold mt-4">{t("actions.title")}</h2>
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
          <div className={actionCard}>
            <h3 className="text-md font-bold">
              {t("actions.expireData.title")}
            </h3>
            <p>{t("actions.expireData.description")}</p>
            <div
              className="button-primary mt-2 p-2"
              onClick={async () => {
                const {
                  data: { count },
                } = await fetch("/api/admin/expire-data", {
                  method: "POST",
                }).then((res) => res.json());
                alert(t("actions.expireData.success", { count }));
              }}
            >
              {t("actions.expireData.button")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default requireLogin(Admin);
