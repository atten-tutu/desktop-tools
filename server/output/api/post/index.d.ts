declare const postRouter: import("hono/hono-base").HonoBase<import("../middleware.ts").MyEnv & import("../middleware.ts").AuthEnv, {
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
}, "/">;
export { postRouter };
