import { realpathSync, existsSync, lstatSync } from "fs";
import { resolve } from "path";

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
