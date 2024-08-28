import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
} from "react";
import type { ServerSettings, Session } from "./types.ts";

export const SessionContext = createContext<Session | undefined>(undefined);
export const SetSessionContext = createContext<
  Dispatch<SetStateAction<Session | undefined>>
>(() => {
  throw new Error("Session provider not found");
});
export const ServerSettingsContext = createContext<ServerSettings | undefined>(
  undefined,
);
export const ServerErrorContext = createContext<(error: Error) => void>(
  () => {},
);

export const useSession = () => {
  return useContext(SessionContext);
};

export const useSetSession = () => {
  const setSession = useContext(SetSessionContext);
  if (!setSession) {
    throw new Error("Session provider not found");
  }
  return setSession;
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
};
