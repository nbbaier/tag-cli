import { initTRPC } from '@trpc/server';
import type { Database } from 'bun:sqlite';
import { openDB, createDbHelpers, type DbHelpers } from '../db/index.js';
import { tagsRouter } from './tags.js';
import { dirsRouter } from './dirs.js';

// Create context type
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

// Export router creation for use in sub-routers
export { t };

export const rootRouter = t.router({
  tags: tagsRouter,
  dir: dirsRouter,
});

export type RootRouter = typeof rootRouter;
