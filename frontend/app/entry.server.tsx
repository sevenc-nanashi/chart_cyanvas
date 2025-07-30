import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { detectLocale, i18n } from "~/lib/i18n.server.ts";
import { enTranslation, jaTranslation } from "~/lib/translations";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  const lng = await detectLocale(request);
  const ns = i18n.getRouteNamespaces(reactRouterContext);
  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";
  const instance = createInstance();

  await instance.use(initReactI18next).init({
    lng, // The locale we detected above
    ns, // The namespaces the routes about to render want to use
    resources: {
      ja: jaTranslation,
      en: enTranslation,
    },
    fallbackLng: "en",
    defaultNS: "root",
  });

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <ServerRouter context={reactRouterContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;
          reject(error);
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}
