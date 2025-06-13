export declare const usersRelations: import("drizzle-orm").Relations<"users", {
    posts: import("drizzle-orm").Many<"posts">;
}>;
export declare const postsRelations: import("drizzle-orm").Relations<"posts", {
    author: import("drizzle-orm").One<"users", true>;
}>;
