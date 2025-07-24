import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ProjectService } from '$lib/server/projectService.js';

export const GET: RequestHandler = async ({ params }) => {
	const projectService = new ProjectService();
	const projectId = parseInt(params.id);

	if (isNaN(projectId)) {
		return json({ error: 'Invalid project ID' }, { status: 400 });
	}

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
};
