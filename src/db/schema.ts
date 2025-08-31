import { relations } from "drizzle-orm";
import {
  index,
  primaryKey,
  sqliteTable,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type { SQLiteColumnBuilders } from "drizzle-orm/sqlite-core/columns/all";

export const rowTimestampColumns = (t: SQLiteColumnBuilders) => {
  return {
    rowCreatedAt: t
      .integer("row_created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date()),
    rowUpdatedAt: t
      .integer("row_updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  };
};

// tags table
export const tagsTable = sqliteTable(
  "tags",
  (t) => ({
    id: t.integer().primaryKey(),
    name: t.text().unique().notNull(),
    description: t.text(),
    ...rowTimestampColumns(t),
  }),
  (t) => [uniqueIndex("idx_tags_name").on(t.name)],
);

// directories table
export const directoriesTable = sqliteTable(
  "directories",
  (t) => ({
    id: t.integer().primaryKey(),
    path: t.text().unique().notNull(),
    ...rowTimestampColumns(t),
  }),
  (t) => [uniqueIndex("idx_directories_path").on(t.path)],
);

export const directoryTagsTable = sqliteTable(
  "directory_tags",
  (t) => ({
    dirId: t.integer().references(() => directoriesTable.id),
    tagId: t.integer().references(() => tagsTable.id),
    ...rowTimestampColumns(t),
  }),
  (t) => [
    primaryKey({ columns: [t.dirId, t.tagId] }),
    index("idx_dir_tags_tag").on(t.tagId),
    index("idx_dir_tags_dir").on(t.dirId),
  ],
);

export const directoryRelations = relations(directoriesTable, ({ many }) => ({
  tags: many(directoryTagsTable),
}));
