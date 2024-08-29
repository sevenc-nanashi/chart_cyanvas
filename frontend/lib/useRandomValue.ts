import { useId } from "react";
import shajs from "sha.js";

export const useRandomValue = () => {
  const id = useId();
  return (...extras: unknown[]) => {
    const hex = shajs("sha256")
      .update([id, ...extras].map((e) => JSON.stringify(e)).join())
      .digest("hex");
    const part = hex.slice(0, 8);
    return Number.parseInt(part, 16) / 0x100000000;
  };
};
