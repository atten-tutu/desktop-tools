import { type ClientRequestOptions, type InferResponseType } from "hono/client";
declare const _api: {
    user: {
        info: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    user: {
        create: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    user: {
        update: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    user: {
        delete: import("hono/client").ClientRequest<{
            $delete: {
                input: {};
                output: {
                    success: boolean;
                    message: string;
                };
                outputFormat: "json";
                status: import("hono/utils/http-status").ContentfulStatusCode;
            };
        }>;
    };
} & {
    post: {
        create: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    post: {
        list: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    post: {
        detail: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    post: {
        update: import("hono/client").ClientRequest<{
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
        }>;
    };
} & {
    post: {
        delete: import("hono/client").ClientRequest<{
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
        }>;
    };
};
export declare const initClient: (url: string, args?: ClientRequestOptions) => typeof _api;
export type { InferRequestType, InferResponseType } from "hono/client";
type ApiClient = ReturnType<typeof initClient>;
export type UserType = InferResponseType<ApiClient["user"]["info"]["$get"]>;
export type PostType = InferResponseType<ApiClient["post"]["detail"]["$get"]>;
