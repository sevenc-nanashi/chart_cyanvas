import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

const ModalPortal: React.FC<{
  children: React.ReactNode
  isOpen: boolean
  close?: () => void
}> = ({ children, isOpen, close }) => {
  const [hide, setHide] = useState(true)

  useEffect(() => {
    setHide(false)
  }, [])

  if (hide) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 text-normal transition-opacity duration-200"
      style={{
        pointerEvents: isOpen ? "auto" : "none",
        opacity: isOpen ? 1 : 0,
      }}
      onClick={() => {
        close?.()
      }}
    >
      {isOpen && (
        <div
          className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>,
    document.querySelector("body")!
  )
}

export default ModalPortal
