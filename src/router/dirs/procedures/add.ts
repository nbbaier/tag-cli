import { initTRPC } from "@trpc/server";
import chalk from "chalk";
import z from "zod";
import type { Context } from "@/router";
import type { Tag } from "@/types";
import { handleError } from "@/utils";
import { error, success } from "@/utils/format";
import { canonical } from "@/utils/path";

const t = initTRPC.context<Context>().create();

const add = t.procedure
  .meta({
    description: "Add a directory with optional tags",
    examples: [
      "tag dir add /path/to/project",
      "tag dir add . --tags frontend,react",
      "tag dir add ../my-app --tags backend,nodejs,api",
    ],
  })
  .input(
    z.tuple([
      z
        .string()
        .optional()
        .meta({ name: "path", positional: true })
        .default(".")
        .describe("Directory path"),
      z.object({
        tags: z.array(z.string()).optional(),
      }),
    ]),
  )
  .mutation(async ({ ctx, input }) => {
    const canonicalPath = canonical(input[0]);
    try {
      const dirResult = (await ctx.helpers.insertDirectory(canonicalPath))[0];
      const dirId = dirResult?.id as number;

      if (input[1].tags && input[1].tags.length > 0) {
        console.log(input[1].tags);
        for (const tagName of input[1].tags) {
          const tag = (await ctx.helpers.findTagByName(tagName))[0];
          if (!tag) {
            let newTag: Tag | undefined;
            try {
              newTag = (await ctx.helpers.insertTag(tagName, null))[0];
              if (newTag) {
                await ctx.helpers.insertDirectoryTag(dirId, newTag.id);
              }
            } catch (err) {
              error(`Error inserting tag: ${err}`);
            }
          } else {
            await ctx.helpers.insertDirectoryTag(dirId, tag.id);
          }
        }
      }

      const tagText =
        input[1].tags && input[1].tags.length > 0
          ? ` with tags: ${chalk.cyan(input[1].tags.join(", "))}`
          : "";
      success(
        `Added directory: ${chalk.cyan(canonicalPath)}${tagText} (id: ${dirId})`,
      );
    } catch (err) {
      handleError(err);
    }
  });

export default add;
