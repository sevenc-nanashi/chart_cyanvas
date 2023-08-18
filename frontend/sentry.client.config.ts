import * as Sentry from "@sentry/nextjs"
import getConfig from "next/config"

const { publicRuntimeConfig } = getConfig()

if (publicRuntimeConfig.sentryDsnFrontend) {
  Sentry.init({
    dsn: publicRuntimeConfig.sentryDsnFrontend,
    integrations: [new Sentry.Replay()],

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  })
}
