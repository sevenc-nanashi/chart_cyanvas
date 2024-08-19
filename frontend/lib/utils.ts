import type {Chart, Session} from "./types"

export const getRatingColor = (difficulty: number) => {
  if (difficulty < 9) return "bg-green-500 dark:bg-green-400"
  if (difficulty < 15) return "bg-blue-400"
  if (difficulty < 20) return "bg-yellow-500 dark:bg-yellow-400"
  if (difficulty < 28) return "bg-red-400"
  if (difficulty < 40) return "bg-purple-400"
  return "bg-slate-800"
}

export const randomize = (base: number, seed: number) => {
  let result = base
  for (let i = 0; i < seed; i++) {
    result = Math.sin(result * 10) / 2 + 0.5
  }
  return base
}

export const className = (
  ...classes: (string | undefined | null | boolean)[]
) => {
  return classes.filter((c) => typeof c === "string" && c).join(" ")
}

export const isMine = (session: Session, chart: Chart) => {
  if (!session.loggedIn) return false
  return [
    session.user.handle,
    ...session.altUsers.map((u) => u.handle),
  ].includes(chart.author.handle)
}

export const isAdmin = (session: Session) => {
  if (!session.loggedIn) return false
  return session.user.handle === publicRuntimeConfig.adminHandle
}

export const parseIntPlus = (base: string) => {
  return Number.parseInt(
    base.replace(/[０-９]/g, (s) =>
      String.fromCharCode(
        s.charCodeAt(0) - "０".charCodeAt(0) + "0".charCodeAt(0),
      ),
    ),
  )
}

export const parseIntOrFallback = (base: string, fallback: number) => {
  const retvar = parseIntPlus(base)
  if (Number.isNaN(retvar)) return fallback
  return retvar
}

export const isDiscordEnabled = () => {
  return !!publicRuntimeConfig.discordEnabled
}
