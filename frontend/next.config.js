require("dotenv").config({ path: "../.env" })
const nextTranslate = require("next-translate")

console.log("INFO: BACKEND_HOST =", process.env.BACKEND_HOST)

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
  reactStrictMode: true,
  staticPageGenerationTimeout: 3600,
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
    backendHost: process.env.BACKEND_HOST || "http://backend:3000",
  },
  publicRuntimeConfig: {
    host: process.env.HOST,
  },

  async rewrites() {
    if (!process.env.BACKEND_HOST) {
      return []
    }
    return [
      {
        source: String.raw`/api/:path((?!next).*)`,
        destination: `${process.env.BACKEND_HOST}/api/:path*`,
      },
      ...["auth/sonolus", "auth/assets", "sonolus", "assets", "rails"].map(
        (dir) => ({
          source: String.raw`/${dir}/:path*`,
          destination: `${process.env.BACKEND_HOST}/${dir}/:path*`,
        })
      ),
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
      process.env.BACKEND_HOST && new URL(process.env.BACKEND_HOST).hostname,
      process.env.S3_ENDPOINT && new URL(process.env.S3_ENDPOINT).hostname,
    ].filter(Boolean),
  },
})

module.exports = nextConfig
