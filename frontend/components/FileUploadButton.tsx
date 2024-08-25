import { useEffect, useReducer, useRef } from "react";
import { clsx } from "clsx";

const FileUploadButton = (props: {
  accept: string;
  name: string;
  text: string;
  icon: JSX.Element;
  error?: string;
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [_, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    fileInput.current?.addEventListener("change", () => forceUpdate());
  }, []);
  return (
    <div
      className={clsx(
        "flex !text-left items-center xl:flex-col flex-row rounded py-4 mb-4",
        "bg-theme dark:text-white bg-opacity-0 hover:bg-opacity-5 dark:hover:bg-opacity-20 border-2",
        "cursor-pointer hover:bg-opacity-20 button relative",
        fileInput.current?.files?.item(0)
          ? "border-theme dark:border-theme"
          : "border-slate-300 dark:border-white",
      )}
      onClick={() => {
        fileInput.current?.click();
      }}
    >
      <div className="w-12 h-12 [&>svg]:w-full [&>svg]:h-full">
        {props.icon}
      </div>

      <span className="text-lg">
        {fileInput.current?.files?.item(0)?.name || props.text}
        {props.error && (
          <>
            <span className="text-sm text-red-500 xl:absolute xl:left-0 xl:right-0 xl:text-center xl:-bottom-6">
              <br />
              {props.error}
            </span>
          </>
        )}
      </span>
      <input
        type="file"
        data-name={props.name}
        accept={props.accept}
        hidden
        ref={fileInput}
      />
    </div>
  );
};

export default FileUploadButton;
