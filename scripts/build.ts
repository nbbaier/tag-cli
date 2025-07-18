const result = await Bun.build({
  entrypoints: ["./src/cli.ts"],
  outdir: "./dist",
  target: "bun",
});

if (result.success) {
  console.log("Build successful");
  await Bun.$`mv ${result.outputs[0]?.path} ./dist/tag`;
} else {
  console.error("Build failed");
}
