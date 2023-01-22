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
  async rewrites() {
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
      new URL(process.env.BACKEND_HOST).hostname,
      new URL(process.env.S3_ENDPOINT).hostname,
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_HOST: process.env.BACKEND_HOST,
    NEXT_PUBLIC_S3_PUBLIC: process.env.S3_PUBLIC,
    NEXT_PUBLIC_HOST: process.env.HOST,
  },
})

module.exports = nextConfig
