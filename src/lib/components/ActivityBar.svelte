<!-- src/lib/components/ActivityBar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let currentActiveContext: 'checklists' | 'templates'; // Renamed prop

	const dispatch = createEventDispatcher<{ contextChange: string }>();

	// SVG Icons
	const checklistsIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
		</svg>
	`;

	const templatesIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
		</svg>
	`;
</script>

<aside class="flex w-16 flex-col items-center border-r border-gray-200 bg-white py-4 space-y-3">
	<button
		on:click={() => dispatch('contextChange', 'checklists')}
		class="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 {currentActiveContext === 'checklists' ? 'bg-gray-200 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}"
		title="Checklists"
	>
		{@html checklistsIcon}
	</button>
	<button
		on:click={() => dispatch('contextChange', 'templates')}
		class="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 {currentActiveContext === 'templates' ? 'bg-gray-200 text-blue-600' : 'text-gray-500 hover:bg-gray-200'}"
		title="Templates"
	>
		{@html templatesIcon}
	</button>
</aside>
