const pluginNodeResolve = require("@rollup/plugin-node-resolve");
const pluginCommonjs = require("@rollup/plugin-commonjs");
const pluginTypescript = require("@rollup/plugin-typescript");
const pluginJson = require("@rollup/plugin-json");

/** @type {import('rollup').RollupOptions} */
module.exports = {
  input: "src/index.ts",
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
