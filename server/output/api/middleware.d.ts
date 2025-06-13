import type { Context } from "hono";
import { connectDB } from "@/utils/index.ts";
export declare function handleError(err: Error, c: Context): Response;
type BasicVariables = {
    db: ReturnType<typeof connectDB>;
    origin: string;
};
export interface MyEnv {
    Variables: BasicVariables;
}
export interface AuthEnv extends MyEnv {
    Variables: BasicVariables & {
        userId: number;
    };
}
export declare const authMiddleware: import("hono").MiddlewareHandler<AuthEnv, string, {}>;
export declare function xxxOnlyMiddleware(message?: string): import("hono").MiddlewareHandler<AuthEnv, string, {}>;
export declare const factory: import("hono/factory").Factory<MyEnv, string>;
export {};
