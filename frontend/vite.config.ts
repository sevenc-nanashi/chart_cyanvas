import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import { cjsInterop } from "vite-plugin-cjs-interop";
import yaml from "@modyfi/vite-plugin-yaml";

export default defineConfig({
  plugins: [
    yaml(),
    svgr(),
    cjsInterop({
      dependencies: ["react-helmet-async"],
    }),
    remix(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/sonolus": {
        target: "https://sonolus.com",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "~": import.meta.dirname,
    },
  },
});
