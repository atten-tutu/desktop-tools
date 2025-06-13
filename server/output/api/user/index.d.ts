import "zod-openapi/extend";
declare const userRouter: import("hono/hono-base").HonoBase<import("../middleware.ts").MyEnv & import("../middleware.ts").AuthEnv, {
    "/info": {
        $get: {
            input: {};
            output: {
                id: number;
                name: string;
                nickname: string;
                avatar: string | null;
                role: "customer" | "agent" | "technician";
                email: string;
                identity: string | null;
                registerTime: string;
                level: number;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/create": {
        $post: {
            input: {
                json: {
                    name: string;
                    nickname: string;
                    email: string;
                    password: string;
                    avatar?: string | undefined;
                    identity?: string | undefined;
                    role?: "customer" | "agent" | "technician" | undefined;
                };
            };
            output: {
                id: number;
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/update": {
        $put: {
            input: {
                json: {
                    name?: string | undefined;
                    nickname?: string | undefined;
                    email?: string | undefined;
                    avatar?: string | undefined;
                    identity?: string | undefined;
                    role?: "customer" | "agent" | "technician" | undefined;
                };
            };
            output: {
                success: boolean;
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/delete": {
        $delete: {
            input: {};
            output: {
                success: boolean;
                message: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
export { userRouter };
