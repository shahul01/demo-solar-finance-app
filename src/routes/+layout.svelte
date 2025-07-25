<script lang="ts">
	import '../app.css';
	import Sidebar from '$lib/components/scaffolds/sidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen bg-gray-50">
	<!-- Sidebar -->
	<Sidebar />

	<!-- Main Content -->
	<main class="flex-1 overflow-auto">
		<div class="p-6">
			{@render children()}
		</div>
	</main>
</div>
