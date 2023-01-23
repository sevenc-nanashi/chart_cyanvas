import { useSession } from "lib/atom"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { createElement } from "react"

const requireLogin = <T,>(component: NextPage<T>) => {
  const Inner: NextPage<T> = (props) => {
    const [session] = useSession()
    const router = useRouter()
    if (session.loggedIn === undefined) return <div></div>
    // @ts-expect-error createElement limitation?
    if (session.loggedIn) return createElement(component, props)
    router.push("/login")
    return <div></div>
  }
  Inner.displayName = `RequireLogin(${component.displayName})`
  return Inner
}

export default requireLogin
