import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginCommonjs from "@rollup/plugin-commonjs";
import pluginTypescript from "@rollup/plugin-typescript";
import pluginJson from "@rollup/plugin-json";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "index.ts",
  output: {
    file: "dist/index.cjs",
    format: "cjs",
  },
  plugins: [
    pluginNodeResolve(),
    pluginCommonjs(),
    pluginTypescript(),
    pluginJson(),
  ],
}
