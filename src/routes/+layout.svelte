<script lang="ts">
	let { children } = $props();
</script>

<style>
	@import "tailwindcss";

	html,
	body {
		margin: 0;
		padding: 0;
	}

	button {
		cursor: pointer;
		user-select: none;
	}
</style>

{@render children()}
