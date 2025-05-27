<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
	import { checklists, templates, currentChecklist, deleteChecklist } from '$lib/stores';
	import type { ChecklistTemplate } from '$lib/types';
	import ContextMenu from './ContextMenu.svelte';

	export let activeTab: 'checklists' | 'templates';
	export let switchTab: (tab: 'checklists' | 'templates') => void;
	export let handleCreateFromTemplate: (templateId: string) => void;
	export let handleCreateNewChecklist: () => void;

	// Context Menu State
	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let contextMenuChecklistId: string | null = null;

	// Sidebar expanded state
	let isSidebarExpanded = false; // Default to collapsed (icon-only)

	// SVG Icons
	const burgerIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	`;

	const closeIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
		</svg>
	`;

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
	
	// The existing "New Checklist" plus icon
	const newChecklistIcon = `
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
	`;


	function handleContextMenu(event: MouseEvent, checklistId: string) {
		event.preventDefault();
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		contextMenuChecklistId = checklistId;
		showContextMenu = true;
	}

	function handleDeleteChecklistFromContextMenu(event: CustomEvent<{ itemId: string }>) {
		if (event.detail.itemId) {
			deleteChecklist(event.detail.itemId);
		}
		showContextMenu = false; // Explicitly close, also handled by ContextMenu's on:close
	}
</script>

<aside class="flex {isSidebarExpanded ? 'w-64' : 'w-16'} flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out">
	<!-- Toggle Button -->
	<div class="p-2 flex {isSidebarExpanded ? 'justify-end' : 'justify-center'}">
		<button
			on:click={() => (isSidebarExpanded = !isSidebarExpanded)}
			class="rounded p-1 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
			aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
		>
			{@html isSidebarExpanded ? closeIcon : burgerIcon}
		</button>
	</div>

	<!-- Tabs -->
	<div class="flex border-b border-gray-200 {isSidebarExpanded ? '' : 'flex-col items-center py-2'}">
		<button
			class="flex items-center {isSidebarExpanded ? 'flex-1 justify-start px-4' : 'justify-center px-1'} py-3 {activeTab === 'checklists'
				? 'border-b-2 border-blue-600 font-semibold text-blue-600'
				: 'text-gray-600 hover:bg-gray-100'}"
			on:click={() => switchTab('checklists')}
			title="Checklists"
		>
			{@html checklistsIcon}
			{#if isSidebarExpanded}
				<span class="ml-2">Checklists</span>
			{/if}
		</button>
		<button
			class="flex items-center {isSidebarExpanded ? 'flex-1 justify-start px-4' : 'justify-center px-1'} py-3 {activeTab === 'templates'
				? 'border-b-2 border-blue-600 font-semibold text-blue-600'
				: 'text-gray-600 hover:bg-gray-100'}"
			on:click={() => switchTab('templates')}
			title="Templates"
		>
			{@html templatesIcon}
			{#if isSidebarExpanded}
				<span class="ml-2">Templates</span>
			{/if}
		</button>
	</div>

	<!-- List content -->
	<div class="flex-1 overflow-y-auto {isSidebarExpanded ? 'p-4' : 'p-2'}">
		{#if activeTab === 'checklists'}
			<div class="mb-4">
				<button
					class="flex w-full items-center rounded py-2 hover:bg-gray-200 {isSidebarExpanded ? 'justify-start px-3 bg-gray-100 text-gray-700' : 'justify-center px-1 text-gray-600'}"
					on:click={handleCreateNewChecklist}
					title="New Checklist"
				>
					{@html newChecklistIcon}
					{#if isSidebarExpanded}
						<span class="ml-2 text-sm">New Checklist</span>
					{/if}
				</button>
			</div>
			{#if isSidebarExpanded}
				<div class="space-y-2">
					{#each $checklists as checklist}
						<div
							class="relative p-3 {$currentChecklist?.id === checklist.id
								? 'border border-blue-200 bg-blue-50'
								: 'border border-gray-200 bg-white'} cursor-pointer rounded hover:bg-blue-100"
							on:click={() => currentChecklist.set(checklist)}
							on:contextmenu={(event) => handleContextMenu(event, checklist.id)}
						>
							<h3 class="font-medium">{checklist.name}</h3>
							<div class="mt-1 flex items-center text-sm text-gray-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="mr-1 h-3.5 w-3.5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{new Date(checklist.createdAt).toLocaleDateString()}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{:else} <!-- activeTab === 'templates' -->
			{#if isSidebarExpanded}
				<div class="space-y-2">
					{#each $templates as template}
						<div
							class="cursor-pointer rounded border border-gray-200 bg-gray-100 p-3 hover:bg-gray-200"
						>
							<h3 class="font-medium">{template.name}</h3>
							<div class="mt-1 text-sm text-gray-500">
								{template.items.length} items
							</div>
							<div class="mt-2 flex space-x-2">
								<button
									class="flex items-center rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
									on:click={() => handleCreateFromTemplate(template.id)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="mr-1 h-3 w-3"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
										/>
									</svg>
									Use
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	{#if showContextMenu && contextMenuChecklistId && isSidebarExpanded} {/* Context menu only if expanded */}
		<ContextMenu
			bind:show={showContextMenu}
			x={contextMenuX}
			y={contextMenuY}
			itemId={contextMenuChecklistId}
			on:delete={handleDeleteChecklistFromContextMenu}
			on:close={() => {
				showContextMenu = false;
				contextMenuChecklistId = null; // Clear the ID when closing
			}}
		/>
	{/if}
</aside>
