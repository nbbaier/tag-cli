import { defineConfig } from "drizzle-kit";
import { getStatePath } from "@/utils/path";

const url = getStatePath();

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: { url },
  casing: "snake_case",
  migrations: {
    prefix: "timestamp",
    table: "__drizzle_migrations__",
  },
});
