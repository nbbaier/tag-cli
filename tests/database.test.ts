import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createDbHelpers } from "../src/db/index";

describe("Database functionality", () => {
  let db: Database;
  let helpers: ReturnType<typeof createDbHelpers>;
  let testDbPath: string;

  beforeEach(() => {
    const testDir = join(tmpdir(), `tag-cli-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    testDbPath = join(testDir, "test.db");

    db = new Database(testDbPath);
    db.run("PRAGMA foreign_keys = ON");

    // Execute schema
    const schema = `
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS directories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT UNIQUE NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS directory_tags (
        dir_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (dir_id, tag_id),
        FOREIGN KEY(dir_id) REFERENCES directories(id) ON DELETE CASCADE,
        FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );
    `;

    const statements = schema.split(";").filter((stmt) => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        db.run(statement);
      }
    }

    helpers = createDbHelpers(db);
  });

  afterEach(() => {
    db.close();
    // Clean up test database file
    try {
      rmSync(testDbPath);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe("Tags", () => {
    it("should create a tag", () => {
      const result = helpers.insertTag("frontend", "Frontend projects");
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeNumber();
    });

    it("should find a tag by name", () => {
      helpers.insertTag("backend", "Backend projects");
      const tag = helpers.findTagByName("backend");

      expect(tag).toBeDefined();
      expect(tag?.name).toBe("backend");
      expect(tag?.description).toBe("Backend projects");
    });

    it("should list all tags", () => {
      helpers.insertTag("frontend", "Frontend projects");
      helpers.insertTag("backend", "Backend projects");

      const tags = helpers.getAllTags();
      expect(tags).toHaveLength(2);
      expect(tags[0]?.name).toBe("backend");
      expect(tags[1]?.name).toBe("frontend");
    });

    it("should update a tag", () => {
      const insertResult = helpers.insertTag("react", "React framework");
      const tagId = insertResult.lastInsertRowid as number;

      const updateResult = helpers.updateTag(
        "reactjs",
        "React JavaScript library",
        tagId,
      );
      expect(updateResult.changes).toBe(1);

      const updatedTag = helpers.findTagById(tagId);
      expect(updatedTag?.name).toBe("reactjs");
      expect(updatedTag?.description).toBe("React JavaScript library");
    });

    it("should delete a tag", () => {
      helpers.insertTag("temp", "Temporary tag");

      const result = helpers.deleteTag("temp");
      expect(result.changes).toBe(1);

      const tag = helpers.findTagByName("temp");
      expect(tag).toBeNull();
    });
  });

  describe("Directories", () => {
    it("should create a directory", () => {
      const result = helpers.insertDirectory("/test/path");
      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeNumber();
    });

    it("should find a directory by path", () => {
      helpers.insertDirectory("/test/project");
      const dir = helpers.findDirectoryByPath("/test/project");

      expect(dir).toBeDefined();
      expect(dir?.path).toBe("/test/project");
    });

    it("should list all directories", () => {
      helpers.insertDirectory("/project/a");
      helpers.insertDirectory("/project/b");

      const dirs = helpers.getAllDirectories();
      expect(dirs).toHaveLength(2);
    });

    it("should delete a directory", () => {
      helpers.insertDirectory("/temp/project");

      const result = helpers.deleteDirectory("/temp/project");
      expect(result.changes).toBe(1);

      const dir = helpers.findDirectoryByPath("/temp/project");
      expect(dir).toBeNull();
    });
  });

  describe("Directory Tags", () => {
    it("should link directory and tag", () => {
      const tagResult = helpers.insertTag("frontend", null);
      const dirResult = helpers.insertDirectory("/test/project");

      const linkResult = helpers.insertDirectoryTag(
        dirResult.lastInsertRowid as number,
        tagResult.lastInsertRowid as number,
      );
      expect(linkResult.changes).toBe(1);
    });

    it("should get tags for a directory", () => {
      const tag1 = helpers.insertTag("frontend", null);
      const tag2 = helpers.insertTag("react", null);
      const dir = helpers.insertDirectory("/test/project");

      const dirId = dir.lastInsertRowid as number;
      helpers.insertDirectoryTag(dirId, tag1.lastInsertRowid as number);
      helpers.insertDirectoryTag(dirId, tag2.lastInsertRowid as number);

      const tags = helpers.getDirectoryTags(dirId);
      expect(tags).toHaveLength(2);
      expect(tags.map((t) => t.name).sort()).toEqual(["frontend", "react"]);
    });

    it("should remove directory-tag link", () => {
      const tag = helpers.insertTag("temp", null);
      const dir = helpers.insertDirectory("/test/project");

      const dirId = dir.lastInsertRowid as number;
      const tagId = tag.lastInsertRowid as number;

      helpers.insertDirectoryTag(dirId, tagId);

      const result = helpers.deleteDirectoryTag(dirId, tagId);
      expect(result.changes).toBe(1);

      const tags = helpers.getDirectoryTags(dirId);
      expect(tags).toHaveLength(0);
    });
  });
});
