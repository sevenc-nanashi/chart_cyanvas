import { redirectDocument, type LoaderFunction } from "@remix-run/node";
import { host } from "~/lib/config.server";
import { detectLocale } from "~/lib/i18n.server.ts";

export const loader: LoaderFunction = async ({ request }) => {
  const locale = await detectLocale(request);

  const url = new URL(request.url);
  const [_beforeWiki, afterWiki] = url.pathname.split("/wiki");

  let willRecirectTo: string;
  if (afterWiki.startsWith(`${locale}/`)) {
    willRecirectTo = `/wiki${afterWiki}`;
  } else {
    willRecirectTo = `/wiki/${locale}${afterWiki}`;
  }
  return redirectDocument(`${url.protocol}//${host}${willRecirectTo}`, 301);
};
