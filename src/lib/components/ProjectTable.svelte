<script lang="ts">
	import { FileText } from 'lucide-svelte';
	import { getProjectContext } from '$lib/stores/projectContext.svelte.js';
	import type { Project } from '$lib/server/db/schema.js';

	interface Props {
		projects: Array<Project & { netIncome: number }>;
	}

	let { projects }: Props = $props();

	const projectContext = getProjectContext();

	async function openProjectPL(project: Project) {
		await projectContext.loadProjectDetails(project.id);
	}
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-6">Solar Projects</h1>

	<div class="overflow-x-auto">
		<table class="w-full border-collapse border border-gray-300">
			<thead>
				<tr class="bg-gray-50">
					<th class="border border-gray-300 px-4 py-2 text-left">Customer</th>
					<th class="border border-gray-300 px-4 py-2 text-right">System Size (kW)</th>
					<th class="border border-gray-300 px-4 py-2 text-right">Net Price</th>
					<th class="border border-gray-300 px-4 py-2 text-right">Net Income</th>
					<th class="border border-gray-300 px-4 py-2 text-center">P&L</th>
				</tr>
			</thead>
			<tbody>
				{#each projects as project (project.id)}
					<tr class="hover:bg-gray-50">
						<td class="border border-gray-300 px-4 py-2">{project.customerName}</td>
						<td class="border border-gray-300 px-4 py-2 text-right">{project.systemSizeKw}</td>
						<td class="border border-gray-300 px-4 py-2 text-right">${project.netSystemPrice.toLocaleString()}</td>
						<td class="border border-gray-300 px-4 py-2 text-right">${project.netIncome.toLocaleString()}</td>
						<td class="border border-gray-300 px-4 py-2 text-center">
							<button
								onclick={() => openProjectPL(project)}
								class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded"
								title="View P&L Details"
								disabled={projectContext.isLoading}
							>
								<FileText size={18} />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if projectContext.isLoading}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
			<div class="bg-white p-4 rounded-lg">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		</div>
	{/if}
</div>