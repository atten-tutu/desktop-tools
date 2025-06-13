import "./precede.ts";
import { serve } from '@hono/node-server'
import { Scalar } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";
import { logger } from "hono/logger";
import { factory, handleError } from "./middleware.ts";
import { postRouter } from "./post/index.ts";
import { userRouter } from "./user/index.ts";
import { playgroundRouter } from "./playground/index.ts";
import { logInfo, logStart } from '@/utils/log.ts';

const app = factory.createApp();

app.onError(handleError);
app.use("*", logger());
app.use(
  "/api/openapi.json",
  openAPISpecs(app, {
    exclude: process.env.NODE_ENV === "production" ? ["/api/playground"] : [],
    documentation: {
      info: {
        title: "Electron API",
        version: "1.0.0",
        description: "API for Electron",
      },
      tags: [
        {
          name: "User",
          description: "User related endpoints",
        },
        {
          name: "Ticket",
          description: "Ticket related endpoints",
        },
        {
          name: "Auth",
        },
        {
          name: "Playground",
          description: "Test endpoint. Not for production use.",
        },
      ],
      servers: [
        {
          url: "/",
          description: "Current server",
        },
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            description:
              "Bearer token for authentication. ...",
          },
        },
      },
    },
  }),
);
app.get(
  "/api/reference",
  Scalar({
    url: "/api/openapi.json",
    isEditable: false,
    hideClientButton: true,
  }),
);
app.get("/health", (c) => c.json({ status: "ok" }));

const routes = app // RPC routes
  .basePath("/api")
  .route("/user", userRouter)
  .route("/post", postRouter)

if (global.customEnv.NODE_ENV === "development") {
  routes.route("/playground", playgroundRouter);
}

export type AppType = typeof routes;

const server = serve(app)

logStart("Server started on http://localhost:3000");
logInfo("API Documentation: http://localhost:3000/api/reference");

// graceful shutdown
process.on("SIGINT", () => {
  server.close()
  process.exit(0)
})
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
})