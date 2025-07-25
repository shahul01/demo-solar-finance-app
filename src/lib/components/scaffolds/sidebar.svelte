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
		{ icon: Home, label: 'Dashboard', href: '/', isActive: true },
		{ icon: DollarSign, label: 'Costs', href: '/' },
		{ icon: FileText, label: 'Reports', href: '/' },
		{ icon: TrendingUp, label: 'Sales', href: '/' },
		{ icon: Boxes, label: 'Model', href: '/' },
		{ icon: User, label: 'Profile', href: '/' },
		{ icon: Settings, label: 'Settings', href: '/' }
	];
</script>

<aside class="w-64 bg-gray-900 text-white h-screen flex flex-col">
	<!-- Header -->
	<div class="p-6 border-b border-gray-700">
		<h1 class="text-xl font-bold tracking-wider">KIN HOME</h1>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 p-4">
		<ul class="space-y-2">
			{#each navItems as item}
				<li>
					<a
						href={item.href}
						class="flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-800 {item.isActive
							? 'bg-gray-800 border-l-4 border-blue-500'
							: ''}"
					>
						<svelte:component this={item.icon} class="w-5 h-5" />
						<span class="font-medium">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>
</aside>
