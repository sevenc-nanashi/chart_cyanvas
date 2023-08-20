import * as Sentry from "@sentry/nextjs"
import getConfig from "next/config"

const { publicRuntimeConfig } = getConfig()

if (publicRuntimeConfig.sentryDsnFrontend) {
  const tracesSampleRate = publicRuntimeConfig.sentryTraceSampleRate
  Sentry.init({
    dsn: publicRuntimeConfig.sentryDsnFrontend,
    integrations: [new Sentry.Replay()],

    tracesSampleRate,
  })
}
