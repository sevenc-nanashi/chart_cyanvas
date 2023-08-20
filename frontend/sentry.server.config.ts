import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN_FRONTEND) {
  const tracesSampleRate = parseFloat(
    process.env.SENTRY_TRACE_SAMPLE_RATE || "0.1"
  )
  Sentry.init({
    dsn: process.env.SENTRY_DSN_FRONTEND,

    tracesSampleRate,
  })
}
