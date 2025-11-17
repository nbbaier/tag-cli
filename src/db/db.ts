import { Database } from "bun:sqlite";
import { and, eq } from "drizzle-orm";
import { type BunSQLiteDatabase, drizzle } from "drizzle-orm/bun-sqlite";
import { getStatePath } from "@/utils/path";

import * as schema from "./schema";

const dbPath = getStatePath();
const sqlite = new Database(dbPath);

export const db = drizzle({
  client: sqlite,
  schema,
  casing: "snake_case",
});

export function createDrizzleDbHelpers<T extends typeof schema>(
  db: BunSQLiteDatabase<T>,
) {
  return {
    // Tags - typed wrapper functions
    insertTag: async (name: string, description: string | null) => {
      return db
        .insert(schema.tagsTable)
        .values({ name, description })
        .returning();
    },

    findTagByName: async (name: string) => {
      return db
        .select()
        .from(schema.tagsTable)
        .where(eq(schema.tagsTable.name, name));
    },

    findTagById: async (id: number) => {
      return db
        .select()
        .from(schema.tagsTable)
        .where(eq(schema.tagsTable.id, id));
    },

    getAllTags: async () => {
      return db.select().from(schema.tagsTable);
    },

    updateTag: async (name: string, description: string | null, id: number) => {
      return db
        .update(schema.tagsTable)
        .set({ name, description })
        .where(eq(schema.tagsTable.id, id));
    },

    deleteTag: async (id: number) => {
      return db
        .delete(schema.tagsTable)
        .where(eq(schema.tagsTable.id, id))
        .returning();
    },

    // Directories - typed wrapper functions
    insertDirectory: async (path: string) => {
      return db.insert(schema.directoriesTable).values({ path }).returning();
    },

    findDirectoryByPath: async (path: string) => {
      return db
        .select()
        .from(schema.directoriesTable)
        .where(eq(schema.directoriesTable.path, path));
    },

    findDirectoryById: async (id: number) => {
      return db
        .select()
        .from(schema.directoriesTable)
        .where(eq(schema.directoriesTable.id, id));
    },

    getAllDirectories: async () => {
      return db
        .select()
        .from(schema.directoriesTable)
        .orderBy(schema.directoriesTable.path);
    },

    deleteDirectory: async (id: number) => {
      return db
        .delete(schema.directoriesTable)
        .where(eq(schema.directoriesTable.id, id))
        .returning();
    },

    // Directory Tags - typed wrapper functions
    insertDirectoryTag: async (dirId: number, tagId: number) => {
      return db
        .insert(schema.directoryTagsTable)
        .values({ dirId, tagId })
        .returning();
    },

    deleteDirectoryTag: async (dirId: number, tagId: number) => {
      return db
        .delete(schema.directoryTagsTable)
        .where(
          and(
            eq(schema.directoryTagsTable.dirId, dirId),
            eq(schema.directoryTagsTable.tagId, tagId),
          ),
        )
        .returning();
    },

    deleteAllDirectoryTags: async (dirId: number) => {
      return db
        .delete(schema.directoryTagsTable)
        .where(eq(schema.directoryTagsTable.dirId, dirId));
    },

    getDirectoryTags: async (dirId: number) => {
      return db
        .select({
          id: schema.tagsTable.id,
          name: schema.tagsTable.name,
          description: schema.tagsTable.description,
          rowCreatedAt: schema.tagsTable.rowCreatedAt,
          rowUpdatedAt: schema.tagsTable.rowUpdatedAt,
        })
        .from(schema.tagsTable)
        .innerJoin(
          schema.directoryTagsTable,
          eq(schema.tagsTable.id, schema.directoryTagsTable.tagId),
        )
        .where(eq(schema.directoryTagsTable.dirId, dirId))
        .orderBy(schema.tagsTable.name);
    },
  };
}

export type DbDrizzleHelpers = ReturnType<typeof createDrizzleDbHelpers>;

// tags
export type InsertTagReturn = Awaited<
  ReturnType<DbDrizzleHelpers["insertTag"]>
>;

export type FindTagByNameReturn = Awaited<
  ReturnType<DbDrizzleHelpers["findTagByName"]>
>;

export type FindTagByIdReturn = Awaited<
  ReturnType<DbDrizzleHelpers["findTagById"]>
>;

export type GetAllTagsReturn = Awaited<
  ReturnType<DbDrizzleHelpers["getAllTags"]>
>;

export type UpdateTagReturn = Awaited<
  ReturnType<DbDrizzleHelpers["updateTag"]>
>;

export type DeleteTagReturn = Awaited<
  ReturnType<DbDrizzleHelpers["deleteTag"]>
>;

// directories
export type InsertDirectoryReturn = Awaited<
  ReturnType<DbDrizzleHelpers["insertDirectory"]>
>;

export type FindDirectoryByPathReturn = Awaited<
  ReturnType<DbDrizzleHelpers["findDirectoryByPath"]>
>;

export type FindDirectoryByIdReturn = Awaited<
  ReturnType<DbDrizzleHelpers["findDirectoryById"]>
>;

export type GetAllDirectoriesReturn = Awaited<
  ReturnType<DbDrizzleHelpers["getAllDirectories"]>
>;

// directory tags
export type InsertDirectoryTagReturn = Awaited<
  ReturnType<DbDrizzleHelpers["insertDirectoryTag"]>
>;

export type DeleteDirectoryReturn = Awaited<
  ReturnType<DbDrizzleHelpers["deleteDirectory"]>
>;

export type DeleteDirectoryTagReturn = Awaited<
  ReturnType<DbDrizzleHelpers["deleteDirectoryTag"]>
>;

export type DeleteAllDirectoryTagsReturn = Awaited<
  ReturnType<DbDrizzleHelpers["deleteAllDirectoryTags"]>
>;
