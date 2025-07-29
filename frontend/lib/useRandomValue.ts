import Rand from "rand-seed";
import { useId } from "react";

export const useRandomValue = () => {
  const id = useId();

  return (...extras: unknown[]) => {
    const seed = [id, ...extras].map((e) => JSON.stringify(e)).join();
    const rand = new Rand(seed);
    return rand.next();
  };
};
