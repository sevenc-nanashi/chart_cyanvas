import * as rolldown from "rolldown";

await rolldown.build({
  input: `${import.meta.dirname}/src/index.ts`,
  platform: "node",
  treeshake: true,
  output: {
    minify: true,
    dir: `${import.meta.dirname}/dist`,
  },
});

console.log("Build complete");
