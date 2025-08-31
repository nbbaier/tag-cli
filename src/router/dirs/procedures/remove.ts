import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "@/router";
import { handleError } from "@/utils";
import { success } from "@/utils/format";
import { canonical } from "@/utils/path";

const t = initTRPC.context<Context>().create();

const remove = t.procedure
  .meta({
    description: "Remove a directory from tracking",
    examples: ["tag dir remove /path/to/project", "tag dir remove ."],
  })
  .input(
    z.object({
      path: z
        .string()
        .min(1)
        .describe("Directory path")
        .meta({ positional: true }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const canonicalPath = canonical(input.path);

      const directory = (
        await ctx.helpers.findDirectoryByPath(canonicalPath)
      )[0];

      if (!directory) {
        throw new Error(`Directory not found: ${canonicalPath}`);
      }

      const res = (await ctx.helpers.deleteDirectory(directory.id))[0];

      if (!res) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to remove directory: ${canonicalPath}`,
        });
      }

      success(`Removed directory: ${canonicalPath}`);
    } catch (err) {
      handleError(err);
    }
  });

export default remove;
