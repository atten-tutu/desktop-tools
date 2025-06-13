import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@db/schema.ts";
import * as relations from "@db/relations.ts";
import { createSelectSchema } from "drizzle-zod";

import type { Context } from "hono";


export function connectDB() {
  const pool = new Pool({
    connectionString: global.customEnv.DATABASE_URL,
  });
  const db = drizzle({ client: pool, schema: { ...schema, ...relations } });
  if (!global.db) global.db = db;
  return global.db;
}

export function camelToKebab(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

export const zs = {
  users: createSelectSchema(schema.users),
  posts: createSelectSchema(schema.posts),
};

export function getOrigin(c: Context) {
  if (global.customEnv.NODE_ENV !== "production") {
    return "http://localhost:5173";
  }
  const url = new URL(c.req.url);
  url.protocol = "https:";
  return url.origin;
}
