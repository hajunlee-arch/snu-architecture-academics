import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const academicDocuments = sqliteTable('academic_documents', {
 key: text('key').primaryKey(),
 content: text('content').notNull(),
 revision: integer('revision').notNull().default(1),
 updatedAt: text('updated_at').notNull(),
 updatedBy: text('updated_by').notNull(),
});
