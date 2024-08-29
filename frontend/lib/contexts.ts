import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useCallback,
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
export const IsSubmittingContext = createContext<boolean>(false);

export const SetIsSubmittingContext = createContext<
  Dispatch<SetStateAction<boolean>> | undefined
>(undefined);

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

export const useMyFetch = () => {
  const setServerError = useSetServerError();
  return useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, init);
      if (res.status.toString().startsWith("5")) {
        const error = new Error(
          `Server error: ${res.status} @ ${init?.method ?? "GET"} ${url}`,
        );
        setServerError(error);
        throw error;
      }
      return res;
    },
    [setServerError],
  );
};

export const useServerSettings = () => {
  const serverSettings = useContext(ServerSettingsContext);
  if (!serverSettings) {
    throw new Error("Server settings not found");
  }
  return serverSettings;
};

export const useSetIsSubmitting = () => {
  const setIsSubmitting = useContext(SetIsSubmittingContext);
  if (!setIsSubmitting) {
    throw new Error("IsSubmitting provider not found");
  }
  return setIsSubmitting;
};

export const useIsSubmitting = () => {
  return useContext(IsSubmittingContext);
};
