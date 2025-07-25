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
	<h1 class="mb-6 text-2xl font-bold">Solar Projects</h1>

	<div class="overflow-x-auto">
		<table class="w-full border-collapse border border-gray-300">
			<thead>
				<tr class="bg-gray-50">
					<th class="border border-gray-300 px-4 py-2 text-left">Customer</th>
					<th class="border border-gray-300 px-4 py-2 text-center">P&L</th>
					<th class="border border-gray-300 px-4 py-2 text-right">System Size (kW)</th>
					<th class="border border-gray-300 px-4 py-2 text-right">Net Price</th>
					<th class="border border-gray-300 px-4 py-2 text-right">Net Income</th>
				</tr>
			</thead>
			<tbody>
				{#each projects as project (project.id)}
					<tr class="hover:bg-gray-50">
						<td class="border border-gray-300 px-4 py-2">{project.customerName}</td>
						<td class="border border-gray-300 px-4 py-2 text-center">
							<button
								onclick={() => openProjectPL(project)}
								class="rounded p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
								title="View P&L Details"
								disabled={projectContext.isLoading}
							>
								<FileText size={18} />
							</button>
						</td>
						<td class="border border-gray-300 px-4 py-2 text-right">{project.systemSizeKw}</td>
						<td class="border border-gray-300 px-4 py-2 text-right"
							>${project.netSystemPrice.toLocaleString()}</td
						>
						<td class="border border-gray-300 px-4 py-2 text-right"
							>${project.netIncome.toLocaleString()}</td
						>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if projectContext.isLoading}
		<div class="bg-opacity-50 fixed inset-0 z-40 flex items-center justify-center bg-black">
			<div class="rounded-lg bg-white p-4">
				<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
			</div>
		</div>
	{/if}
</div>
