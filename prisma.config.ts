import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI operations (migrate/introspect) use the direct, non-pooled
    // connection; the running app uses DATABASE_URL via the adapter
    // in src/lib/db.ts instead.
    url: env("DIRECT_URL"),
  },
});
