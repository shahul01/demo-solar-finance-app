import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProjectService } from '$lib/server/projectService.js';

export const PATCH: RequestHandler = async ({ request, params }) => {
	const projectService = new ProjectService();
	const projectId = parseInt(params.id);

	if (isNaN(projectId)) {
		return json({ error: 'Invalid project ID' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const { lineItemId, amount, netSystemPrice } = body;

		if (netSystemPrice !== undefined) {
			await projectService.updateProjectPrice(projectId, netSystemPrice);
		}

		if (lineItemId !== undefined && amount !== undefined) {
			await projectService.updateProjectCost(projectId, lineItemId, amount);
		}

		// Return updated project data
		const project = await projectService.getProjectById(projectId);
		if (!project) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		const breakdown = projectService.getCostBreakdown(project);
		const calculations = projectService.calculateProjectMetrics(project);

		return json({
			project,
			breakdown,
			calculations
		});
	} catch (error) {
		console.error('Error updating project costs:', error);
		return json({ error: 'Failed to update project costs' }, { status: 500 });
	}
};
