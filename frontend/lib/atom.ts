import { atom, useAtom } from "jotai"

export const sessionAtom = atom<Session>({ loggedIn: undefined })
export const useSession = () => useAtom(sessionAtom)

export const chartDataAtom = atom<Chart>(null as unknown as Chart)

export const serverErrorAtom = atom(false)
export const useServerError = () => useAtom(serverErrorAtom)[1]
