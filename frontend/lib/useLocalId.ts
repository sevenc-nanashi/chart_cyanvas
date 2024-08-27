import { useId } from "react";

export const useLocalId = (scope: string) => {
  const id = useId();
  return `chcy-${scope}-${id}`;
};
