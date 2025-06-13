/* eslint-disable no-console */
import { z } from "zod";
import type { Context } from "hono";
import {
  connectDB,
  ValidationError,
  getOrigin,
} from "@/utils/index.ts";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { styleText } from "util";
import { createFactory, createMiddleware } from "hono/factory";


function printErrorProp(title: string, content: string | undefined) {
  console.error(
    styleText(["bgRed", "white", "bold"], title),
    styleText("yellow", content ?? ""),
  );
}

function printError(err: Error, c: Context) {
  if (global.customEnv.NODE_ENV === "production") {
    console.error(`Error from ${c.req.path}:`);
    console.error(err);
    return;
  }
  const error = styleText("red", `From ${c.req.path}:\n `);
  console.error(error);
  printErrorProp("Cause: ", err.cause?.toString());
  printErrorProp("Message: ", err.message);
  printErrorProp("Stack: ", err.stack);
}

export function handleError(err: Error, c: Context): Response {
  let code: ContentfulStatusCode = 500;
  let message = "Something went wrong, please try again later.";
  let stack = err.stack;
  const cause = err.cause;
  printError(err, c);
  stack = err.stack?.split("\n").at(0);
  if (err instanceof HTTPException) {
    code = err.status;
    message = err.message;
    stack = err.stack;
  }
  if (err instanceof z.ZodError) {
    const firstError = err.errors[0]!;
    code = 422;
    message = `\`${firstError.path}\`: ${firstError.message}`;
    stack = undefined;
  }
  if (err instanceof ValidationError) {
    code = 422;
    message = err.message;
  }
  return c.json(
    {
      code,
      timeUTC: new Date().toUTCString(),
      message,
      cause,
      stack,
    },
    { status: code },
  );
}

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



export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    let authHeader = c.req.header("Authorization");
    if (
      global.customEnv.NODE_ENV !== "production" &&
      typeof authHeader !== "string"
    ) {
      authHeader = global.customEnv.DEV_FALLBACK_USER;
      console.warn(
        styleText(["bgYellow", "black", "bold"], "Warning"),
        styleText(
          "yellow",
          `Authorization header is not found, using fallback user for development: ${authHeader}`,
        ),
      );
    }
    if (!authHeader) {
      console.error("Unauthorized", authHeader);
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    // TODO: 验证token
    // if (parseInt(expireTime) < Date.now() / 1000) {
    //   throw new HTTPException(401, { message: "token expired" });
    // }
    c.set("userId", 1);
    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(401, { message: "Unauthorized" });
  }
});

export function xxxOnlyMiddleware(message: string = "Forbidden. Only staff can access this resource.") {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const booleanVar = true;
    if (!booleanVar && global.customEnv.NODE_ENV === "production") {
      throw new HTTPException(403, { message });
    }
    await next();
  });
}
export const factory = createFactory<MyEnv>({
  initApp: (app) => {
    app.use(async (c, next) => {
      const db = connectDB();
      c.set("db", db);
      c.set("origin", getOrigin(c));
      // use a function to pass the variable, because sometimes it needs to refresh
      await next();
    });
  },
});
