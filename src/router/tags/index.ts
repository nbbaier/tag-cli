import { initTRPC, TRPCError } from "@trpc/server";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { z } from "zod";
import type { DbDrizzleHelpers } from "@/db/db";
import type * as schema from "@/db/schema";
import { success } from "@/utils/format";

const drizzleT = initTRPC
  .context<{
    db: BunSQLiteDatabase<typeof schema>;
    helpers: DbDrizzleHelpers;
  }>()
  .create();

export const drizzleTagsRouter = drizzleT.router({
  create: drizzleT.procedure
    .meta({
      description: "Create a new tag",
      examples: [
        "tag tags create frontend",
        'tag tags create backend --description "Backend projects"',
      ],
    })
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.helpers.insertTag(input.name, input.description || null);
        success(`Created tag '${input.name}'`);
        return { success: true, name: input.name };
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        }
      }
    }),

  list: drizzleT.procedure
    .meta({
      description: "List all tags",
      examples: ["tag tags list"],
    })
    .input(
      z
        .object({
          query: z
            .string()
            .optional()
            .describe("Filter tags by name (partial match)"),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      let tags = await ctx.helpers.getAllTags();
      if (input?.query) {
        const query = input.query.toLowerCase();
        tags = tags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(query) ||
            tag.description?.toLowerCase().includes(query),
        );
      }

      return tags;
    }),

  rename: drizzleT.procedure
    .meta({
      description: "Rename an existing tag",
      examples: ["tag tags rename old-name new-name"],
    })
    .input(z.object({ name: z.string().min(1), newName: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if tag exists
        const existing = (await ctx.helpers.findTagByName(input.name))[0];
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Tag '${input.name}' not found`,
          });
        }

        // Check if new name already exists
        const nameExists = (await ctx.helpers.findTagByName(input.newName))[0];
        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Tag '${input.newName}' already exists`,
          });
        }

        await ctx.helpers.updateTag(
          input.newName,
          existing.description,
          existing.id,
        );
        success(`Renamed tag '${input.name}' to '${input.newName}'`);
        return { success: true, oldName: input.name, newName: input.newName };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to rename tag: ${err}`,
        });
      }
    }),

  remove: drizzleT.procedure
    .meta({
      description: "Remove a tag",
      examples: ["tag tags remove frontend"],
    })
    .input(
      z.object({
        name: z
          .string()
          .min(1)
          .describe("Tag name to remove")
          .meta({ positional: true }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existing = (await ctx.helpers.findTagByName(input.name))[0];
        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Tag '${input.name}' not found`,
          });
        }

        const result = await ctx.helpers.deleteTag(existing.id);
        if (result.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Tag '${input.name}' not found`,
          });
        }

        success(`Removed tag '${input.name}'`);
        return { success: true, name: input.name };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to remove tag: ${err}`,
        });
      }
    }),
});
