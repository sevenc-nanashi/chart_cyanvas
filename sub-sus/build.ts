import * as esbuild from "esbuild"

esbuild.build({
  entryPoints: ["./src/index.ts"],
  bundle: true,
  outfile: "dist/index.cjs",
  platform: "node",
  minify: true,
})
