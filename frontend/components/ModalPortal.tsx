import { createPortal } from "react-dom"

const ModalPortal: React.FC<{
  children: React.ReactNode
  isOpen: boolean
}> = ({ children, isOpen }) => {
  if (typeof window === "undefined" || !isOpen) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4">
        {children}
      </div>
    </div>,
    document.getElementById("__next")!
  )
}

export default ModalPortal
