import { db } from './index.js';
import { projects, costCategories, costLineItems, projectCosts, budgetTargets } from './schema.js';

export async function seedDatabase() {
	console.log('Seeding database...');

	// Clear existing data
	await db.delete(projectCosts);
	await db.delete(budgetTargets);
	await db.delete(costLineItems);
	await db.delete(costCategories);
	await db.delete(projects);

	// Seed cost categories
	const categoryResults = await db
		.insert(costCategories)
		.values([
			{ id: 1, name: 'BOM', description: 'Bill of Materials', sortOrder: 1 },
			{ id: 2, name: 'Labor', description: 'Labor and Installation Costs', sortOrder: 2 },
			{ id: 3, name: 'Fees', description: 'Permits and Administrative Fees', sortOrder: 3 },
			{ id: 4, name: 'Commission', description: 'Sales Commission', sortOrder: 4 },
			{ id: 5, name: 'Admin', description: 'General & Administrative', sortOrder: 5 }
		])
		.returning();

	// Seed cost line items
	await db.insert(costLineItems).values([
		// BOM items
		{ id: 1, categoryId: 1, accountCode: '5322', name: 'Modules (Panels)', sortOrder: 1 },
		{ id: 2, categoryId: 1, accountCode: '5323', name: 'Inverters/Optimizers', sortOrder: 2 },
		{ id: 3, categoryId: 1, accountCode: '5324', name: 'Racking', sortOrder: 3 },
		{ id: 4, categoryId: 1, accountCode: '5329', name: 'Extended Warranty', sortOrder: 4 },
		{ id: 5, categoryId: 1, accountCode: '5325', name: 'BOS (Balance of System)', sortOrder: 5 },
		// Labor items
		{ id: 6, categoryId: 2, accountCode: '5331', name: 'Site Survey Costs', sortOrder: 1 },
		{ id: 7, categoryId: 2, accountCode: '5333', name: 'Permitting Fees', sortOrder: 2 },
		{ id: 8, categoryId: 2, accountCode: '5340', name: 'CAD, Design, & Engineering', sortOrder: 3 },
		{ id: 9, categoryId: 2, accountCode: '5336', name: 'Inspection Fees', sortOrder: 4 },
		{
			id: 10,
			categoryId: 2,
			accountCode: '5337',
			name: 'Interconnection (NEMPTO) Fees',
			sortOrder: 5
		},
		{ id: 11, categoryId: 2, accountCode: null, name: 'Tier 2 Insurance', sortOrder: 6 },
		{ id: 12, categoryId: 2, accountCode: null, name: 'Direct Labor', sortOrder: 7 },
		{ id: 13, categoryId: 2, accountCode: null, name: 'Field Ops KW Pay', sortOrder: 8 },
		// Fees
		{ id: 14, categoryId: 3, accountCode: null, name: 'City Permits', sortOrder: 1 },
		{ id: 15, categoryId: 3, accountCode: null, name: 'Utility Connection', sortOrder: 2 },
		// Commission & Admin
		{ id: 16, categoryId: 4, accountCode: null, name: 'Sales Commission', sortOrder: 1 },
		{ id: 17, categoryId: 5, accountCode: null, name: 'General & Administrative', sortOrder: 1 }
	]);

	// Seed sample projects
	await db.insert(projects).values([
		{
			id: 1,
			customerName: 'Ricki Kern',
			systemSizeKw: 4.05,
			netSystemPrice: 20950.0,
			scheduledDate: '2025-07-24',
			salesOffice: 'Bontrager - Cincinnati 2025'
		},
		{
			id: 2,
			customerName: 'Jerome Richmond',
			systemSizeKw: 6.885,
			netSystemPrice: 24032.0,
			scheduledDate: '2025-07-24',
			salesOffice: 'Bontrager - Cincinnati 2025'
		},
		{
			id: 3,
			customerName: 'Eli Ezrow',
			systemSizeKw: 14.175,
			netSystemPrice: 48195.0,
			scheduledDate: '2025-07-25',
			salesOffice: 'Bontrager - Cincinnati 2025'
		},
		{
			id: 4,
			customerName: 'Robert Brown',
			systemSizeKw: 5.67,
			netSystemPrice: 30593.0,
			scheduledDate: '2025-07-24',
			salesOffice: 'Molina - KC 2025'
		},
		{
			id: 5,
			customerName: 'Kyle Bader',
			systemSizeKw: 12.96,
			netSystemPrice: 46972.0,
			scheduledDate: '2025-07-24',
			salesOffice: 'Stevens - Iowa 2025'
		}
	]);

	// Seed project costs for Ricki Kern project (ID: 1)
	await db.insert(projectCosts).values([
		// BOM costs
		{ projectId: 1, lineItemId: 1, amount: 3353.0 }, // Modules
		{ projectId: 1, lineItemId: 2, amount: 0.0 }, // Inverters
		{ projectId: 1, lineItemId: 3, amount: 0.0 }, // Racking
		{ projectId: 1, lineItemId: 4, amount: 0.0 }, // Extended Warranty
		{ projectId: 1, lineItemId: 5, amount: 527.0 }, // BOS
		// Labor costs
		{ projectId: 1, lineItemId: 6, amount: 0.0 }, // Site Survey
		{ projectId: 1, lineItemId: 7, amount: 230.0 }, // Permitting
		{ projectId: 1, lineItemId: 8, amount: 0.0 }, // CAD Design
		{ projectId: 1, lineItemId: 9, amount: 125.0 }, // Inspection
		{ projectId: 1, lineItemId: 10, amount: 0.0 }, // Interconnection
		// Commission & Admin
		{ projectId: 1, lineItemId: 16, amount: 5599.0 }, // Commission
		{ projectId: 1, lineItemId: 17, amount: 3312.0 } // G&A
	]);

	// Seed some project costs for other projects (basic data)
	await db.insert(projectCosts).values([
		// Jerome Richmond (ID: 2) - basic costs
		{ projectId: 2, lineItemId: 1, amount: 5500.0 }, // Modules
		{ projectId: 2, lineItemId: 5, amount: 800.0 }, // BOS
		{ projectId: 2, lineItemId: 7, amount: 300.0 }, // Permitting
		{ projectId: 2, lineItemId: 9, amount: 150.0 }, // Inspection
		{ projectId: 2, lineItemId: 16, amount: 4200.0 }, // Commission
		{ projectId: 2, lineItemId: 17, amount: 2800.0 }, // G&A

		// Eli Ezrow (ID: 3) - basic costs
		{ projectId: 3, lineItemId: 1, amount: 11000.0 }, // Modules
		{ projectId: 3, lineItemId: 5, amount: 1600.0 }, // BOS
		{ projectId: 3, lineItemId: 7, amount: 450.0 }, // Permitting
		{ projectId: 3, lineItemId: 9, amount: 200.0 }, // Inspection
		{ projectId: 3, lineItemId: 16, amount: 8500.0 }, // Commission
		{ projectId: 3, lineItemId: 17, amount: 5200.0 } // G&A
	]);

	// Seed budget targets (per watt targets)
	await db.insert(budgetTargets).values([
		{ lineItemId: 1, targetPerWatt: 0.911 }, // Modules target
		{ lineItemId: 2, targetPerWatt: 0.08 }, // Inverters target
		{ lineItemId: 3, targetPerWatt: 0.009 }, // Racking target
		{ lineItemId: 4, targetPerWatt: 0.0 }, // Warranty target
		{ lineItemId: 5, targetPerWatt: 0.068 }, // BOS target
		{ lineItemId: 7, targetPerWatt: 0.066 }, // Permitting target
		{ lineItemId: 9, targetPerWatt: 0.059 } // Inspection target
	]);

	console.log('Database seeded successfully!');
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
	await seedDatabase();
}
