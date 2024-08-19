import {
  CheckboxCheckedFilled,
  CheckboxUncheckedRegular,
} from "@fluentui/react-icons"
import { useRef } from "react"
import { clsx } from "clsx"

const Checkbox: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    label: string
    size?: "sm" | "md"
    name?: string
  }
> = ({ label, size, checked, onChange, ...props }) => {
  const ref = useRef<HTMLInputElement>(null)

  let sizeClass: string, labelClass: string
  if (size === "sm") {
    sizeClass = "h-5 w-5"
    labelClass = "text-sm"
  } else {
    sizeClass = "h-6 w-6"
    labelClass = "text-md"
  }

  return (
    <label
      className={clsx(
        "flex text-normal gap-2",
        labelClass,
        ref.current?.disabled
          ? "cursor-not-allowed text-slate-400"
          : "cursor-pointer",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        ref={ref}
        onChange={(e) => {
          onChange?.(e)
        }}
        {...props}
        className="hidden"
        data-name={props.name}
      />
      {checked ? (
        <CheckboxCheckedFilled className={clsx("text-theme", sizeClass)} />
      ) : (
        <CheckboxUncheckedRegular
          className={clsx("text-slate-500", sizeClass)}
        />
      )}
      {label}
    </label>
  )
}

export default Checkbox
