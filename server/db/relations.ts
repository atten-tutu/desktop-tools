import { relations } from 'drizzle-orm/relations';
import {
	posts,
	users,
} from './schema.ts';

// Define relations for users
export const usersRelations = relations(users, ({ many }) => ({
	posts: many(posts),
}));


// Define relations for posts
export const postsRelations = relations(
	posts,
	({ one }) => ({
		author: one(users, {
			fields: [posts.authorId],
			references: [users.id],
			relationName: 'author',
		}),
	}),
);