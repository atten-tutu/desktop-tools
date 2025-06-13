/* eslint-disable no-console */
import { describeRoute } from "hono-openapi";
import { factory } from "../middleware.ts";

import v8 from "node:v8";

const playgroundRouter = factory
  .createApp()
  .use(async (c, next) => {
    if (process.env.NODE_ENV !== "production") {
      await next();
    } else {
      return c.json({ error: "Not for production use." }, 403);
    }
  })
  .get(
    "/snapshot",
    describeRoute({
      tags: ["Playground"],
    }),
    async (c) => {
      const snapshotPath = v8.writeHeapSnapshot();
      console.log(`Heap snapshot written to: ${snapshotPath}`);
      return c.json({ success: true, snapshotPath });
    },
  )

export { playgroundRouter };
