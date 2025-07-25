import { db } from './db/index';
import { projects, projectCosts, costLineItems, costCategories } from './db/schema';
import { eq, desc, and } from 'drizzle-orm';
import type { Project, ProjectCost, CostLineItem, CostCategory } from './db/schema';

export interface ProjectWithCosts extends Project {
	costs: Array<ProjectCost & { lineItem: CostLineItem & { category: CostCategory } }>;
}

export interface CostBreakdown {
	categoryName: string;
	categoryId: number;
	items: Array<{
		id: number;
		name: string;
		accountCode: string | null;
		amount: number;
	}>;
	total: number;
}

export interface ProjectCalculations {
	bomTotal: number;
	laborTotal: number;
	totalCogs: number;
	grossMargin: number;
	netIncome: number;
	perWattCosts: {
		bomPerWatt: number;
		laborPerWatt: number;
		totalCogsPerWatt: number;
		grossMarginPerWatt: number;
		netIncomePerWatt: number;
	};
}

export class ProjectService {
	async getAllProjects(): Promise<Project[]> {
		return await db.select().from(projects).orderBy(desc(projects.createdAt));
	}

	async getProjectById(id: number): Promise<ProjectWithCosts | null> {
		const project = await db.select().from(projects).where(eq(projects.id, id)).limit(1);

		if (!project.length) return null;

		const costs = await db
			.select()
			.from(projectCosts)
			.innerJoin(costLineItems, eq(projectCosts.lineItemId, costLineItems.id))
			.innerJoin(costCategories, eq(costLineItems.categoryId, costCategories.id))
			.where(eq(projectCosts.projectId, id))
			.orderBy(costCategories.sortOrder, costLineItems.sortOrder);

		const formattedCosts = costs.map((row) => ({
			id: row.project_costs.id,
			projectId: row.project_costs.projectId,
			lineItemId: row.project_costs.lineItemId,
			amount: row.project_costs.amount,
			notes: row.project_costs.notes,
			createdAt: row.project_costs.createdAt,
			updatedAt: row.project_costs.updatedAt,
			lineItem: {
				id: row.cost_line_items.id,
				categoryId: row.cost_line_items.categoryId,
				accountCode: row.cost_line_items.accountCode,
				name: row.cost_line_items.name,
				description: row.cost_line_items.description,
				isActive: row.cost_line_items.isActive,
				sortOrder: row.cost_line_items.sortOrder,
				category: {
					id: row.cost_categories.id,
					name: row.cost_categories.name,
					description: row.cost_categories.description,
					sortOrder: row.cost_categories.sortOrder
				}
			}
		}));

		return {
			...project[0],
			costs: formattedCosts
		};
	}

	async updateProjectCost(projectId: number, lineItemId: number, amount: number): Promise<void> {
		// Check if cost already exists
		const existing = await db
			.select()
			.from(projectCosts)
			.where(and(eq(projectCosts.projectId, projectId), eq(projectCosts.lineItemId, lineItemId)))
			.limit(1);

		if (existing.length > 0) {
			// Update existing cost
			await db
				.update(projectCosts)
				.set({ amount, updatedAt: new Date().toISOString() })
				.where(and(eq(projectCosts.projectId, projectId), eq(projectCosts.lineItemId, lineItemId)));
		} else {
			// Insert new cost
			await db.insert(projectCosts).values({ projectId, lineItemId, amount });
		}
	}

	async updateProjectPrice(projectId: number, netSystemPrice: number): Promise<void> {
		await db
			.update(projects)
			.set({ netSystemPrice, updatedAt: new Date().toISOString() })
			.where(eq(projects.id, projectId));
	}

	getCostBreakdown(projectWithCosts: ProjectWithCosts): CostBreakdown[] {
		const breakdownMap = new Map<number, CostBreakdown>();

		projectWithCosts.costs.forEach((cost) => {
			const { category } = cost.lineItem;

			if (!breakdownMap.has(category.id)) {
				breakdownMap.set(category.id, {
					categoryName: category.name,
					categoryId: category.id,
					items: [],
					total: 0
				});
			}

			const breakdown = breakdownMap.get(category.id)!;
			breakdown.items.push({
				id: cost.lineItem.id,
				name: cost.lineItem.name,
				accountCode: cost.lineItem.accountCode,
				amount: cost.amount
			});
			breakdown.total += cost.amount;
		});

		return Array.from(breakdownMap.values()).sort((a, b) => a.categoryId - b.categoryId);
	}

	calculateProjectMetrics(projectWithCosts: ProjectWithCosts): ProjectCalculations {
		const breakdown = this.getCostBreakdown(projectWithCosts);
		const watts = projectWithCosts.systemSizeKw * 1000;

		// Get category totals
		const bomTotal = breakdown.find((b) => b.categoryName === 'BOM')?.total || 0;
		const laborTotal = breakdown.find((b) => b.categoryName === 'Labor')?.total || 0;
		const commissionTotal = breakdown.find((b) => b.categoryName === 'Commission')?.total || 0;
		const adminTotal = breakdown.find((b) => b.categoryName === 'Admin')?.total || 0;

		const totalCogs = bomTotal + laborTotal;
		const grossMargin = projectWithCosts.netSystemPrice - totalCogs;
		const netIncome = grossMargin - commissionTotal - adminTotal;

		return {
			bomTotal,
			laborTotal,
			totalCogs,
			grossMargin,
			netIncome,
			perWattCosts: {
				bomPerWatt: bomTotal / watts,
				laborPerWatt: laborTotal / watts,
				totalCogsPerWatt: totalCogs / watts,
				grossMarginPerWatt: grossMargin / watts,
				netIncomePerWatt: netIncome / watts
			}
		};
	}

	async getAllCostLineItems(): Promise<Array<CostLineItem & { category: CostCategory }>> {
		const results = await db
			.select()
			.from(costLineItems)
			.innerJoin(costCategories, eq(costLineItems.categoryId, costCategories.id))
			.where(eq(costLineItems.isActive, true))
			.orderBy(costCategories.sortOrder, costLineItems.sortOrder);

		return results.map((row) => ({
			...row.cost_line_items,
			category: row.cost_categories
		}));
	}
}
