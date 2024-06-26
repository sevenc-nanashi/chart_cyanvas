import { useState, useRef, useEffect, useCallback } from "react"
import urlcat from "urlcat"

type LoginState = { uuid: string; url: URL }
export const useLogin = ({
  onLoginSuccess,
}: { onLoginSuccess?: () => void } = {}) => {
  const [loginState, setLoginState] = useState<LoginState | undefined>()
  const loginUuid = useRef<string | undefined>()
  useEffect(() => {
    if (loginState) {
      loginUuid.current = loginState.uuid
    }
  }, [loginState])
  const loginInterval = useRef<number | undefined>()
  const checkLogin = useCallback(() => {
    fetch(urlcat("/api/login/status", { uuid: loginUuid.current }), {
      method: "GET",
    })
      .then((res) => res.json())
      .then((state: { code: string }) => {
        if (state.code === "ok") {
          if (onLoginSuccess) {
            onLoginSuccess()
          } else {
            window.location.reload()
          }
        }
      })
  }, [onLoginSuccess])
  const startLogin = useCallback(() => {
    fetch("/api/login/start", { method: "POST" })
      .then((res) => res.json())
      .then((state: { uuid: string; url: string }) => {
        setLoginState({ uuid: state.uuid, url: new URL(state.url) })
        loginInterval.current = setInterval(
          checkLogin,
          2500
        ) as unknown as number
        window.open(state.url, "_blank")
      })
  }, [setLoginState, checkLogin])
  const cancelLogin = useCallback(() => {
    setLoginState(undefined)
    clearInterval(loginInterval.current)
  }, [])

  return { loginState, startLogin, cancelLogin }
}
