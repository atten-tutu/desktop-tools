declare const playgroundRouter: import("hono/hono-base").HonoBase<import("../middleware.ts").MyEnv, {
    "/snapshot": {
        $get: {
            input: {};
            output: {
                success: boolean;
                snapshotPath: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
export { playgroundRouter };
