import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Database } from 'bun:sqlite';
import type { DbHelpers } from '../db/index.js';
import { formatTagList, success } from '../util/output.js';
import type { Tag } from '../types/models.js';

const t = initTRPC.context<{ db: Database; helpers: DbHelpers }>().create();

export const tagsRouter = t.router({
  create: t.procedure
    .meta({
      description: 'Create a new tag',
      examples: ['tag tags create frontend', 'tag tags create backend --description "Backend projects"']
    })
    .input(z.object({
      name: z.string().min(1).describe('Tag name').meta({ positional: true }),
      description: z.string().optional().describe('Optional tag description')
    }))
    .mutation(({ ctx, input }) => {
      try {
        // Check if tag already exists
        const existing = ctx.helpers.findTagByName(input.name);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Tag '${input.name}' already exists`
          });
        }

        ctx.helpers.insertTag(input.name, input.description || null);
        success(`Created tag '${input.name}'`);
        return { success: true, name: input.name };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to create tag: ${err}`
        });
      }
    }),

  list: t.procedure
    .meta({
      description: 'List all tags',
      examples: ['tag tags list']
    })
    .input(z.object({
      query: z.string().optional().describe('Filter tags by name (partial match)')
    }).optional())
    .query(({ ctx, input }) => {
      try {
        let tags = ctx.helpers.getAllTags();
        
        if (input?.query) {
          const query = input.query.toLowerCase();
          tags = tags.filter(tag => 
            tag.name.toLowerCase().includes(query) ||
            (tag.description && tag.description.toLowerCase().includes(query))
          );
        }

        formatTagList(tags);
        return tags;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to list tags: ${err}`
        });
      }
    }),

  rename: t.procedure
    .meta({
      description: 'Rename an existing tag',
      examples: ['tag tags rename old-name new-name']
    })
    .input(z.object({
      name: z.string().min(1).describe('Current tag name').meta({ positional: true }),
      newName: z.string().min(1).describe('New tag name').meta({ positional: true })
    }))
    .mutation(({ ctx, input }) => {
      try {
        const existing = ctx.helpers.findTagByName(input.name);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Tag '${input.name}' not found`
          });
        }

        // Check if new name already exists
        const nameExists = ctx.helpers.findTagByName(input.newName);
        if (nameExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Tag '${input.newName}' already exists`
          });
        }

        ctx.helpers.updateTag(input.newName, existing.description || null, existing.id);
        success(`Renamed tag '${input.name}' to '${input.newName}'`);
        return { success: true, oldName: input.name, newName: input.newName };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to rename tag: ${err}`
        });
      }
    }),

  remove: t.procedure
    .meta({
      description: 'Remove a tag',
      examples: ['tag tags remove frontend']
    })
    .input(z.object({
      name: z.string().min(1).describe('Tag name to remove').meta({ positional: true })
    }))
    .mutation(({ ctx, input }) => {
      try {
        const existing = ctx.helpers.findTagByName(input.name);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Tag '${input.name}' not found`
          });
        }

        const result = ctx.helpers.deleteTag(input.name);
        if (result.changes === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Tag '${input.name}' not found`
          });
        }

        success(`Removed tag '${input.name}'`);
        return { success: true, name: input.name };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to remove tag: ${err}`
        });
      }
    })
});
