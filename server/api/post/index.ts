import {
  zs,
} from "@/utils/index.ts";
import * as schema from "@db/schema.ts";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { authMiddleware, factory } from "../middleware.ts";
import { exampleEnumArray } from "@/utils/const.ts";

// 定义帖子创建的数据验证模式
const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(exampleEnumArray).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
});

// 定义帖子更新的数据验证模式
const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(exampleEnumArray).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
});

const postRouter = factory
  .createApp()
  .use(authMiddleware)
  // 创建帖子
  .post(
    "/create",
    describeRoute({
      description: "创建新帖子",
      tags: ["Post"],
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
    zValidator("json", createPostSchema),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;
      const payload = c.req.valid("json");

      const [post] = await db
        .insert(schema.posts)
        .values({
          title: payload.title,
          content: payload.content,
          category: payload.category,
          tags: payload.tags,
          isPublic: payload.isPublic,
          authorId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning({ id: schema.posts.id });

      return c.json({
        id: post.id,
        message: "帖子创建成功",
      });
    },
  )
  // 获取帖子列表
  .get(
    "/list",
    describeRoute({
      description: "获取帖子列表",
      tags: ["Post"],
      responses: {
        200: {
          description: "帖子列表",
          content: {
            "application/json": {
              schema: resolver(z.object({
                posts: z.array(zs.posts),
                total: z.number(),
              })),
            },
          },
        },
      },
    }),
    zValidator(
      "query",
      z.object({
        page: z.string().optional().default("1").transform(Number),
        pageSize: z.string().optional().default("10").transform(Number),
        category: z.enum(exampleEnumArray).optional(),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { page, pageSize, category } = c.req.valid("query");
      const userId = c.var.userId;

      const where = and(
        eq(schema.posts.isPublic, true),
        category ? eq(schema.posts.category, category) : undefined,
      );

      const [posts, total] = await Promise.all([
        db
          .select()
          .from(schema.posts)
          .where(where)
          .orderBy(desc(schema.posts.createdAt))
          .limit(pageSize)
          .offset((page - 1) * pageSize),
        db
          .select({ count: sql<number>`count(*)` })
          .from(schema.posts)
          .where(where),
      ]);

      return c.json({
        posts,
        total: total[0].count,
      });
    },
  )
  // 获取帖子详情
  .get(
    "/detail",
    describeRoute({
      description: "获取帖子详情",
      tags: ["Post"],
      responses: {
        200: {
          description: "帖子详情",
          content: {
            "application/json": {
              schema: resolver(zs.posts),
            },
          },
        },
      },
    }),
    zValidator(
      "query",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const { id } = c.req.valid("query");
      const userId = c.var.userId;

      const post = await db
        .select()
        .from(schema.posts)
        .where(
          and(
            eq(schema.posts.id, parseInt(id)),
            or(
              eq(schema.posts.isPublic, true),
              eq(schema.posts.authorId, userId),
            ),
          ),
        )
        .limit(1);

      if (!post.length) {
        throw new HTTPException(404, {
          message: "帖子不存在",
        });
      }

      return c.json(post[0]);
    },
  )
  // 更新帖子
  .put(
    "/update",
    describeRoute({
      description: "更新帖子",
      tags: ["Post"],
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
    zValidator(
      "query",
      z.object({
        id: z.string(),
      }),
    ),
    zValidator("json", updatePostSchema),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;
      const { id } = c.req.valid("query");
      const payload = c.req.valid("json");

      const post = await db
        .select()
        .from(schema.posts)
        .where(
          and(
            eq(schema.posts.id, parseInt(id)),
            eq(schema.posts.authorId, userId),
          ),
        )
        .limit(1);

      if (!post.length) {
        throw new HTTPException(404, {
          message: "帖子不存在或无权修改",
        });
      }

      await db
        .update(schema.posts)
        .set({
          ...payload,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.posts.id, parseInt(id)));

      return c.json({
        success: true,
        message: "帖子更新成功",
      });
    },
  )
  // 删除帖子
  .delete(
    "/delete",
    describeRoute({
      description: "删除帖子",
      tags: ["Post"],
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
    zValidator(
      "query",
      z.object({
        id: z.string(),
      }),
    ),
    async (c) => {
      const db = c.get("db");
      const userId = c.var.userId;
      const { id } = c.req.valid("query");

      const post = await db
        .select()
        .from(schema.posts)
        .where(
          and(
            eq(schema.posts.id, parseInt(id)),
            eq(schema.posts.authorId, userId),
          ),
        )
        .limit(1);

      if (!post.length) {
        throw new HTTPException(404, {
          message: "帖子不存在或无权删除",
        });
      }

      await db
        .delete(schema.posts)
        .where(eq(schema.posts.id, parseInt(id)));

      return c.json({
        success: true,
        message: "帖子删除成功",
      });
    },
  );

export { postRouter };
