import { initTRPC } from "@trpc/server";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { DbDrizzleHelpers } from "@/db/db";
import type * as schema from "@/db/schema";
import { dirsRouter } from "./dirs";
import { drizzleTagsRouter } from "./tags";

export type Context = {
  db: BunSQLiteDatabase<typeof schema>;
  helpers: DbDrizzleHelpers;
};

export const t = initTRPC.context<Context>().create();

export const drizzleRouter = t.router({
  tags: drizzleTagsRouter,
  dir: dirsRouter,
});

export type DrizzleRouter = typeof drizzleRouter;
