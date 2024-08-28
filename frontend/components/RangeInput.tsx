import { useState } from "react";
import { Range, getTrackBackground } from "react-range";

const RangeInput = (props: {
  min: number;
  max: number;
  step: number;
  name: string;
  defaultValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}) => {
  const [values, setValues] = useState([props.defaultValue ?? props.min]);

  const value = [
    Math.max(
      props.min,
      Math.min(props.max, props.value != null ? props.value : values[0]),
    ),
  ];

  return (
    <>
      <Range
        step={props.step}
        min={props.min}
        max={props.max}
        values={value}
        onChange={(values) => {
          if (props.value != null) {
            props.onChange?.(values[0]);
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
                  values: value,
                  colors: ["#83ccd2", "#0000"],
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
        value={values[0]}
        data-name={props.name}
        readOnly
        hidden
      />
    </>
  );
};

export default RangeInput;
