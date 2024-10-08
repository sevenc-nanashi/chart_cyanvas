import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";

const bundle = await rollup({
  input: `${import.meta.dirname}/src/index.ts`,
  plugins: [
    esbuild(),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    terser(),
  ],
});

await bundle.write({
  file: `${import.meta.dirname}/dist/index.js`,
  format: "es",
});

console.log("Build complete");
