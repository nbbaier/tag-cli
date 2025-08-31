import { Database } from "bun:sqlite";
import type { Directory, Tag } from "@/types";
import { getStatePath } from "@/utils/path";

export function openDB(): Database {
  const dbPath = getStatePath("tag");
  const db = new Database(dbPath);

  db.run("PRAGMA foreign_keys = ON");

  const schema = `
-- Tags table
CREATE TABLE IF NOT EXISTS tags (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT UNIQUE NOT NULL,
description TEXT,
created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Directories table
CREATE TABLE IF NOT EXISTS directories (
id INTEGER PRIMARY KEY AUTOINCREMENT,
path TEXT UNIQUE NOT NULL,
created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS directory_tags (
dir_id INTEGER NOT NULL,
tag_id INTEGER NOT NULL,
PRIMARY KEY (dir_id, tag_id),
FOREIGN KEY(dir_id) REFERENCES directories(id) ON DELETE CASCADE,
FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dir_tags_tag ON directory_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_dir_tags_dir ON directory_tags(dir_id);
CREATE INDEX IF NOT EXISTS idx_directories_path ON directories(path);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
`;

  const statements = schema.split(";").filter((stmt) => stmt.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      db.run(statement);
    }
  }

  return db;
}

export function createDbHelpers(db: Database) {
  const insertTagStmt = db.prepare(
    "INSERT INTO tags (name, description) VALUES (?, ?)",
  );
  const findTagByNameStmt = db.prepare("SELECT * FROM tags WHERE name = ?");
  const findTagByIdStmt = db.prepare("SELECT * FROM tags WHERE id = ?");
  const getAllTagsStmt = db.prepare("SELECT * FROM tags ORDER BY name");
  const updateTagStmt = db.prepare(
    "UPDATE tags SET name = ?, description = ? WHERE id = ?",
  );
  const deleteTagStmt = db.prepare("DELETE FROM tags WHERE name = ?");

  const insertDirectoryStmt = db.prepare(
    "INSERT INTO directories (path) VALUES (?)",
  );
  const findDirectoryByPathStmt = db.prepare(
    "SELECT * FROM directories WHERE path = ?",
  );
  const findDirectoryByIdStmt = db.prepare(
    "SELECT * FROM directories WHERE id = ?",
  );
  const getAllDirectoriesStmt = db.prepare(
    "SELECT * FROM directories ORDER BY path",
  );
  const deleteDirectoryStmt = db.prepare(
    "DELETE FROM directories WHERE path = ?",
  );

  const insertDirectoryTagStmt = db.prepare(
    "INSERT INTO directory_tags (dir_id, tag_id) VALUES (?, ?)",
  );
  const deleteDirectoryTagStmt = db.prepare(
    "DELETE FROM directory_tags WHERE dir_id = ? AND tag_id = ?",
  );
  const deleteAllDirectoryTagsStmt = db.prepare(
    "DELETE FROM directory_tags WHERE dir_id = ?",
  );
  const getDirectoryTagsStmt = db.prepare(`
SELECT t.* FROM tags t
JOIN directory_tags dt ON t.id = dt.tag_id
WHERE dt.dir_id = ?
ORDER BY t.name
`);

  return {
    // Tags - typed wrapper functions
    insertTag: (name: string, description: string | null) => {
      return insertTagStmt.run(name, description);
    },
    findTagByName: (name: string): Tag | null => {
      return findTagByNameStmt.get(name) as Tag | null;
    },
    findTagById: (id: number): Tag | null => {
      return findTagByIdStmt.get(id) as Tag | null;
    },
    getAllTags: (): Tag[] => {
      return getAllTagsStmt.all() as Tag[];
    },
    updateTag: (name: string, description: string | null, id: number) => {
      return updateTagStmt.run(name, description, id);
    },
    deleteTag: (name: string) => {
      return deleteTagStmt.run(name);
    },

    // Directories - typed wrapper functions
    insertDirectory: (path: string) => {
      return insertDirectoryStmt.run(path);
    },
    findDirectoryByPath: (path: string): Directory | null => {
      return findDirectoryByPathStmt.get(path) as Directory | null;
    },
    findDirectoryById: (id: number): Directory | null => {
      return findDirectoryByIdStmt.get(id) as Directory | null;
    },
    getAllDirectories: (): Directory[] => {
      return getAllDirectoriesStmt.all() as Directory[];
    },
    deleteDirectory: (path: string) => {
      return deleteDirectoryStmt.run(path);
    },

    // Directory Tags - typed wrapper functions
    insertDirectoryTag: (dirId: number, tagId: number) => {
      return insertDirectoryTagStmt.run(dirId, tagId);
    },
    deleteDirectoryTag: (dirId: number, tagId: number) => {
      return deleteDirectoryTagStmt.run(dirId, tagId);
    },
    deleteAllDirectoryTags: (dirId: number) => {
      return deleteAllDirectoryTagsStmt.run(dirId);
    },
    getDirectoryTags: (dirId: number): Tag[] => {
      return getDirectoryTagsStmt.all(dirId) as Tag[];
    },
  };
}

export type DbHelpers = ReturnType<typeof createDbHelpers>;
