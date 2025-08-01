import { CheckmarkFilled } from "@fluentui/react-icons";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { clsx } from "clsx";
import { useRef } from "react";
import { useLocalId } from "~/lib/useLocalId";

const Checkbox: React.FC<
  {
    size?: "sm" | "md";
    name?: string;
    disabled?: boolean;
    defaultChecked?: boolean;
    className?: string;
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
  ) &
    (
      | {
          label: string;
        }
      | {
          children: React.ReactNode;
        }
    )
> = (props) => {
  const {
    label,
    children,
    size,
    checked,
    onChange,
    disabled,
    defaultChecked,
    className,
  } = {
    label: undefined,
    children: undefined,
    ...props,
  };
  const id = useLocalId("checkbox");
  const checkboxRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={clsx(
        "flex items-center text-normal gap-2",
        size === "sm" ? "text-sm" : "text-md",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      onClick={(e) => {
        if (disabled) {
          e.stopPropagation();
        }
        if (e.target === e.currentTarget) {
          if (!disabled) {
            checkboxRef.current?.click();
          }
        }
      }}
    >
      <RadixCheckbox.Root
        ref={checkboxRef}
        className={clsx(
          size === "sm" ? "w-4 h-4" : "w-6 h-6",
          checked
            ? "bg-theme border-theme"
            : "bg-background border-input-border",

          "border-2 rounded flex items-center justify-center",
        )}
        checked={checked}
        onCheckedChange={(newChecked) => {
          if (!disabled) {
            onChange(newChecked as boolean);
          }
        }}
        defaultChecked={defaultChecked}
        id={id}
      >
        <RadixCheckbox.Indicator
          className={clsx("grid place-content-center", checked && "text-white")}
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
        {label || children}
      </label>
    </div>
  );
};

export default Checkbox;
