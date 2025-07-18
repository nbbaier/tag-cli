import type { Database } from "bun:sqlite";
import { initTRPC } from "@trpc/server";
import { createDbHelpers, type DbHelpers, openDB } from "../db/index";
import { dirsRouter } from "./dirs";
import { tagsRouter } from "./tags";

export type Context = {
  db: Database;
  helpers: DbHelpers;
};

// Create context function
export function createContext(): Context {
  const db = openDB();
  const helpers = createDbHelpers(db);
  return { db, helpers };
}

const t = initTRPC.context<Context>().create();

export const rootRouter = t.router({
  tags: tagsRouter,
  dir: dirsRouter,
});

export type RootRouter = typeof rootRouter;
