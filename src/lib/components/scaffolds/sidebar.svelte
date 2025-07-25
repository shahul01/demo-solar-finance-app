<script lang="ts">
	import {
		BarChart3,
		DollarSign,
		FileText,
		TrendingUp,
		Boxes,
		User,
		Settings,
		Home
	} from 'lucide-svelte';

	interface NavItem {
		icon: any;
		label: string;
		href: string;
		isActive?: boolean;
	}

	const navItems: NavItem[] = [
		{ icon: Home, label: 'Dashboard', href: '/' },
		{ icon: DollarSign, label: 'Costs', href: '/' },
		{ icon: FileText, label: 'Reports', href: '/' },
		{ icon: TrendingUp, label: 'Sales', href: '/' },
		{ icon: Boxes, label: 'Model', href: '/', isActive: true },
		{ icon: User, label: 'Profile', href: '/' },
		{ icon: Settings, label: 'Settings', href: '/' }
	];
</script>

<aside class="flex h-screen w-64 flex-col bg-gray-900 text-white">
	<!-- Header -->
	<div class="border-b border-gray-700 p-6">
		<h1 class="text-xl font-bold tracking-wider">KIN HOME</h1>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 p-4">
		<ul class="space-y-2">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center space-x-3 rounded-lg p-3 transition-colors duration-200 hover:bg-gray-800 {item.isActive
							? 'border-l-4 border-blue-500 bg-gray-800'
							: ''}"
					>
						<svelte:component this={item.icon} class="h-5 w-5" />
						<span class="font-medium">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
