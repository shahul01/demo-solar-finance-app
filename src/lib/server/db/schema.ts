import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Projects table (main entity)
export const projects = sqliteTable('projects', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	customerName: text('customer_name').notNull(),
	systemSizeKw: real('system_size_kw').notNull(),
	netSystemPrice: real('net_system_price').notNull(),
	scheduledDate: text('scheduled_date'), // ISO date string
	installDate: text('install_date'), // ISO date string
	salesOffice: text('sales_office'),
	status: text('status').default('scheduled'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Cost categories (BOM, Labor, etc.)
export const costCategories = sqliteTable('cost_categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description'),
	sortOrder: integer('sort_order').default(0)
});

// Cost line items (specific cost types)
export const costLineItems = sqliteTable('cost_line_items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	categoryId: integer('category_id').references(() => costCategories.id),
	accountCode: text('account_code').unique(),
	name: text('name').notNull(),
	description: text('description'),
	isActive: integer('is_active', { mode: 'boolean' }).default(true),
	sortOrder: integer('sort_order').default(0)
});

// Project costs (actual cost data per project)
export const projectCosts = sqliteTable('project_costs', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
	lineItemId: integer('line_item_id').references(() => costLineItems.id),
	amount: real('amount').notNull().default(0),
	notes: text('notes'),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Budget targets (for comparison)
export const budgetTargets = sqliteTable('budget_targets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	lineItemId: integer('line_item_id').references(() => costLineItems.id),
	targetPerWatt: real('target_per_watt').notNull(),
	effectiveDate: text('effective_date').default(sql`CURRENT_DATE`),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// TypeScript types
export type Project = typeof projects.$inferSelect;
export type ProjectInsert = typeof projects.$inferInsert;
export type CostCategory = typeof costCategories.$inferSelect;
export type CostLineItem = typeof costLineItems.$inferSelect;
export type ProjectCost = typeof projectCosts.$inferSelect;
export type BudgetTarget = typeof budgetTargets.$inferSelect;
