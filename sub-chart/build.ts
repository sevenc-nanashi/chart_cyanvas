import * as esbuild from "esbuild"

esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  minify: true,
})
