import type { LoaderFunction } from "@remix-run/node";
import { host } from "~/lib/config.server";
import { detectLocale } from "~/lib/i18n.server.ts";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);

  const url = new URL(request.url);
  const [_beforeWiki, afterWiki] = url.pathname.split("/wiki");

  if (afterWiki.startsWith(`${locale}/`)) {
    return Response.redirect(`${host}/wiki${afterWiki}`, 308);
  } else {
    return Response.redirect(`${host}/wiki/${locale}${afterWiki}`, 308);
  }
};
