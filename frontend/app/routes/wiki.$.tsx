import type { LoaderFunction } from "@remix-run/node";
import { detectLocale } from "~/lib/i18n.server.ts";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);

  const [beforeWiki, afterWiki] = request.url.split("/wiki/", 2);

  if (afterWiki.startsWith(`${locale}/`)) {
    return Response.redirect(`${beforeWiki}/wiki/${afterWiki}`, 308);
  } else {
    return Response.redirect(`${beforeWiki}/wiki/${locale}/${afterWiki}`, 308);
  }
};
