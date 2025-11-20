import { existsSync, lstatSync, mkdirSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import replaceHomeDir from "replace-homedir";

/**
 * Default state directory path relative to home directory
 */
const DEFAULT_STATE_DIR_PATH = join(".local", "state", "tag-cli");

/**
 * Resolves a path to its canonical absolute form
 */
export function canonical(path: string): string {
  const resolved = resolve(path);

  if (!existsSync(resolved)) {
    throw new Error(`Path does not exist: ${path}`);
  }

  if (!lstatSync(resolved).isDirectory()) {
    throw new Error(`Path is not a directory: ${path}`);
  }

  return realpathSync(resolved);
}

/**
 * Validates that a path exists and is a directory
 */
export function validateDirectory(path: string): void {
  if (!existsSync(path)) {
    throw new Error(`Directory does not exist: ${path}`);
  }

  if (!lstatSync(path).isDirectory()) {
    throw new Error(`Path is not a directory: ${path}`);
  }
}

/**
 * Gets the path to the application state directory
 * Creates the directory if it doesn't exist
 */
export function getStateDir(): string {
  const stateDir =
    process.env.XDG_STATE_HOME || join(homedir(), DEFAULT_STATE_DIR_PATH);

  if (!existsSync(stateDir)) {
    mkdirSync(stateDir, { recursive: true });
  }

  return stateDir;
}

/**
 * Gets the path to the application database file
 * @param filename - Optional filename, defaults to "tag.db"
 */
export function getStatePath(filename = "tag.db"): string {
  const stateDir = getStateDir();
  return join(stateDir, filename);
}

/**
 * Replaces the home directory in a path with a tilde
 */
export function replaceHomedir(path: string): string {
  return replaceHomeDir(path);
}
