import { reactRouter } from "@react-router/dev/vite";
import yaml from "@rollup/plugin-yaml";
import { config } from "dotenv";
import unocss from "unocss/vite";
import macros from "unplugin-macros/vite";
import { defineConfig } from "vite";
import { cjsInterop } from "vite-plugin-cjs-interop";
import svgr from "vite-plugin-svgr";

config({ path: "../.env", quiet: true });

const finalHost =
  process.env.FINAL_HOST && new URL(process.env.FINAL_HOST).hostname;
const backendUrl = process.env.HOSTS_BACKEND;
const wikiUrl = process.env.HOSTS_WIKI;

export default defineConfig({
  plugins: [
    yaml(),
    unocss(),
    svgr({}),
    cjsInterop({
      dependencies: ["react-range"],
    }),
    macros(),
    reactRouter(),
  ],
  server: {
    proxy: {
      "/api": {
        target: backendUrl,
      },
      "/sonolus": {
        target: backendUrl,
      },
      "/admin/": {
        target: backendUrl,
      },
      "/rails": {
        target: backendUrl,
      },
      "^/wiki/.+": {
        target: wikiUrl,
      },
    },
    allowedHosts: finalHost !== undefined ? [finalHost] : undefined,
  },
  resolve: {
    alias: {
      "~": import.meta.dirname,
    },
  },
});
