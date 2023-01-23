import { useRef } from "react"
import { createPortal } from "react-dom"

const ModalPortal: React.FC<{
  children: React.ReactNode
  isOpen: boolean
}> = ({ children, isOpen }) => {
  const everOpened = useRef(false)

  if (isOpen) {
    everOpened.current = true
  }

  if (!everOpened.current) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-normal transition-opacity duration-200"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        opacity: isOpen ? 1 : 0,
      }}
    >
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4">
          {children}
        </div>
      )}
    </div>,
    document.getElementById("__next")!
  )
}

export default ModalPortal
