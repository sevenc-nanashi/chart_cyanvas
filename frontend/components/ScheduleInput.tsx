import { useMemo, useState } from "react";

const ScheduleInput = (props: {
  name: string;
  defaultValue?: Date;
  onChange?: (value: Date) => void;
}) => {
  const currentDate = useMemo(() => {
    const date = new Date();

    return date;
  }, []);

  const defaultValue = new Date(props.defaultValue || currentDate);

  defaultValue.setMinutes(
    defaultValue.getMinutes() - defaultValue.getTimezoneOffset(),
  );

  const [scheduledAt, setScheduledAt] = useState(defaultValue);

  const displayValue = scheduledAt
    .toISOString()
    .replace(/:[0-9]+\.[0-9]+Z.*/g, "");

  return (
    <input
      type="datetime-local"
      className="text-input w-full mt-2"
      onChange={(e) => {
        const current = new Date();
        current.setMinutes(current.getMinutes() - current.getTimezoneOffset());
        const maybeNew = e.target.valueAsNumber;
        const next = new Date(
          maybeNew
            ? current.getTime() > maybeNew
              ? current
              : maybeNew
            : current,
        );
        const utcNext = new Date(next);
        utcNext.setMinutes(utcNext.getMinutes() + utcNext.getTimezoneOffset());
        props.onChange?.(utcNext);
        setScheduledAt(next);
      }}
      value={displayValue}
      data-name={props.name}
    />
  );
};

export default ScheduleInput;
