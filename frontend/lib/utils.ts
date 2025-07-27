import { useTranslation } from "react-i18next";
import type { Chart, ServerSettings, Session } from "./types.ts";

// @unocss-include

export const getRatingColor = (data: Chart) => {
  const override = data.tags
    .map((tag) =>
      tag.toLowerCase() in difficultyColors
        ? difficultyColors[tag.toLowerCase() as keyof typeof difficultyColors]
        : undefined,
    )
    .find((v) => v !== undefined);
  if (override) return override;
  if (data.rating < 9) return difficultyColors.easy;
  if (data.rating < 15) return difficultyColors.normal;
  if (data.rating < 20) return difficultyColors.hard;
  if (data.rating < 28) return difficultyColors.expert;
  if (data.rating < 40) return difficultyColors.master;
  return "bg-slate-800";
};
export const difficultyColors = {
  easy: "bg-green-500",
  normal: "bg-blue-400",
  hard: "bg-yellow-500",
  expert: "bg-red-400",
  master: "bg-purple-400",
  append: "bg-pink-300",
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
