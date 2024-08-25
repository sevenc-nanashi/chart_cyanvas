import { CheckmarkFilled } from "@fluentui/react-icons";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { useId, useRef } from "react";
import { clsx } from "clsx";

const Checkbox: React.FC<
  {
    label: string;
    size?: "sm" | "md";
    name?: string;
    disabled?: boolean;
    defaultChecked?: boolean;
  } & (
    | {
        indeterminate: true;
        checked?: RadixCheckbox.CheckedState;
        onChange: (checked: RadixCheckbox.CheckedState) => void;
      }
    | {
        indeterminate?: false;
        checked: boolean;
        onChange: (checked: boolean) => void;
      }
  )
> = ({ label, size, checked, onChange, disabled, defaultChecked }) => {
  const nonce = useId();
  const id = `chcy-checkbox-${nonce}`;

  return (
    <div
      className={clsx(
        "flex text-normal gap-2",
        size === "sm" ? "text-sm" : "text-md",
      )}
    >
      <RadixCheckbox.Root
        className={clsx(
          size === "sm" ? "w-4 h-4" : "w-6 h-6",
          checked
            ? "bg-theme border-theme"
            : "bg-background border-inputBorder",

          "border-2 rounded flex items-center justify-center",
        )}
        checked={checked}
        onCheckedChange={onChange}
        defaultChecked={defaultChecked}
        id={id}
      >
        <RadixCheckbox.Indicator
          className={clsx("inline-block", checked && "text-white")}
        >
          <CheckmarkFilled />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label
        className={clsx(
          disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer",
        )}
        htmlFor={id}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
