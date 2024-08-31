import clsx from "clsx";
import { type Ref, forwardRef } from "react";

const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  {
    name: string;
    placeholder?: string;
    monospace?: boolean;
    prefix?: string;
    defaultValue?: string;
    error?: string | undefined;
    disabled?: boolean;
    maxLength?: number;
    className?: string;
    textarea?: boolean;
    optional?: boolean;
    value?: string;
    onChange?: (value: string) => void;
  }
>((props, ref) => {
  return props.prefix ? (
    <div
      className={clsx(
        "text-input !p-0 flex",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace",
      )}
    >
      <div className="border-r-1 bg-slate-100 dark:bg-gray-900 border-slate-300 dark:border-slate-700 p-2 dark:text-slate-200">
        {props.prefix}
      </div>
      <input
        type="text"
        className="outline-none p-2 w-full cursor-text"
        disabled={props.disabled}
        maxLength={props.maxLength}
        defaultValue={props.defaultValue}
        data-name={props.name}
        data-optional={props.optional}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
        ref={ref as Ref<HTMLInputElement>}
      />
    </div>
  ) : props.textarea ? (
    <textarea
      className={clsx(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace",
      )}
      disabled={props.disabled}
      maxLength={props.maxLength}
      defaultValue={props.defaultValue}
      data-name={props.name}
      data-optional={props.optional}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      ref={ref as Ref<HTMLTextAreaElement>}
    />
  ) : (
    <input
      type="text"
      className={clsx(
        "text-input",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace",
      )}
      disabled={props.disabled}
      maxLength={props.maxLength}
      defaultValue={props.defaultValue}
      data-name={props.name}
      data-optional={props.optional}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      ref={ref as Ref<HTMLInputElement>}
    />
  );
});

export default TextInput;
