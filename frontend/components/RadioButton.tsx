import * as RadixRadio from "@radix-ui/react-radio-group";
import clsx from "clsx";
import type { HTMLProps } from "react";
import { useLocalId } from "~/lib/useLocalId";

export const RadioGroup: React.FC<{
  value: string;
  defaultValue?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}> = (props) => <RadixRadio.Root {...props} />;

const RadioItem: React.FC<
  {
    value: string;
    disabled?: boolean;
    children: React.ReactNode;
  } & HTMLProps<HTMLLabelElement>
> = (props) => {
  const id = useLocalId("radio");
  const { value, disabled, children, className, ...rest } = props;
  return (
    <div className="grid grid-cols-[1.5rem_auto] items-center gap-2">
      <RadixRadio.Item
        value={value}
        disabled={disabled}
        id={id}
        className="w-6 h-6 rounded-full border-2 border-input-border grid place-content-center"
      >
        <RadixRadio.Indicator className="w-3 h-3 flex rounded-full bg-theme" />
      </RadixRadio.Item>
      <label
        htmlFor={id}
        className={clsx(
          disabled ? "cursor-not-allowed text-slate-400" : "cursor-pointer",
          className,
        )}
        {...rest}
      >
        {children}
      </label>
    </div>
  );
};
export default RadioItem;
