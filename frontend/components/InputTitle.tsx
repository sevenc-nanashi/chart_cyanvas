import { InfoRegular } from "@fluentui/react-icons";
import { clsx } from "clsx";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Tooltip from "./Tooltip.tsx";

const InputTitle = (props: {
  text: string;
  optional?: boolean;
  tooltip?: string | undefined;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
  error?: string;
}) => {
  const { t } = useTranslation("upload");
  return (
    <div className={clsx("mt-2", props.containerClassName)}>
      <h3 className="text-lg font-bold">
        {props.text}
        {props.optional && t("optional")}
        {props.tooltip && (
          <Tooltip text={props.tooltip}>
            <InfoRegular className="ml-1 cursor-help" />
          </Tooltip>
        )}
        {props.error && (
          <span className="ml-4 font-sans text-sm text-red-500">
            {props.error}
          </span>
        )}
      </h3>

      <div className={clsx("w-full", props.className)}>{props.children}</div>
    </div>
  );
};

export default InputTitle;
