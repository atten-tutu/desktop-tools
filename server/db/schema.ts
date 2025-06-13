import { sql } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgSchema,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import {
  exampleEnumArray
} from "../utils/const.ts";
export const tentix = pgSchema("tentix");

export const enumExample = tentix.enum(
  "enum_example",
  exampleEnumArray,
);

// 用户角色枚举
export const userRoleEnum = tentix.enum("user_role", ["customer", "agent", "technician"]);

// Core tables with no dependencies
export const users = tentix.table(
  "users",
  {
    id: serial("id").primaryKey().notNull(),
    name: varchar("name", { length: 64 }).notNull(),
    nickname: varchar("nickname", { length: 64 }).notNull(),
    email: varchar("email", { length: 128 }).notNull(),
    password: varchar("password", { length: 128 }).notNull(),
    avatar: varchar("avatar", { length: 256 }),
    role: userRoleEnum("role").default("customer").notNull(),
    identity: varchar("identity", { length: 64 }),
    registerTime: timestamp("register_time", { precision: 3, mode: "string" })
      .defaultNow()
      .notNull(),
    level: smallint("level").default(1).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3, mode: "string" })
      .defaultNow()
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    unique("users_email_key").on(table.email),
  ],
);

export const posts = tentix.table("posts", {
  id: serial("id").primaryKey().notNull(),
  title: varchar("title", { length: 254 }).notNull(),
  content: text("content").notNull(),
  category: enumExample("category").default("example1").notNull(),
  tags: jsonb("tags").$type<string[]>(),
  isPublic: boolean("is_public").default(true).notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "string" })
    .defaultNow()
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`)
    .notNull(),
}, (table) => [
  foreignKey({
    columns: [table.authorId],
    foreignColumns: [users.id],
    name: "posts_author_id_users_id_fk",
  }),
]);
