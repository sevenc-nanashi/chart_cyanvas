import { vitePlugin as remix } from "@remix-run/dev";
import { config } from "dotenv";
import { defineConfig } from "vite";
import { cjsInterop } from "vite-plugin-cjs-interop";
import yaml from "@rollup/plugin-yaml";
import svgr from "vite-plugin-svgr";

config({ path: "../.env" });

const finalHost = process.env.FINAL_HOST && new URL(process.env.FINAL_HOST).hostname;
const backendUrl = process.env.HOSTS_BACKEND;
const wikiUrl = process.env.HOSTS_WIKI;

export default defineConfig({
  plugins: [
    yaml(),
    svgr({}),
    cjsInterop({
      dependencies: ["react-range"],
    }),
    remix(),
  ],
  server: {
    proxy: {
      "/api": {
        target: backendUrl,
      },
      "/sonolus": {
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
