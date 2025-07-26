import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./{app,lib,components}/**/*.{tsx,ts}"],
  darkMode: "selector",
  theme:   plugins: [
    {
      handler: (plugin) => {
        plugin.addVariant("starting", "@starting-style");
      },
    },
  ],
};

export default config;
