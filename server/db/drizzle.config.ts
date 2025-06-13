import { defineConfig } from "drizzle-kit";


export default defineConfig({
  dialect: "postgresql",
  out: "./db/codegen",
  schema: ["./db/schema.ts", "./db/relations.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["tentix"],
  introspect: {
    casing: "camel",
  },
});
