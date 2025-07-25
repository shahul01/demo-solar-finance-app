<script lang="ts">
	import { FileText, ChevronDown, ChevronRight, Edit3, Check, X } from 'lucide-svelte';
	import { getProjectContext } from '$lib/stores/projectContext.svelte.js';

	const projectContext = getProjectContext();

	let expandedSections: Record<string, boolean> = $state({});

	function toggleSection(section: string) {
		expandedSections[section] = !expandedSections[section];
	}

	// Reactive calculations
	const project = $derived(projectContext.selectedProject?.project);
	const breakdown = $derived(projectContext.selectedProject?.breakdown || []);
	const calculations = $derived(projectContext.selectedProject?.calculations);
	const watts = $derived(project ? project.systemSizeKw * 1000 : 1);

	// Get breakdown by category
	const bomBreakdown = $derived(breakdown.find((b) => b.categoryName === 'BOM'));
	const laborBreakdown = $derived(breakdown.find((b) => b.categoryName === 'Labor'));
	const commissionBreakdown = $derived(breakdown.find((b) => b.categoryName === 'Commission'));
	const adminBreakdown = $derived(breakdown.find((b) => b.categoryName === 'Admin'));
	const addersBreakdown = $derived(breakdown.find((b) => b.categoryName === 'Adders'));

	// Get current values for commission, admin, and adders
	const commissionAmount = $derived(commissionBreakdown?.total || 0);
	const adminAmount = $derived(adminBreakdown?.total || 0);
	const addersAmount = $derived(addersBreakdown?.total || 0);

	// Recalculated values based on current data
	const totalCogs = $derived((calculations?.totalCogs || 0));
	const grossMargin = $derived((project?.netSystemPrice || 0) - totalCogs);
	const netIncome = $derived(grossMargin - commissionAmount - adminAmount + addersAmount);
</script>

