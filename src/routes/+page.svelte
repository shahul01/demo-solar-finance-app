<script lang="ts">
	import type { PageData } from './$types';
	import ProjectTable from '$lib/components/ProjectTable.svelte';
	import ProjectPLModal from '$lib/components/ProjectPLModal.svelte';
	import { setProjectContext } from '$lib/stores/projectContext.svelte.js';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	// Set up project context with initial data
	const projectContext = setProjectContext(data.projects);
</script>

<svelte:head>
	<title>Solar Finance App</title>
	<meta name="description" content="Solar project profit and loss management" />
</svelte:head>

<main class="min-h-screen bg-gray-100">
	<ProjectTable projects={data.projects} />
	<ProjectPLModal />
</main>
