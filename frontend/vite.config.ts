import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import yaml from "@modyfi/vite-plugin-yaml";
import { cjsInterop } from "vite-plugin-cjs-interop";
import { config } from "dotenv";

config({ path: "../.env" });

const backendUrl = process.env.HOSTS_BACKEND;

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
    },
  },
  resolve: {
    alias: {
      "~": import.meta.dirname,
    },
  },
});
