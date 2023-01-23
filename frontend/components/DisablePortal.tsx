import { className } from "lib/utils"
import { createPortal } from "react-dom"

const DisablePortal: React.FC<{ isShown: boolean }> = ({ isShown }) => {
  return createPortal(
    <div
      className={className(
        "fixed inset-0 z-[100] bg-white bg-opacity-50 transition-opacity duration-200"
      )}
      style={{
        pointerEvents: isShown ? "auto" : "none",
        opacity: isShown ? 1 : 0,
      }}
    />,
    document.getElementById("__next")!
  )
}

export default DisablePortal
