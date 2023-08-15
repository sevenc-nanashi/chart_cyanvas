import * as Sentry from "@sentry/nextjs"

if (process.env.SENTRY_DSN_FRONTEND) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_FRONTEND,
  })
}
