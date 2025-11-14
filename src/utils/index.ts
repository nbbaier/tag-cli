import { TRPCError } from "@trpc/server";
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
export function filterUndefined<T>(arr: (T | undefined)[]): T[] {
  return arr.filter((item): item is T => item !== undefined);
}
