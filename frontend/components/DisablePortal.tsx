import clsx from "clsx";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const DisablePortal: React.FC<{ isShown: boolean }> = ({ isShown }) => {
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized && typeof window.document !== "undefined") {
      setInitialized(true);
    }
  });
  if (!initialized) return null;
  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[100] bg-white bg-opacity-50 transition-opacity duration-500",
      )}
      style={{
        pointerEvents: isShown ? "auto" : "none",
        opacity: isShown ? 1 : 0,
      }}
    />,
    document.body,
  );
};

export default DisablePortal;
