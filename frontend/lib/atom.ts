import { atom, useAtom } from "jotai"

export const sessionAtom = atom<Session>(null as unknown as Session)
export const useSession = () => useAtom(sessionAtom)

export const chartDataAtom = atom<Chart>(null as unknown as Chart)
