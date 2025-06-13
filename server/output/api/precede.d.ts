import { z } from "zod";
/** TODO:
 * When Zod V4 is ready for hono-openapi, z.string().xxx() will be deprecated.
 * Use z.xxx() instead.
 */
declare const envSchema: z.ZodObject<{
    DATABASE_URL: z.ZodString;
    DEV_FALLBACK_USER: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production"]>>;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    NODE_ENV: "development" | "production";
    DEV_FALLBACK_USER?: string | undefined;
}, {
    DATABASE_URL: string;
    DEV_FALLBACK_USER?: string | undefined;
    NODE_ENV?: "development" | "production" | undefined;
}>;
import * as schema from "@/db/schema";
import * as relations from "@/db/relations";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
type AppSchema = typeof schema & typeof relations;
declare global {
    var db: NodePgDatabase<AppSchema> | undefined;
    var customEnv: z.infer<typeof envSchema>;
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {
        }
    }
}
export {};
