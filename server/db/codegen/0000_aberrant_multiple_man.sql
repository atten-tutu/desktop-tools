CREATE SCHEMA "desktop_tools";
--> statement-breakpoint
CREATE TYPE "desktop_tools"."enum_example" AS ENUM('example1', 'example2', 'example3', 'example4', 'example5');--> statement-breakpoint
CREATE TYPE "desktop_tools"."user_role" AS ENUM('customer', 'agent', 'technician');--> statement-breakpoint
CREATE TABLE "desktop_tools"."posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(254) NOT NULL,
	"content" text NOT NULL,
	"category" "desktop_tools"."enum_example" DEFAULT 'example1' NOT NULL,
	"tags" jsonb,
	"is_public" boolean DEFAULT true NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "desktop_tools"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"email" varchar(128) NOT NULL,
	"password" varchar(128) NOT NULL,
	"avatar" varchar(256),
	"role" "desktop_tools"."user_role" DEFAULT 'customer' NOT NULL,
	"identity" varchar(64),
	"register_time" timestamp(3) DEFAULT now() NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "desktop_tools"."posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "desktop_tools"."users"("id") ON DELETE no action ON UPDATE no action;