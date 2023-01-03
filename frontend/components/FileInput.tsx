import { Document24Regular } from "@fluentui/react-icons"
import { forwardRef, useCallback, useRef } from "react"

const FileInput = forwardRef<
  HTMLDivElement,
  { value: File | undefined } & Omit<JSX.IntrinsicElements["input"], "value">
>(function FileInput(
  { value, className, onChange, placeholder, ...props },
  ref
) {
  const fileInput = useRef<HTMLInputElement>(null)

  const clickFileInput = () => {
    setTimeout(() => {
      fileInput.current?.click()
    }, 0)
  }

  const onChangeWrapper = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
    },
    [onChange]
  )

  return (
    <>
      <div
        className={"flex cursor-pointer text-input " + className}
        ref={ref}
        onClick={clickFileInput}
      >
        <p className="text-slate-400 dark:text-slate-600 mr-2 border-r border-slate-400 dark:border-slate-600 pr-1">
          <Document24Regular />
        </p>
        {value ? value.name : <p className="text-slate-500">{placeholder}</p>}
      </div>
      <input
        type="file"
        ref={fileInput}
        className="hidden"
        onChange={onChangeWrapper}
        {...props}
      />
    </>
  )
})

export default FileInput
