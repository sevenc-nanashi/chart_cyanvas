import { defineConfig, presetWind4, transformerDirectives } from "unocss";

export default defineConfig({
  presets: [presetWind4()],
  transformers: [transformerDirectives()],
  theme: {
    font: {
      sans: ["'M PLUS 1p'", "sans-serif"].join(","),
      monospace: [
        "Consolas",
        "Menlo",
        "Monaco",
        "source-code-pro",
        "monospace",
      ].join(","),
    },
    fontWeight: {
      sans: "400",
      bold: "500",
      extrabold: "700",
    },
    colors: {
      theme: "#83ccd2",
      themeDark: "#2ac3d1",
      "theme-text": "var(--dummy)",
      background: "var(--dummy)",
      "input-border": "var(--dummy)",
    },
  },
});
