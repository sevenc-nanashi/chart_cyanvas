import clsx from "clsx";
import type { ComponentProps } from "react";

const OptionalImage: React.FC<
  { src: string | undefined; alt: string | undefined } & Omit<
    ComponentProps<"img">,
    "src" | "alt"
  >
> = ({ src, alt, ...props }) => {
  if (!src) {
    return (
      <div
        className={clsx(
          "bg-white dark:bg-gray-700 flex justify-center items-center animate-pulse",
          props.className,
        )}
        style={{
          ...props.style,
        }}
      />
    );
  }
  return <img src={src} alt={alt || ""} {...props} />;
};

export default OptionalImage;
