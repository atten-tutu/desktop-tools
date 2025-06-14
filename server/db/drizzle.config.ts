import { defineConfig } from "drizzle-kit";

import * as dotenv from "dotenv";
dotenv.config({ path: "../.env.local" });

export default defineConfig({
  dialect: "postgresql",
  out: "./db/codegen",
  schema: ["./db/schema.ts", "./db/relations.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["desktop_tools"],
  introspect: {
    casing: "camel",
  },
});
