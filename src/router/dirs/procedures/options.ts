import z from "zod";

export const listOptions = {
  table: z.boolean().optional().default(false).describe("Use table output"),
  created: z.boolean().optional().default(false).describe("Show created time"),
  updated: z.boolean().optional().default(false).describe("Show updated time"),
  id: z.boolean().optional().default(false).describe("Show directory id"),
  relative: z
    .boolean()
    .default(true)
    .meta({ negatable: true })
    .describe("Show relative time"),
  json: z.boolean().optional().default(false).describe("Output in JSON format"),
};
