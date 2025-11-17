import { initTRPC } from "@trpc/server";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import { createDrizzleDbHelpers, type DbDrizzleHelpers, db } from "@/db/db";
import type * as schema from "@/db/schema";
import { dirsRouter } from "./dirs";
import { drizzleTagsRouter } from "./tags";

export type Context = {
  db: BunSQLiteDatabase<typeof schema>;
  helpers: DbDrizzleHelpers;
};

export const createContext = (): Context => {
  return {
    db,
    helpers: createDrizzleDbHelpers(db),
  };
};

export const t = initTRPC.context<Context>().create();

export const drizzleRouter = t.router({
  tags: drizzleTagsRouter,
  dir: dirsRouter,
});

export const rootRouter = drizzleRouter;

export type DrizzleRouter = typeof drizzleRouter;
