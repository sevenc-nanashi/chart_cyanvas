require("dotenv").config({ path: "../.env" })
const nextTranslate = require("next-translate-plugin")
const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
  reactStrictMode: true,
  staticPageGenerationTimeout: 3600,
  sentry: {
    hideSourceMaps: true,
  },
  webpack: function (config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: "js-yaml-loader",
    })
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    })
    return config
  },
  serverRuntimeConfig: {
    backendHost: process.env.HOSTS_BACKEND || "http://backend:3000",
  },
  publicRuntimeConfig: {
    host: process.env.HOST,
    adminHandle: process.env.ADMIN_HANDLE,
    sentryDsnFrontend: process.env.SENTRY_DSN_FRONTEND,
    sentryTraceSampleRate: parseFloat(
      process.env.SENTRY_TRACE_SAMPLE_RATE || "0.1"
    ),
    discordEnabled: !!process.env.DISCORD_CLIENT_ID,
  },

  async rewrites() {
    if (!process.env.HOSTS_BACKEND) {
      return []
    }
    return [
      {
        source: String.raw`/api/:path((?!next).*)`,
        destination: `${process.env.HOSTS_BACKEND}/api/:path*`,
      },
      ...["sonolus", "test", "assets", "rails", "admin/sidekiq"].map((dir) => ({
        source: String.raw`/${dir}/:path*`,
        destination: `${process.env.HOSTS_BACKEND}/${dir}/:path*`,
      })),
    ]
  },
  async redirects() {
    return [
      {
        source: String.raw`/levels/chcy-:name`,
        destination: String.raw`/charts/:name`,
        permanent: true,
      },
    ]
  },
  images: {
    domains: [
      process.env.HOSTS_BACKEND && new URL(process.env.HOSTS_BACKEND).hostname,
      process.env.S3_PUBLIC_ROOT &&
        new URL(process.env.S3_PUBLIC_ROOT).hostname,
    ].filter(Boolean),
  },
})

if (process.env.SENTRY_ORG) {
  module.exports = withSentryConfig(nextConfig, {
    silent: true,

    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT_FRONTEND,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  })
} else {
  module.exports = nextConfig
}
