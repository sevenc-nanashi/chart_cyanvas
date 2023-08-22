import { InfoRegular } from "@fluentui/react-icons"
import { className } from "lib/utils"
import useTranslation from "next-translate/useTranslation"
import { ReactNode, useState } from "react"

const InputTitle = (props: {
  text: string
  optional?: boolean
  tooltip?: string | undefined
  className?: string
  containerClassName?: string
  children: ReactNode
  error?: string
}) => {
  const { t } = useTranslation("upload")
  const [isTooltipShown, setIsTooltipShown] = useState(false)
  return (
    <div className={className("mt-2", props.containerClassName)}>
      <h3 className="text-lg font-bold">
        {props.text}
        {props.optional && t("optional")}
        {props.tooltip && (
          <div
            className="inline-block relative cursor-help"
            onMouseOver={() => setIsTooltipShown(true)}
            onMouseLeave={() => setIsTooltipShown(false)}
          >
            {isTooltipShown && (
              <div
                className={className(
                  "absolute bottom-full p-2 rounded font-sans left-[-8rem] right-[-8rem]",
                  "text-sm bg-slate-100 dark:bg-slate-700 shadow pointer-none"
                )}
              >
                {props.tooltip}
              </div>
            )}
            <InfoRegular />
          </div>
        )}
        {props.error && (
          <span className="ml-4 font-sans text-sm text-red-500">
            {props.error}
          </span>
        )}
      </h3>

      <div className={className("w-full", props.className)}>
        {props.children}
      </div>
    </div>
  )
}

export default InputTitle
