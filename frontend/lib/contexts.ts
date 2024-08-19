import { createContext, useContext } from "react";
import type { Session } from "./types.ts";

export const SessionContext = createContext<Session | undefined>(undefined);

export const useSession = () => {
  return useContext(SessionContext);
};
