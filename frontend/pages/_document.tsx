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
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
