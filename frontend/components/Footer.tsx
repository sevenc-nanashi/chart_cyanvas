import clsx from "clsx";

const Footer = () => {
  return (
    <>
      <footer
        className={clsx(
          "bg-slate-300 dark:bg-slate-600 flex items-center h-20 align-center justify-center text-sm",
          "text-gray-800 dark:text-slate-200",
          "flex flex-col md:gap-2",
          "[&_a]text-blue-500 [&_a]dark:text-theme",
        )}
      >
        <div className="flex flex-col md:flex-row md:gap-2 items-center">
          <div>Chart Cyanvas - A sekai custom chart platform.</div>
          <div>
            &copy; 2022-2024,{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://sevenc7c.com"
              className="underline"
            >
              Nanashi. {"<https://sevenc7c.com>"}
            </a>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/sevenc-nanashi/chart_cyanvas"
            className="underline"
          >
            GitHub
          </a>{" "}
          |
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/2NP3U3r8Rz"
            className="underline"
          >
            Discord
          </a>{" "}
          |
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.patreon.com/sevenc_nanashi"
            className="underline"
          >
            Patreon
          </a>
        </div>
      </footer>
    </>
  );
};

export default Footer;
