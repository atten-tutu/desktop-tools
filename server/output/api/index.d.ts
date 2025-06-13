import "./precede.ts";
declare const routes: import("hono/hono-base").HonoBase<import("./middleware.ts").MyEnv, import("hono/types").BlankSchema | import("hono/types").MergeSchemaPath<{
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
}, "/api/user"> | import("hono/types").MergeSchemaPath<{
    "/create": {
        $post: {
            input: {
                json: {
                    title: string;
                    content: string;
                    category?: "example1" | "example2" | "example3" | "example4" | "example5" | undefined;
                    tags?: string[] | undefined;
                    isPublic?: boolean | undefined;
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
    "/list": {
        $get: {
            input: {
                query: {
                    category?: "example1" | "example2" | "example3" | "example4" | "example5" | undefined;
                    page?: string | undefined;
                    pageSize?: string | undefined;
                };
            };
            output: {
                posts: {
                    id: number;
                    title: string;
                    content: string;
                    category: "example1" | "example2" | "example3" | "example4" | "example5";
                    tags: string[] | null;
                    isPublic: boolean;
                    authorId: number;
                    createdAt: string;
                    updatedAt: string;
                }[];
                total: number;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/detail": {
        $get: {
            input: {
                query: {
                    id: string;
                };
            };
            output: {
                id: number;
                title: string;
                content: string;
                category: "example1" | "example2" | "example3" | "example4" | "example5";
                tags: string[] | null;
                isPublic: boolean;
                authorId: number;
                createdAt: string;
                updatedAt: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/update": {
        $put: {
            input: {
                query: {
                    id: string;
                };
            } & {
                json: {
                    title?: string | undefined;
                    content?: string | undefined;
                    category?: "example1" | "example2" | "example3" | "example4" | "example5" | undefined;
                    tags?: string[] | undefined;
                    isPublic?: boolean | undefined;
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
            input: {
                query: {
                    id: string;
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
}, "/api/post">, "/api">;
export type AppType = typeof routes;
export {};
