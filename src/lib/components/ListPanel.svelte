<!-- src/lib/components/ListPanel.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Checklist, ChecklistTemplate } from '$lib/types';
	import ContextMenu from './ContextMenu.svelte'; // Assuming ContextMenu is in the same directory
	import { deleteChecklist } from '$lib/stores'; // Assuming stores.ts is in $lib

	export let isExpanded: boolean;
	export let activeContext: 'checklists' | 'templates' | null;
	export let checklists: Checklist[] = [];
	export let templates: ChecklistTemplate[] = [];
	// For selecting the current checklist, needed for highlighting
	export let currentChecklistId: string | null = null; 

	const dispatch = createEventDispatcher<{
		toggleExpansion: void;
		selectChecklist: { checklist: Checklist }; // Pass the whole checklist object
		createNewChecklist: void;
		createFromTemplate: { templateId: string }; // Pass template ID
	}>();

	const leftArrowIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>`;
	const newChecklistIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>`;


	// Context Menu State for Checklists
	let showContextMenu = false;
	let contextMenuX = 0;
	let contextMenuY = 0;
	let contextMenuChecklistId: string | null = null;

	function handleChecklistContextMenu(event: MouseEvent, checklistId: string) {
		event.preventDefault();
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		contextMenuChecklistId = checklistId;
		showContextMenu = true;
	}

	function handleDeleteChecklist(event: CustomEvent<{ itemId: string }>) {
		if (event.detail.itemId) {
			deleteChecklist(event.detail.itemId);
			// If the deleted checklist was the current one, the parent should handle unsetting it.
			// Or we could dispatch an event here like: dispatch('checklistDeleted', { checklistId: event.detail.itemId });
		}
		showContextMenu = false; 
	}

	function closeContextMenu() {
		showContextMenu = false;
		contextMenuChecklistId = null;
	}

</script>

<aside 
	class="flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out {isExpanded ? 'w-64 p-4' : 'w-0 p-0'} overflow-hidden"
>
	{#if isExpanded}
		<!-- Header with Title and Collapse Button -->
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-gray-700">
				{#if activeContext === 'checklists'}
					Checklists
				{:else if activeContext === 'templates'}
					Templates
				{:else}
					Panel
				{/if}
			</h2>
			<button
				on:click={() => dispatch('toggleExpansion')}
				class="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400"
				title="Collapse panel"
			>
				{@html leftArrowIcon}
			</button>
		</div>

		<!-- Content Area -->
		<div class="flex-1 overflow-y-auto">
			{#if activeContext === 'checklists'}
				<div class="mb-4">
					<button
						class="flex w-full items-center justify-center rounded bg-blue-600 py-2 px-3 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
						on:click={() => dispatch('createNewChecklist')}
						title="New Checklist"
					>
						{@html newChecklistIcon}
						<span class="ml-2">New Checklist</span>
					</button>
				</div>
				<div class="space-y-1">
					{#each checklists as checklist (checklist.id)}
						<div
							class="relative p-2 rounded-md cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500
								{currentChecklistId === checklist.id ? 'bg-blue-100 border border-blue-500 text-blue-700' : 'hover:bg-gray-100 text-gray-700 border border-transparent'}"
							on:click={() => dispatch('selectChecklist', { checklist })}
							on:contextmenu={(event) => handleChecklistContextMenu(event, checklist.id)}
							role="button" tabindex="0"
							on:keydown={(e) => e.key === 'Enter' && dispatch('selectChecklist', { checklist })}
						>
							<h3 class="text-sm font-medium truncate" title={checklist.name}>{checklist.name}</h3>
							{#if checklist.description}
								<p class="text-xs text-gray-500 truncate" title={checklist.description}>{checklist.description}</p>
							{/if}
						</div>
					{/each}
					{#if checklists.length === 0}
						<p class="text-sm text-gray-500 text-center py-4">No checklists yet.</p>
					{/if}
				</div>

			{:else if activeContext === 'templates'}
				<div class="space-y-1">
					{#each templates as template (template.id)}
						<div
							class="p-2 rounded-md cursor-pointer hover:bg-gray-100 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent"
							on:click={() => dispatch('createFromTemplate', { templateId: template.id })}
							title={`Use template: ${template.name}`}
							role="button" tabindex="0"
							on:keydown={(e) => e.key === 'Enter' && dispatch('createFromTemplate', { templateId: template.id })}
						>
							<h3 class="text-sm font-medium truncate">{template.name}</h3>
							<p class="text-xs text-gray-500">{template.items.length} items</p>
						</div>
					{/each}
					{#if templates.length === 0}
						<p class="text-sm text-gray-500 text-center py-4">No templates yet.</p>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</aside>

{#if showContextMenu && contextMenuChecklistId}
	<ContextMenu
		bind:show={showContextMenu}
		x={contextMenuX}
		y={contextMenuY}
		itemId={contextMenuChecklistId}
		on:delete={handleDeleteChecklist}
		on:close={closeContextMenu}
	/>
{/if}
```
