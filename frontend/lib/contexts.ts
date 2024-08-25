import { createContext, useContext } from "react";
import type { ServerSettings, Session } from "./types.ts";

export const SessionContext = createContext<Session | undefined>(undefined);
export const ServerSettingsContext = createContext<ServerSettings | undefined>(undefined);
export const ServerErrorContext = createContext<(error: Error) => void>(
  () => {},
);

export const useSession = () => {
  return useContext(SessionContext);
};

export const useSetServerError = () => {
  const setServerError = useContext(ServerErrorContext);
  return setServerError;
};

export const useServerSettings = () => {
  const serverSettings = useContext(ServerSettingsContext);
  if (!serverSettings) {
    throw new Error("Server settings not found");
  }
  return serverSettings;
}
