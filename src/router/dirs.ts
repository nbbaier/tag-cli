import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Database } from 'bun:sqlite';
import type { DbHelpers } from '../db/index.js';
import { canonical } from '../util/path.js';
import { formatDirectoryList, success } from '../util/output.js';
import type { Tag, Directory, DirectoryWithTags } from '../types/models.js';
import { t } from './index.js';

export const dirsRouter = t.router({
  add: t.procedure
    .meta({
      description: 'Add a directory with optional tags',
      examples: [
        'tag dir add /path/to/project',
        'tag dir add . --tags frontend,react',
        'tag dir add ../my-app --tags backend,nodejs,api'
      ]
    })
    .input(z.object({
      path: z.string().min(1).describe('Directory path').meta({ positional: true }),
      tags: z.array(z.string()).optional().describe('Comma-separated list of tags to apply')
    }))
    .mutation(({ ctx, input }) => {
      try {
        // Resolve and validate the path
        const canonicalPath = canonical(input.path);
        
        // Check if directory already exists in database
        const existing = ctx.helpers.findDirectoryByPath(canonicalPath);
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Directory already exists: ${canonicalPath}`
          });
        }

        // Insert directory
        const dirResult = ctx.helpers.insertDirectory(canonicalPath);
        const dirId = dirResult.lastInsertRowid as number;

        // Handle tags if provided
        if (input.tags && input.tags.length > 0) {
          for (const tagName of input.tags) {
            let tag = ctx.helpers.findTagByName(tagName);
            
            // Create tag if it doesn't exist
            if (!tag) {
              const tagResult = ctx.helpers.insertTag(tagName, null);
              tag = ctx.helpers.findTagById(tagResult.lastInsertRowid as number);
            }
            
            // Link directory and tag
            if (tag) {
              ctx.helpers.insertDirectoryTag(dirId, tag.id);
            }
          }
        }

        const tagText = input.tags && input.tags.length > 0 
          ? ` with tags: ${input.tags.join(', ')}`
          : '';
        success(`Added directory: ${canonicalPath}${tagText}`);
        
        return { success: true, path: canonicalPath, tags: input.tags || [] };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to add directory: ${err}`
        });
      }
    }),

  list: t.procedure
    .meta({
      description: 'List all tracked directories',
      examples: ['tag dir list']
    })
    .input(z.object({
      query: z.string().optional().describe('Filter directories by path (partial match)')
    }).optional())
    .query(({ ctx, input }) => {
      try {
        let directories = ctx.helpers.getAllDirectories();
        
        if (input?.query) {
          const query = input.query.toLowerCase();
          directories = directories.filter(dir => 
            dir.path.toLowerCase().includes(query)
          );
        }

        // Enrich with tags
        const directoriesWithTags: DirectoryWithTags[] = directories.map(dir => ({
          ...dir,
          tags: ctx.helpers.getDirectoryTags(dir.id)
        }));

        formatDirectoryList(directoriesWithTags);
        return directoriesWithTags;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to list directories: ${err}`
        });
      }
    }),

  search: t.procedure
    .meta({
      description: 'Search directories by tags',
      examples: [
        'tag dir search --tags frontend',
        'tag dir search --tags frontend,react --any',
        'tag dir search --tags backend,api'
      ]
    })
    .input(z.object({
      tags: z.array(z.string()).min(1).describe('Tags to search for'),
      any: z.boolean().default(false).describe('Match any tag (OR) instead of all tags (AND)')
    }))
    .query(({ ctx, input }) => {
      try {
        const placeholders = input.tags.map(() => '?').join(',');
        let query: string;
        
        if (input.any) {
          // OR logic - directories with any of the specified tags
          query = `
            SELECT DISTINCT d.* FROM directories d
            JOIN directory_tags dt ON d.id = dt.dir_id
            JOIN tags t ON dt.tag_id = t.id
            WHERE t.name IN (${placeholders})
            ORDER BY d.path
          `;
        } else {
          // AND logic - directories with all specified tags
          query = `
            SELECT d.* FROM directories d
            WHERE d.id IN (
              SELECT dt.dir_id FROM directory_tags dt
              JOIN tags t ON dt.tag_id = t.id
              WHERE t.name IN (${placeholders})
              GROUP BY dt.dir_id
              HAVING COUNT(DISTINCT t.id) = ?
            )
            ORDER BY d.path
          `;
        }

        const stmt = ctx.db.prepare(query);
        const directories = input.any 
          ? stmt.all(...input.tags) as Directory[]
          : stmt.all(...input.tags, input.tags.length) as Directory[];

        // Enrich with tags
        const directoriesWithTags: DirectoryWithTags[] = directories.map(dir => ({
          ...dir,
          tags: ctx.helpers.getDirectoryTags(dir.id)
        }));

        formatDirectoryList(directoriesWithTags);
        return directoriesWithTags;
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to search directories: ${err}`
        });
      }
    }),

  retag: t.procedure
    .meta({
      description: 'Add or remove tags from a directory',
      examples: [
        'tag dir retag /path/to/project --add frontend,react',
        'tag dir retag . --remove old-tag',
        'tag dir retag ../my-app --add new-tag --remove old-tag'
      ]
    })
    .input(z.object({
      path: z.string().min(1).describe('Directory path').meta({ positional: true }),
      add: z.array(z.string()).optional().describe('Tags to add'),
      remove: z.array(z.string()).optional().describe('Tags to remove')
    }))
    .mutation(({ ctx, input }) => {
      try {
        const canonicalPath = canonical(input.path);
        
        const directory = ctx.helpers.findDirectoryByPath(canonicalPath);
        if (!directory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Directory not found: ${canonicalPath}`
          });
        }

        const changes: string[] = [];

        // Remove tags
        if (input.remove && input.remove.length > 0) {
          for (const tagName of input.remove) {
            const tag = ctx.helpers.findTagByName(tagName);
            if (tag) {
              ctx.helpers.deleteDirectoryTag(directory.id, tag.id);
              changes.push(`removed '${tagName}'`);
            }
          }
        }

        // Add tags
        if (input.add && input.add.length > 0) {
          for (const tagName of input.add) {
            let tag = ctx.helpers.findTagByName(tagName);
            
            // Create tag if it doesn't exist
            if (!tag) {
              const tagResult = ctx.helpers.insertTag(tagName, null);
              tag = ctx.helpers.findTagById(tagResult.lastInsertRowid as number);
            }
            
            // Try to link (ignore if already exists due to unique constraint)
            try {
              if (tag) {
                ctx.helpers.insertDirectoryTag(directory.id, tag.id);
                changes.push(`added '${tagName}'`);
              }
            } catch (err) {
              // Ignore duplicate constraint errors
              if (!String(err).includes('UNIQUE constraint failed')) {
                throw err;
              }
            }
          }
        }

        if (changes.length === 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No changes specified. Use --add or --remove flags.'
          });
        }

        success(`Retagged ${canonicalPath}: ${changes.join(', ')}`);
        return { success: true, path: canonicalPath, changes };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to retag directory: ${err}`
        });
      }
    }),

  remove: t.procedure
    .meta({
      description: 'Remove a directory from tracking',
      examples: ['tag dir remove /path/to/project', 'tag dir remove .']
    })
    .input(z.object({
      path: z.string().min(1).describe('Directory path').meta({ positional: true })
    }))
    .mutation(({ ctx, input }) => {
      try {
        const canonicalPath = canonical(input.path);
        
        const result = ctx.helpers.deleteDirectory(canonicalPath);
        if (result.changes === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Directory not found: ${canonicalPath}`
          });
        }

        success(`Removed directory: ${canonicalPath}`);
        return { success: true, path: canonicalPath };
      } catch (err) {
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to remove directory: ${err}`
        });
      }
    })
});
