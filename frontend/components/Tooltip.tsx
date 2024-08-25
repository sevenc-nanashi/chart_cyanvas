import * as RadixTooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";

const Tooltip: React.FC<{ children: React.ReactNode; text: string }> = ({
  children,
  text,
}) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root delayDuration={100}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={clsx(
              "absolute bottom-full p-2 rounded font-sans left-[-8rem] right-[-8rem]",
              "text-sm bg-slate-100 dark:bg-slate-700 shadow pointer-none will-change-[opacity]",
              "transition-opacity duration-150 starting:opacity-0 opacity-100",
            )}
            sideOffset={5}
          >
            {text}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
