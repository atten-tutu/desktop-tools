import { zs } from "@/utils/tools.ts";
import * as schema from "@db/schema.ts";
import { eq } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import "zod-openapi/extend";
import { authMiddleware, factory } from "../middleware.ts";

// 定义用户创建的数据验证模式
const createUserSchema = z.object({
  name: z.string().min(1),
  nickname: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  avatar: z.string().optional(),
  role: z.enum(["customer", "agent", "technician"]).default("customer"),
  identity: z.string().optional(),
});

// 定义用户更新的数据验证模式
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  nickname: z.string().min(1).optional(),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  role: z.enum(["customer", "agent", "technician"]).optional(),
  identity: z.string().optional(),
});

const userRouter = factory
  .createApp()
  .use(authMiddleware)
  // 获取用户信息
  .get(
    "/info",
    describeRoute({
      description: "获取用户信息",
      tags: ["User"],
      responses: {
        200: {
          description: "用户信息",
          content: {
            "application/json": {
              schema: resolver(zs.users),
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;
      const [user] = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          nickname: schema.users.nickname,
          avatar: schema.users.avatar,
          role: schema.users.role,
          email: schema.users.email,
          identity: schema.users.identity,
          registerTime: schema.users.registerTime,
          level: schema.users.level,
        })
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      if (!user) {
        throw new HTTPException(404, {
          message: "用户不存在",
        });
      }
      return c.json({ ...user });
    },
  )
  // 创建用户
  .post(
    "/create",
    describeRoute({
      description: "创建新用户",
      tags: ["User"],
      responses: {
        200: {
          description: "创建成功",
          content: {
            "application/json": {
              schema: resolver(z.object({
                id: z.number(),
                message: z.string(),
              })),
            },
          },
        },
      },
    }),
    zValidator("json", createUserSchema),
    async (c) => {
      const db = c.get("db");
      const payload = c.req.valid("json");
      
      // 检查邮箱是否已存在
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, payload.email))
        .limit(1);
      
      if (existingUser.length > 0) {
        throw new HTTPException(400, {
          message: "该邮箱已被注册",
        });
      }

      // 创建用户
      const [user] = await db
        .insert(schema.users)
        .values({
          name: payload.name,
          nickname: payload.nickname,
          email: payload.email,
          password: payload.password, // 注意：实际应用中应该对密码进行加密
          avatar: payload.avatar,
          role: payload.role,
          identity: payload.identity,
          registerTime: new Date().toISOString(),
        })
        .returning({ id: schema.users.id });

      return c.json({
        id: user.id,
        message: "用户创建成功",
      });
    },
  )
  // 更新用户信息
  .put(
    "/update",
    describeRoute({
      description: "更新用户信息",
      tags: ["User"],
      responses: {
        200: {
          description: "更新成功",
          content: {
            "application/json": {
              schema: resolver(z.object({
                success: z.boolean(),
                message: z.string(),
              })),
            },
          },
        },
      },
    }),
    zValidator("json", updateUserSchema),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;
      const payload = c.req.valid("json");

      await db
        .update(schema.users)
        .set({
          ...payload,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, userId));

      return c.json({
        success: true,
        message: "用户信息更新成功",
      });
    },
  )
  // 删除用户
  .delete(
    "/delete",
    describeRoute({
      description: "删除用户",
      tags: ["User"],
      responses: {
        200: {
          description: "删除成功",
          content: {
            "application/json": {
              schema: resolver(z.object({
                success: z.boolean(),
                message: z.string(),
              })),
            },
          },
        },
      },
    }),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;

      await db
        .delete(schema.users)
        .where(eq(schema.users.id, userId));

      return c.json({
        success: true,
        message: "用户删除成功",
      });
    },
  )

export { userRouter };
