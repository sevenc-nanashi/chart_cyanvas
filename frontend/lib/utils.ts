import { useTranslation } from "react-i18next";
import type { Chart, ServerSettings, Session } from "./types.ts";

// @unocss-include

export const getRatingColor = (difficulty: number) => {
  if (difficulty < 9) return "bg-green-500 dark:bg-green-400";
  if (difficulty < 15) return "bg-blue-400";
  if (difficulty < 20) return "bg-yellow-500 dark:bg-yellow-400";
  if (difficulty < 28) return "bg-red-400";
  if (difficulty < 40) return "bg-purple-400";
  return "bg-slate-800";
};

export const isMine = (session: Session | undefined, chart: Chart) => {
  if (!session?.loggedIn) return false;
  return [
    session.user.handle,
    ...session.altUsers.map((u) => u.handle),
  ].includes(chart.author.handle);
};

export const isAdmin = (session: Session | undefined) => {
  return session?.loggedIn && session.user.userType === "admin";
};

export const parseIntPlus = (base: string) => {
  return Number.parseInt(
    base.replace(/[０-９]/g, (s) =>
      String.fromCharCode(
        s.charCodeAt(0) - "０".charCodeAt(0) + "0".charCodeAt(0),
      ),
    ),
  );
};

export const parseIntOrFallback = (base: string, fallback: number) => {
  const retvar = parseIntPlus(base);
  if (Number.isNaN(retvar)) return fallback;
  return retvar;
};

export const sonolusUrl = (serverSettings: ServerSettings, path: string) => {
  const host = new URL(serverSettings.host);
  const ret = new URL("https://open.sonolus.com");
  ret.pathname = `${host.host}${host.pathname}${path}`.replace(/\/+/g, "/");

  return ret.toString();
};

export const useMergeChartTags = () => {
  const { t: rootT } = useTranslation();
  return (data: Chart) =>
    [
      (data.genre !== "others" && rootT(`genre.${data.genre}`)) || "",
      ...data.tags,
    ].filter((v) => v !== "");
};
