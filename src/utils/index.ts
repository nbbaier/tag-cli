import { error as errorLog } from "./format";

/**
 * Handles errors by logging them and optionally throwing
 */
export function handleError(err: unknown): never {
  if (err instanceof Error) {
    errorLog(err.message);
  } else {
    errorLog(String(err));
  }
  process.exit(1);
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Filters out undefined values from an array
 */
export function filterUndefined<T>(arr: (T | undefined)[]): T[];
/**
 * Filters out undefined values from an object
 */
export function filterUndefined<T extends Record<string, unknown>>(
  obj: T,
): Partial<T>;
export function filterUndefined<T>(
  input: (T | undefined)[] | Record<string, unknown>,
): T[] | Partial<T> {
  if (Array.isArray(input)) {
    return input.filter((item): item is T => item !== undefined);
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}
