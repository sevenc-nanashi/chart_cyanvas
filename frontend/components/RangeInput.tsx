import { useState } from "react";
import { Range, getTrackBackground } from "react-range";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const RangeInput = (
  props: {
    min: number;
    max: number;
    step: number;
    name: string;
  } & (
    | {
        dual?: false;
        defaultValue?: number;
        value?: number;
        onChange?: (value: number) => void;
      }
    | {
        dual: true;
        defaultValue?: [number, number];
        value?: [number, number];
        onChange?: (value: [number, number]) => void;
      }
  ),
) => {
  const [internalValues, setValues] = useState(
    props.dual
      ? props.defaultValue ?? [props.min, props.max]
      : [props.defaultValue ?? props.min],
  );

  const values = (
    props.value !== undefined
      ? props.dual
        ? props.value
        : [props.value]
      : internalValues
  ).map((v) => clamp(v, props.min, props.max));

  return (
    <>
      <Range
        step={props.step}
        min={props.min}
        max={props.max}
        values={values}
        onChange={(values) => {
          if (props.value != null) {
            if (props.dual) {
              props.onChange?.(values as [number, number]);
            } else {
              props.onChange?.(values[0]);
            }
          } else {
            setValues(values);
          }
        }}
        renderTrack={({ props: rProps, children }) => (
          <div
            onMouseDown={rProps.onMouseDown}
            onTouchStart={rProps.onTouchStart}
            style={{
              ...rProps.style,
            }}
            className={"h-2 bg-gray-200 dark:bg-gray-900 rounded flex"}
          >
            <div
              ref={rProps.ref}
              className="h-2 w-full self-center rounded"
              style={{
                background: getTrackBackground({
                  values: values,
                  colors: props.dual
                    ? ["#0000", "#83ccd2", "#0000"]
                    : ["#83ccd2", "#0000"],
                  min: props.min,
                  max: props.max,
                }),
              }}
            >
              {children}
            </div>
          </div>
        )}
        renderThumb={({ props }) => (
          <div
            {...props}
            key={props.key}
            className="w-4 h-4 bg-theme rounded-full"
          />
        )}
      />
      <input
        type="range"
        value={internalValues[0]}
        data-name={props.name}
        readOnly
        hidden
      />
    </>
  );
};

export default RangeInput;
