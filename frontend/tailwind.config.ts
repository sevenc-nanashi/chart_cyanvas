import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./{app,lib,components}/**/*.{tsx,ts}"],
  theme: {
    fontFamily: {
      sans: ["'M PLUS 1p'", "sans-serif"],
      bold: ["'M PLUS 1p'", "sans-serif"],
      extraBold: ["'M PLUS 1p'", "sans-serif"],
      monospace: [
        "Consolas",
        "Menlo",
        "Monaco",
        "source-code-pro",
        "monospace",
      ],
    },
    fontWeight: {
      sans: "400",
      bold: "500",
      extrabold: "700",
    },
    extend: {
      colors: {
        theme: "#83ccd2",
        themeText: "var(--global-theme-text)",
        themeDark: "#2ac3d1",

      },
    },
  },
  plugins: [],
};

export default config;
