import { className } from "lib/utils"

const Footer = () => {
  return (
    <>
      <footer
        className={className(
          "bg-slate-300 dark:bg-slate-600 flex items-center h-20 align-center justify-center text-white dark:text-slate-300 text-sm",
          "flex flex-col md:gap-2",
          "[&_a]text-blue-500 [&_a]dark:text-theme"
        )}
      >
        <div className="flex flex-col md:flex-row md:gap-2 items-center">
          <div>Chart Cyanvas - A sekai custom chart platform.</div>
          <div>
            &copy; 2022-2023,{" "}
            <a target="_blank" rel="noreferrer" href="https://sevenc7c.com">
              Nanashi. &lt;sevenc-nanashi&gt;
            </a>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/sevenc-nanashi/chart_cyanvas"
          >
            GitHub
          </a>{" "}
          |
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/2NP3U3r8Rz"
          >
            Discord
          </a>
        </div>
      </footer>
    </>
  )
}

export default Footer
