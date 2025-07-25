import { getContext, setContext } from 'svelte';
import type { Project } from '$lib/server/db/schema.js';
import type {
	ProjectWithCosts,
	CostBreakdown,
	ProjectCalculations
} from '$lib/server/projectService.js';

interface ProjectData {
	project: ProjectWithCosts;
	breakdown: CostBreakdown[];
	calculations: ProjectCalculations;
}

interface EditingField {
	field: string;
	value: number;
}

export class ProjectContextClass {
	projects = $state<Array<Project & { netIncome: number }>>([]);
	selectedProject = $state<ProjectData | null>(null);
	isLoading = $state(false);
	editingField = $state<EditingField | null>(null);
	tempValue = $state<string>('');

	constructor(initialProjects: Array<Project & { netIncome: number }> = []) {
		this.projects = initialProjects;
	}

	async loadProjectDetails(projectId: number) {
		this.isLoading = true;
		try {
			const response = await fetch(`/api/projects/${projectId}`);
			if (!response.ok) throw new Error('Failed to load project details');

			const data = await response.json();
			this.selectedProject = data;
		} catch (error) {
			console.error('Error loading project details:', error);
		} finally {
			this.isLoading = false;
		}
	}

	async updateProjectCost(lineItemId: number, amount: number) {
		if (!this.selectedProject) return;

		try {
			const response = await fetch(`/api/projects/${this.selectedProject.project.id}/costs`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ lineItemId, amount })
			});

			if (!response.ok) throw new Error('Failed to update cost');

			const data = await response.json();
			this.selectedProject = data;
		} catch (error) {
			console.error('Error updating project cost:', error);
		}
	}

	async updateProjectPrice(netSystemPrice: number) {
		if (!this.selectedProject) return;

		try {
			const response = await fetch(`/api/projects/${this.selectedProject.project.id}/costs`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ netSystemPrice })
			});

			if (!response.ok) throw new Error('Failed to update price');

			const data = await response.json();
			this.selectedProject = data;
		} catch (error) {
			console.error('Error updating project price:', error);
		}
	}

	startEditing(field: string, value: number) {
		this.editingField = { field, value };
		this.tempValue = value.toString();
	}

	async saveEdit() {
		if (!this.editingField || !this.selectedProject) return;

		const numValue = parseFloat(this.tempValue);
		if (isNaN(numValue)) return;

		if (this.editingField.field === 'netSystemPrice') {
			await this.updateProjectPrice(numValue);
		} else if (this.editingField.field.startsWith('lineItem-')) {
			// Extract line item ID from field name (e.g., 'lineItem-16' -> 16)
			const lineItemId = parseInt(this.editingField.field.split('-')[1]);
			await this.updateProjectCost(lineItemId, numValue);
		}

		this.cancelEdit();
	}

	cancelEdit() {
		this.editingField = null;
		this.tempValue = '';
	}

	closeProjectDetails() {
		this.selectedProject = null;
		this.editingField = null;
		this.tempValue = '';
	}
}

const PROJECT_CONTEXT_KEY = Symbol('project-context');

export function setProjectContext(projects: Array<Project & { netIncome: number }> = []) {
	const context = new ProjectContextClass(projects);
	setContext(PROJECT_CONTEXT_KEY, context);
	return context;
}

export function getProjectContext(): ProjectContextClass {
	const context = getContext<ProjectContextClass>(PROJECT_CONTEXT_KEY);
	if (!context) {
		throw new Error(
			'Project context not found. Make sure to call setProjectContext in a parent component.'
		);
	}
	return context;
}
