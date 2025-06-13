import { z } from "zod";
import { logError } from "@/utils/log";
/** TODO:
 * When Zod V4 is ready for hono-openapi, z.string().xxx() will be deprecated.
 * Use z.xxx() instead.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url().trim(),
  DEV_FALLBACK_USER: z.string().base64().trim().optional(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
});

try {
  global.customEnv = envSchema.parse(process.env);
} catch (error) {
  logError("Invalid environment variables", error);
  process.exit(1);
}

import * as schema from "@/db/schema";
import * as relations from "@/db/relations";
import { NodePgDatabase } from "drizzle-orm/node-postgres";



type AppSchema = typeof schema & typeof relations;

declare global {
  /* eslint-disable no-var */
  var db: NodePgDatabase<AppSchema> | undefined;
  var customEnv: z.infer<typeof envSchema>;
  // Other Singleton Variables ...
  /* eslint-enable no-var */

  /* eslint-disable-next-line  @typescript-eslint/no-namespace*/
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

