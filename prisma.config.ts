import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_DATABASE_URL: used by Prisma CLI (migrate/push)
    // Bypasses pgBouncer — required for DDL operations
    url: env("DIRECT_DATABASE_URL"),
  },
});
