import NextDocument, { Html, Head, Main, NextScript } from "next/document"

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link rel="apple-touch-icon" href="/favicon.svg" />
          <link rel="shortcut icon" href="/favicon.svg" />
          <link rel="favicon" href="/favicon.svg" />
          <meta name="theme-color" content="#83ccd2" />
          {/* Cloudflare Web Analytics */}
          <script
             defer
             src="https://static.cloudflareinsights.com/beacon.min.js"
             data-cf-beacon='{"token": "5d4e8a97143447a293a04ba13358db27"}'
          />
          {/* End Cloudflare Web Analytics */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
