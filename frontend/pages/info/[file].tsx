import { NextPage } from "next"
import useTranslation from "next-translate/useTranslation"
import Head from "next/head"
import { evaluate } from "@mdx-js/mdx"
import { MDXProvider } from "@mdx-js/react"
import { useState, useEffect } from "react"
import react from "react"
import { useRouter } from "next/router"

const InfoPage: NextPage = () => {
  const router = useRouter()
  const { t } = useTranslation("pages")
  const { t: rootT } = useTranslation()
  const [compiled, setCompiled] = useState<JSX.Element | null>(null)
  const file = router.query.file as string
  useEffect(() => {
    evaluate(t(file)!, {
      Fragment: react.Fragment,
      jsx: react.createElement,
      jsxs: react.createElement,
    }).then(({ default: compiledMdx }) => setCompiled(compiledMdx({})))
  }, [file, t])

  return (
    <div className="markdown">
      <Head>
        <title>{t(file).match(/# (.*)/)?.[1] + " | " + rootT("name")}</title>
      </Head>

      <MDXProvider
        components={{
          a: (props) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {compiled}
      </MDXProvider>
    </div>
  )
}

export default InfoPage
