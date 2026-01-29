// drizzle.config.ts
import { defineConfig } from "drizzle-kit"   // ← this is still correct in 2025 docs

export default defineConfig({
  dialect: "postgresql",           // or "mysql", "sqlite"
  schema: "./src/db/schema.ts",    // adjust path to your schema file(s)
  out: "./drizzle",                // where migrations go

  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // optional nice additions:
  verbose: true,
  strict: true,
});