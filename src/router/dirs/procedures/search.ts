import { initTRPC, TRPCError } from "@trpc/server";
import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import * as schema from "@/db/schema";
import type { Context } from "@/router";

import { listOptions } from "./options";

const t = initTRPC.context<Context>().create();

const { directoriesTable, directoryTagsTable, tagsTable } = schema;

const search = t.procedure
  .meta({
    description: "Search directories by tags",
    examples: [
      "tag dir search --tags frontend",
      "tag dir search --tags frontend,react --any",
      "tag dir search --tags backend,api",
    ],
  })
  .input(
    z.object({
      ...listOptions,
      tags: z.array(z.string()).min(1).describe("Tags to search for"),
      any: z
        .boolean()
        .default(false)
        .describe("Match any tag (OR) instead of all tags (AND)"),
    }),
  )
  .query(async ({ ctx, input }) => {
    try {
      const getDirectoriesWithTags = async (tags: string[], any: boolean) => {
        if (any) {
          const results = await ctx.db
            .selectDistinct({
              id: directoriesTable.id,
              path: directoriesTable.path,
              tagId: tagsTable.id,
              tagName: tagsTable.name,
              tagDescription: tagsTable.description,
            })
            .from(directoriesTable)
            .innerJoin(
              directoryTagsTable,
              eq(directoriesTable.id, directoryTagsTable.dirId),
            )
            .innerJoin(tagsTable, eq(directoryTagsTable.tagId, tagsTable.id))
            .where(inArray(tagsTable.name, tags))
            .orderBy(directoriesTable.path);

          const grouped = results.reduce(
            (acc, row) => {
              const dir = acc.find((d) => d.id === row.id);
              if (dir) {
                dir.tags.push({
                  id: row.tagId,
                  name: row.tagName,
                  description: row.tagDescription,
                });
              } else {
                acc.push({
                  id: row.id,
                  path: row.path,
                  tags: [
                    {
                      id: row.tagId,
                      name: row.tagName,
                      description: row.tagDescription,
                    },
                  ],
                });
              }
              return acc;
            },
            [] as {
              id: number;
              path: string;
              tags: {
                id: number;
                name: string;
                description: string | null;
              }[];
            }[],
          );

          return grouped;
        } else {
          // AND logic - directories with all specified tags
          const dirIds = await ctx.db
            .select({
              dirId: directoryTagsTable.dirId,
            })
            .from(directoryTagsTable)
            .innerJoin(tagsTable, eq(directoryTagsTable.tagId, tagsTable.id))
            .where(inArray(tagsTable.name, tags))
            .groupBy(directoryTagsTable.dirId)
            .having(sql`COUNT(DISTINCT ${tagsTable.id}) = ${tags.length}`);

          const directories = await ctx.db
            .select()
            .from(directoriesTable)
            .where(
              inArray(
                directoriesTable.id,
                dirIds
                  .map((d) => d.dirId)
                  .filter((id): id is number => id !== null),
              ),
            )
            .orderBy(directoriesTable.path);

          return Promise.all(
            directories.map(async (dir) => ({
              ...dir,
              tags: await ctx.helpers.getDirectoryTags(dir.id),
            })),
          );
        }
      };

      const directoriesWithTags = await getDirectoriesWithTags(
        input.tags,
        input.any,
      );

      console.log(directoriesWithTags);

      return directoriesWithTags;
    } catch (err) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to search directories: ${err}`,
      });
    }
  });

export default search;
