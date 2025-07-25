#!/usr/bin/env bun

import { createCli } from "trpc-cli";
import { createContext, rootRouter } from "./router/index";

const cli = createCli({
  router: rootRouter,
  context: createContext(),
  name: "tag",
  version: "0.1.0",
  description:
    "A CLI tool for organizing development projects by tagging directories",
});

// Run the CLI if this file is executed directly
if (import.meta.main) {
  await cli.run();
}

export default cli;
