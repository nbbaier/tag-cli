import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { Context } from "@/router";
import { success } from "@/utils/format";
import { canonical } from "@/utils/path";

const t = initTRPC.context<Context>().create();

const retag = t.procedure
  .meta({
    description: "Add or remove tags from a directory",
    examples: [
      "tag dir retag /path/to/project --add frontend --add react",
      "tag dir retag . --remove old-tag",
      "tag dir retag ../my-app --add new-tag --remove old-tag",
    ],
  })
  .input(
    z.object({
      path: z
        .string()
        .min(1)
        .describe("Directory path")
        .meta({ positional: true }),
      add: z.array(z.string()).optional().describe("Tags to add"),
      remove: z.array(z.string()).optional().describe("Tags to remove"),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    try {
      const canonicalPath = canonical(input.path);
      const directory = (
        await ctx.helpers.findDirectoryByPath(canonicalPath)
      )[0];

      if (!directory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Directory not found: ${canonicalPath}`,
        });
      }

      const changes: string[] = [];

      // Remove tags
      if (input.remove && input.remove.length > 0) {
        for (const tagName of input.remove) {
          const tag = (await ctx.helpers.findTagByName(tagName))[0];
          if (tag) {
            const res = (
              await ctx.helpers.deleteDirectoryTag(directory.id, tag.id)
            )[0];
            if (res) {
              changes.push(`removed '${tagName}'`);
            }
          }
        }
      }

      // Add tags
      if (input.add && input.add.length > 0) {
        for (const tagName of input.add) {
          let tag = (await ctx.helpers.findTagByName(tagName))[0];

          // Create tag if it doesn't exist
          if (!tag) {
            const tagResult = (await ctx.helpers.insertTag(tagName, null))[0];
            tag = (await ctx.helpers.findTagById(tagResult?.id as number))[0];
          }

          try {
            if (tag) {
              const res = (
                await ctx.helpers.insertDirectoryTag(directory.id, tag.id)
              )[0];
              if (res) {
                changes.push(`added '${tagName}'`);
              }
            }
          } catch (err) {
            console.error(err);
          }
        }
      }

      if (changes.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No changes specified. Use --add or --remove flags.",
        });
      }

      success(`Retagged ${canonicalPath}: ${changes.join(", ")}`);
      return { success: true, path: canonicalPath, changes };
    } catch (err) {
      if (err instanceof TRPCError) throw err;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to retag directory: ${err}`,
      });
    }
  });

export default retag;
