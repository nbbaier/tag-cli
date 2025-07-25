import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonical, validateDirectory } from "../src/util/path";

describe("Path utilities", () => {
  const testDir = join(tmpdir(), `tag-cli-path-test-${Date.now()}`);

  beforeAll(() => {
    mkdirSync(testDir, { recursive: true });
  });

  afterAll(() => {
    try {
      rmSync(testDir, { recursive: true });
    } catch {}
  });

  describe("canonical", () => {
    it("should resolve current directory", () => {
      const result = canonical(".");
      expect(result).toBeString();
      expect(result).toStartWith("/");
    });

    it("should resolve absolute paths", () => {
      const result = canonical(testDir);
      expect(result).toContain("tag-cli-path-test");
      expect(result).toStartWith("/");
    });

    it("should throw for non-existent paths", () => {
      expect(() => canonical("/non/existent/path")).toThrow(
        "Path does not exist",
      );
    });

    it("should throw for files (not directories)", () => {
      const filePath = join(testDir, "test-file.txt");
      writeFileSync(filePath, "test content");

      expect(() => canonical(filePath)).toThrow("Path is not a directory");
    });
  });

  describe("validateDirectory", () => {
    it("should validate existing directory", () => {
      expect(() => validateDirectory(testDir)).not.toThrow();
    });

    it("should throw for non-existent directory", () => {
      expect(() => validateDirectory("/non/existent")).toThrow(
        "Directory does not exist",
      );
    });

    it("should throw for files", () => {
      const filePath = join(testDir, "another-file.txt");
      writeFileSync(filePath, "test");

      expect(() => validateDirectory(filePath)).toThrow(
        "Path is not a directory",
      );
    });
  });
});