{#snippet EditableField(label: string, field: string, value: number, isPerWatt: boolean = false)}
	{@const isEditing = projectContext.editingField?.field === field}
	{@const watts = projectContext.selectedProject?.project.systemSizeKw
		? projectContext.selectedProject.project.systemSizeKw * 1000
		: 1}
	{@const displayValue = isPerWatt ? (value / watts).toFixed(4) : value.toLocaleString()}

	<div class="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
		<span class="font-medium text-gray-700">{label}</span>
		<div class="flex items-center gap-2">
			{#if isEditing}
				<input
					type="number"
					step="0.01"
					bind:value={projectContext.tempValue}
					class="w-24 rounded border px-2 py-1 text-right focus:ring-2 focus:ring-blue-500 focus:outline-none"
					onkeydown={(e) => {
						if (e.key === 'Enter') projectContext.saveEdit();
						if (e.key === 'Escape') projectContext.cancelEdit();
					}}
				/>
				<button
					onclick={() => projectContext.saveEdit()}
					class="text-green-600 hover:text-green-800"
				>
					<Check size={16} />
				</button>
				<button onclick={() => projectContext.cancelEdit()} class="text-red-600 hover:text-red-800">
					<X size={16} />
				</button>
			{:else}
				<span class="min-w-20 text-right">
					{isPerWatt ? `${displayValue}/W` : `$${displayValue}`}
				</span>
				<button
					onclick={() => projectContext.startEditing(field, isPerWatt ? value / watts : value)}
					class="text-gray-400 hover:text-gray-600"
				>
					<Edit3 size={14} />
				</button>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet ExpandableSection(title: string, items: any[], totalValue: number, fieldName: string)}
	{@const isExpanded = expandedSections[fieldName]}
	{@const watts = projectContext.selectedProject?.project.systemSizeKw
		? projectContext.selectedProject.project.systemSizeKw * 1000
		: 1}

	<div class="border-b border-gray-200">
		<button
			class="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
			onclick={() => toggleSection(fieldName)}
			type="button"
		>
			<div class="flex items-center gap-2">
				{#if isExpanded}
					<ChevronDown size={16} />
				{:else}
					<ChevronRight size={16} />
				{/if}
				<span class="font-semibold text-gray-800">{title}</span>
			</div>
			<div class="flex items-center gap-4">
				<span class="text-right">${totalValue.toLocaleString()}</span>
				<span class="text-sm text-gray-500">${(totalValue / watts).toFixed(4)}/W</span>
			</div>
		</button>

		{#if isExpanded}
			<div class="border-t bg-gray-50">
				{#each items as item}
					<div class="flex justify-between px-6 py-2 text-sm">
						<span class="text-gray-600">{item.name}</span>
						<div class="flex gap-4">
							<span>${item.amount.toLocaleString()}</span>
							<span class="w-16 text-gray-500">${(item.amount / watts).toFixed(4)}/W</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#if projectContext.selectedProject && project}
	<div
		class="bg-[hsl(229.85deg_4.98%_9.89%_/_75%)] bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center"
	>
		<div class="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
			<div class="flex items-center justify-between border-b p-6">
				<div>
					<h2 class="text-xl font-bold text-gray-800">Project P&L Detail</h2>
					<p class="text-gray-600">{project.customerName} - {project.systemSizeKw} kW System</p>
				</div>
				<button
					onclick={() => projectContext.closeProjectDetails()}
					class="text-gray-400 hover:text-gray-600"
				>
					<X size={24} />
				</button>
			</div>

			<div class="max-h-[calc(90vh-80px)] overflow-y-auto">
				<!-- Revenue Section -->
				<div class="border-b border-gray-200">
					{@render EditableField('Net System Price', 'netSystemPrice', project.netSystemPrice)}
					<div class="px-4 py-1 text-right text-sm text-gray-500">
						${(project.netSystemPrice / watts).toFixed(4)}/W
					</div>
				</div>

				<!-- Adders Section (Revenue) -->
				<div class="border-b border-gray-200 bg-blue-50">
					{@render EditableField('Adders (Additional Revenue)', 'lineItem-18', addersAmount)}
					<div class="px-4 py-1 text-right text-sm text-blue-600">
						${(addersAmount / watts).toFixed(4)}/W
					</div>
				</div>

				<!-- BOM Section -->
				{#if bomBreakdown}
					{@render ExpandableSection(
						'Bill of Materials (BOM)',
						bomBreakdown.items,
						bomBreakdown.total,
						'bom'
					)}
				{/if}

				<!-- Labor & Fees Section -->
				{#if laborBreakdown}
					{@render ExpandableSection(
						'Labor & Fees',
						laborBreakdown.items,
						laborBreakdown.total,
						'labor'
					)}
				{/if}

				{#if calculations}
					<!-- Calculated Totals -->
					<div class="border-b bg-blue-50">
						<div class="flex items-center justify-between px-4 py-3">
							<span class="font-semibold text-blue-800">Total Cost of Goods</span>
							<div class="flex items-center gap-4">
								<span class="font-semibold">${calculations.totalCogs.toLocaleString()}</span>
								<span class="text-sm text-blue-600"
									>${calculations.perWattCosts.totalCogsPerWatt.toFixed(4)}/W</span
								>
							</div>
						</div>
					</div>

					<div class="border-b bg-green-50">
						<div class="flex items-center justify-between px-4 py-3">
							<span class="font-semibold text-green-800">Gross Margin</span>
							<div class="flex items-center gap-4">
								<span class="font-semibold">${grossMargin.toLocaleString()}</span>
								<span class="text-sm text-green-600"
									>${(grossMargin / watts).toFixed(4)}/W</span
								>
							</div>
						</div>
					</div>
				{/if}

				<!-- Operating Expenses -->
				<div class="border-b border-gray-200">
					{@render EditableField('Commission', 'lineItem-16', commissionAmount)}
					<div class="px-4 py-1 text-right text-sm text-gray-500">
						${(commissionAmount / watts).toFixed(4)}/W
					</div>
				</div>

				<div class="border-b border-gray-200">
					{@render EditableField('General & Administrative', 'lineItem-17', adminAmount)}
					<div class="px-4 py-1 text-right text-sm text-gray-500">
						${(adminAmount / watts).toFixed(4)}/W
					</div>
				</div>

				<!-- Net Income -->
				<div class="border-b bg-yellow-50">
					<div class="flex items-center justify-between px-4 py-3">
						<span class="font-bold text-yellow-800">Net Income</span>
						<div class="flex items-center gap-4">
							<span class="text-lg font-bold">${netIncome.toLocaleString()}</span>
							<span class="font-medium text-yellow-600"
								>${(netIncome / watts).toFixed(4)}/W</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
