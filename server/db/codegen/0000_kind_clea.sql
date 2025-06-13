CREATE SCHEMA "tentix";
--> statement-breakpoint
CREATE TYPE "tentix"."enum_example" AS ENUM('example1', 'example2', 'example3', 'example4', 'example5');--> statement-breakpoint
CREATE TYPE "tentix"."user_role" AS ENUM('customer', 'agent', 'technician');--> statement-breakpoint
CREATE TABLE "tentix"."posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(254) NOT NULL,
	"content" text NOT NULL,
	"category" "tentix"."enum_example" DEFAULT 'example1' NOT NULL,
	"tags" jsonb,
	"is_public" boolean DEFAULT true NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tentix"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"nickname" varchar(64) NOT NULL,
	"email" varchar(128) NOT NULL,
	"password" varchar(128) NOT NULL,
	"avatar" varchar(256),
	"role" "tentix"."user_role" DEFAULT 'customer' NOT NULL,
	"identity" varchar(64),
	"register_time" timestamp(3) DEFAULT now() NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"updated_at" timestamp(3) DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "tentix"."posts" ADD CONSTRAINT "posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "tentix"."users"("id") ON DELETE no action ON UPDATE no action;