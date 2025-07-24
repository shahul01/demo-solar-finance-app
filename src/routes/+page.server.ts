import type { PageServerLoad } from './$types';
import { ProjectService } from '$lib/server/projectService.js';

export const load: PageServerLoad = async () => {
	const projectService = new ProjectService();
	const projects = await projectService.getAllProjects();

	// Calculate net income for each project (simple calculation for table display)
	const projectsWithMetrics = await Promise.all(
		projects.map(async (project) => {
			const projectWithCosts = await projectService.getProjectById(project.id);
			if (!projectWithCosts) return { ...project, netIncome: 0 };

			const calculations = projectService.calculateProjectMetrics(projectWithCosts);
			return {
				...project,
				netIncome: calculations.netIncome
			};
		})
	);

	return {
		projects: projectsWithMetrics
	};
};
