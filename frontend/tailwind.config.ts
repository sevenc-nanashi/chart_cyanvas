import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./{app,lib,components}/**/*.{tsx,ts}"],
  darkMode: "selector",
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
      borderWidth: {
        1: "1px",
      },
      outlineWidth: {
        1: "1px",
      },
      colors: {
        theme: "#83ccd2",
        themeText: "var(--global-theme-text)",
        themeDark: "#2ac3d1",
        background: "var(--global-background)",
        inputBorder: "var(--global-input-border)",
      },
    },
  },
  plugins: [
    {
      handler: (plugin) => {
        plugin.addVariant("starting", "@starting-style");
      },
    },
  ],
};

export default config;
