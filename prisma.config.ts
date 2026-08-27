import dotenv from "dotenv";
// Load .env first, then let .env.local override it — mirrors Next.js env
// precedence so the Prisma CLI (migrate/push/seed) targets the same database
// the app uses.
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});