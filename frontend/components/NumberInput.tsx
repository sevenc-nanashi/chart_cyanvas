import clsx from "clsx";

const NumberInput = (props: {
  name: string;
  max?: number;
  min?: number;
  error?: string | undefined;
  monospace?: boolean;
  className?: string;
  value?: number;
  onChange?: (value: number) => void;
}) => {
  return (
    <input
      type="number"
      className={clsx(
        "text-input text-right",
        props.className,
        props.error && "text-input-error",
        props.monospace && "font-monospace",
      )}
      onChange={(e) => {
        props.onChange?.(e.target.valueAsNumber);
      }}
      value={props.value}
      max={props.max}
      min={props.min}
    />
  );
};

export default NumberInput;
