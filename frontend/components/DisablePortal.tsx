import { createPortal } from "react-dom";
import clsx from "clsx";

const DisablePortal: React.FC<{ isShown: boolean }> = ({ isShown }) => {
  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[100] bg-white bg-opacity-50 transition-opacity duration-200",
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
