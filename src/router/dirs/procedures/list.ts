import { initTRPC } from "@trpc/server";
import chalk from "chalk";
import z from "zod";
import type { DirectoryListOptions } from "@/components/directory-list";
import { DirectoryList } from "@/components/directory-list";
import type { Context } from "@/router";
import { handleError } from "@/utils";
import { listOptions } from "./options";

const t = initTRPC.context<Context>().create();

const list = t.procedure
  .meta({
    description: "List all tracked directories",
    examples: ["tag dir list"],
  })
  .input(
    z
      .object({
        ...listOptions,
        query: z
          .string()
          .optional()
          .describe("Filter directories by path (partial match)"),
      })
      .optional(),
  )
  .query(async ({ ctx, input }) => {
    try {
      let directories = await ctx.helpers.getAllDirectories();

      if (input?.query) {
        const query = input.query.toLowerCase();
        directories = directories.filter((dir) =>
          dir.path.toLowerCase().includes(query),
        );
      }

      const directoriesWithTags = await Promise.all(
        directories.map(async (dir) => {
          const tags = await ctx.helpers.getDirectoryTags(dir.id);
          return {
            id: dir.id,
            path: dir.path,
            created_at: dir.rowCreatedAt
              ? dir.rowCreatedAt.toISOString()
              : new Date().toISOString(),
            tags: tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              description: tag.description || undefined,
              created_at: tag.rowCreatedAt
                ? tag.rowCreatedAt.toISOString()
                : new Date().toISOString(),
            })),
          };
        }),
      );

      const options: DirectoryListOptions = {
        created: input?.created,
        updated: input?.updated,
        id: input?.id,
        relativeTime: input?.relative,
        header: input?.table,
      };

      const output = DirectoryList(directoriesWithTags, options);

      console.log();

      if (input?.json) {
        console.log(JSON.stringify(directoriesWithTags, null, 2));
      } else if (input?.table) {
        console.log(output.toString());
      } else {
        console.log(chalk.bold("Directories"));
        console.log(output.toString());
      }
    } catch (err) {
      handleError(err);
    }
  });

export default list;
