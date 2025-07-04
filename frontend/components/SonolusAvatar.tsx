import clsx from "clsx";
import type { Avatar } from "~/lib/types";

export default function SonolusAvatar(props: {
  avatar: Avatar;
  containerClassName?: string;
  innerClassName?: string;
}) {
  const {
    type,
    foregroundType: fgType,
    foregroundColor: fgColor,
    backgroundType: bgType,
    backgroundColor: bgColor,
  } = props.avatar;
  if (type.startsWith("theme-")) {
    return (
      <div
        className={props.containerClassName ?? "w-8 h-8"}
        style={{
          backgroundImage: `url(https://content.sonolus.com/avatar/background/${bgType})`,
          backgroundSize: "100% 100%",
        }}
      />
    );
  } else if (type === "default") {
    const inner = (
      <div
        className={clsx(props.innerClassName) ?? "w-1/2 h-1/2"}
        style={{
          backgroundColor: fgColor,
          maskImage: `url(https://content.sonolus.com/avatar/foreground/${fgType})`,
          WebkitMaskImage: `url(https://content.sonolus.com/avatar/foreground/${fgType})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    );

    if (bgType === "default") {
      return (
        <div
          className={clsx(props.containerClassName, "grid place-items-center")}
          style={{
            backgroundColor: bgColor,
            maskImage: `url(https://content.sonolus.com/avatar/background/${bgType})`,
            WebkitMaskImage: `url(https://content.sonolus.com/avatar/background/${bgType})`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
          }}
        >
          {inner}
        </div>
      );
    } else {
      return (
        <div
          className={clsx(props.containerClassName, "grid place-items-center")}
          style={{
            backgroundImage: `url(https://content.sonolus.com/avatar/background/${bgType})`,
            backgroundSize: "100% 100%",
          }}
        >
          {inner}
        </div>
      );
    }
  }
}
