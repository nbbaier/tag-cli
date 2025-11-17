import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDrizzleDbHelpers } from "../src/db/db";
import * as schema from "../src/db/schema";

describe("Database functionality", () => {
  let sqlite: Database;
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let helpers: ReturnType<typeof createDrizzleDbHelpers>;
  let testDbPath: string;

  beforeEach(async () => {
    const testDir = join(tmpdir(), `tag-cli-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    testDbPath = join(testDir, "test.db");

    sqlite = new Database(testDbPath);
    db = drizzle({
      client: sqlite,
      schema,
      casing: "snake_case",
    });

    // Create tables using Drizzle migrations
    sqlite.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        row_created_at INTEGER,
        row_updated_at INTEGER
      )
    `);

    sqlite.run(`
      CREATE TABLE IF NOT EXISTS directories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        row_created_at INTEGER,
        row_updated_at INTEGER
      )
    `);

    sqlite.run(`
      CREATE TABLE IF NOT EXISTS directory_tags (
        dir_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        row_created_at INTEGER,
        row_updated_at INTEGER,
        PRIMARY KEY (dir_id, tag_id),
        FOREIGN KEY(dir_id) REFERENCES directories(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    sqlite.run(
      "CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)",
    );
    sqlite.run(
      "CREATE INDEX IF NOT EXISTS idx_directories_path ON directories(path)",
    );
    sqlite.run(
      "CREATE INDEX IF NOT EXISTS idx_dir_tags_tag ON directory_tags(tag_id)",
    );
    sqlite.run(
      "CREATE INDEX IF NOT EXISTS idx_dir_tags_dir ON directory_tags(dir_id)",
    );

    helpers = createDrizzleDbHelpers(db);
  });

  afterEach(() => {
    sqlite.close();
    // Clean up test database file
    try {
      rmSync(testDbPath);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("Tags", () => {
    it("should create a tag", async () => {
      const result = await helpers.insertTag("frontend", "Frontend projects");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBeNumber();
    });

    it("should find a tag by name", async () => {
      await helpers.insertTag("backend", "Backend projects");
      const tags = await helpers.findTagByName("backend");

      expect(tags).toHaveLength(1);
      expect(tags[0]?.name).toBe("backend");
      expect(tags[0]?.description).toBe("Backend projects");
    });

    it("should list all tags", async () => {
      await helpers.insertTag("frontend", "Frontend projects");
      await helpers.insertTag("backend", "Backend projects");

      const tags = await helpers.getAllTags();
      expect(tags.length).toBeGreaterThanOrEqual(2);
      const names = tags.map((t) => t.name);
      expect(names).toContain("backend");
      expect(names).toContain("frontend");
    });

    it("should update a tag", async () => {
      const insertResult = await helpers.insertTag("react", "React framework");
      const tagId = insertResult[0]?.id as number;

      await helpers.updateTag("reactjs", "React JavaScript library", tagId);

      const updatedTags = await helpers.findTagById(tagId);
      expect(updatedTags[0]?.name).toBe("reactjs");
      expect(updatedTags[0]?.description).toBe("React JavaScript library");
    });

    it("should delete a tag", async () => {
      const insertResult = await helpers.insertTag("temp", "Temporary tag");
      const tagId = insertResult[0]?.id as number;

      const result = await helpers.deleteTag(tagId);
      expect(result).toHaveLength(1);

      const tags = await helpers.findTagByName("temp");
      expect(tags).toHaveLength(0);
    });
  });

  describe("Directories", () => {
    it("should create a directory", async () => {
      const result = await helpers.insertDirectory("/test/path");
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBeNumber();
    });

    it("should find a directory by path", async () => {
      await helpers.insertDirectory("/test/project");
      const dirs = await helpers.findDirectoryByPath("/test/project");

      expect(dirs).toHaveLength(1);
      expect(dirs[0]?.path).toBe("/test/project");
    });

    it("should list all directories", async () => {
      await helpers.insertDirectory("/project/a");
      await helpers.insertDirectory("/project/b");

      const dirs = await helpers.getAllDirectories();
      expect(dirs.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a directory", async () => {
      const insertResult = await helpers.insertDirectory("/temp/project");
      const dirId = insertResult[0]?.id as number;

      const result = await helpers.deleteDirectory(dirId);
      expect(result).toHaveLength(1);

      const dirs = await helpers.findDirectoryByPath("/temp/project");
      expect(dirs).toHaveLength(0);
    });
  });

  describe("Directory Tags", () => {
    it("should link directory and tag", async () => {
      const tagResult = await helpers.insertTag("frontend", null);
      const dirResult = await helpers.insertDirectory("/test/project");

      const linkResult = await helpers.insertDirectoryTag(
        dirResult[0]?.id as number,
        tagResult[0]?.id as number,
      );
      expect(linkResult).toHaveLength(1);
    });

    it("should get tags for a directory", async () => {
      const tag1 = await helpers.insertTag("frontend", null);
      const tag2 = await helpers.insertTag("react", null);
      const dir = await helpers.insertDirectory("/test/project");

      const dirId = dir[0]?.id as number;
      await helpers.insertDirectoryTag(dirId, tag1[0]?.id as number);
      await helpers.insertDirectoryTag(dirId, tag2[0]?.id as number);

      const tags = await helpers.getDirectoryTags(dirId);
      expect(tags).toHaveLength(2);
      expect(tags.map((t) => t.name).sort()).toEqual(["frontend", "react"]);
    });

    it("should remove directory-tag link", async () => {
      const tag = await helpers.insertTag("temp", null);
      const dir = await helpers.insertDirectory("/test/project");

      const dirId = dir[0]?.id as number;
      const tagId = tag[0]?.id as number;

      await helpers.insertDirectoryTag(dirId, tagId);

      const result = await helpers.deleteDirectoryTag(dirId, tagId);
      expect(result).toHaveLength(1);

      const tags = await helpers.getDirectoryTags(dirId);
      expect(tags).toHaveLength(0);
    });
  });
});
