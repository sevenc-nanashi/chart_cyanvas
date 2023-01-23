import { useSession } from "lib/atom"
import { NextPage } from "next"
import { useRouter } from "next/router"
import { createElement } from "react"

const requireLogin = (component: NextPage) => {
  const Inner: React.FC<Record<string, unknown>> = (props) => {
    const [session] = useSession()
    const router = useRouter()
    if (session.loggedIn === undefined) return <div></div>
    if (session.loggedIn) return createElement(component, props)
    router.push("/login")
    return <div></div>
  }
  Inner.displayName = `RequireLogin(${component.displayName})`
  return Inner
}

export default requireLogin
