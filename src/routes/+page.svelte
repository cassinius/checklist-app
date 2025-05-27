<script lang="ts">
	import { onMount } from 'svelte';
	import {
		checklists,
		templates,
		currentChecklist,
		toggleItemCompletion,
		addItemToChecklist,
		saveAsTemplate,
		createChecklistFromTemplate,
		createNewChecklist
	} from '$lib/stores';
	import ChecklistView from '$lib/components/ChecklistView.svelte';
	import ActivityBar from '$lib/components/ActivityBar.svelte';
	import ListPanel from '$lib/components/ListPanel.svelte';

	let activeContext: 'checklists' | 'templates' = 'checklists';
	let isListPanelExpanded = true; // Default to expanded

	// Create checklist from template
	function handleCreateFromTemplate(templateId: string) {
		createChecklistFromTemplate(templateId);
		activeTab = 'checklists';
	}

	// Create new checklist
	function handleCreateNewChecklist() {
		const name = prompt('Enter checklist name:');
		if (name) {
			const description = prompt('Enter description (optional):');
			createNewChecklist(name, description || undefined);
		}
	}

	// Save current checklist as template
	function handleSaveAsTemplate() {
		if ($currentChecklist) {
			const template = saveAsTemplate($currentChecklist);
			alert(`Template "${template.name}" saved successfully!`);
		}
	}

	// Handle context change from ActivityBar
	function handleContextChange(event: CustomEvent<'checklists' | 'templates'>) {
		activeContext = event.detail;
		if (!isListPanelExpanded) {
			isListPanelExpanded = true; // Expand panel when context changes
		}
		// Optionally, clear currentChecklist if context changes away from 'checklists'
		if (activeContext !== 'checklists' && $currentChecklist) {
			currentChecklist.set(null);
		}
	}

	function handleSelectChecklist(event: CustomEvent<{ checklist: any }>) {
		// Using 'any' for event.detail as it's a generic object from ListPanel
		currentChecklist.set(event.detail.checklist);
	}
</script>

<!-- Added  for overall page background -->
<div class="flex h-screen ">
	<ActivityBar currentActiveContext={activeContext} on:contextChange={handleContextChange} />
	<ListPanel
		bind:isExpanded={isListPanelExpanded}
		{activeContext}
		checklists={$checklists}
		templates={$templates}
		currentChecklistId={$currentChecklist?.id}
		on:toggleExpansion={() => (isListPanelExpanded = !isListPanelExpanded)}
		on:selectChecklist={handleSelectChecklist}
		on:createNewChecklist={handleCreateNewChecklist}
		on:createFromTemplate={handleCreateFromTemplate}
	/>

	<!-- Changed to  for content area, assuming panel is also white/light -->
	<main class="flex-1 overflow-y-auto  p-6">
		{#if $currentChecklist}
			<ChecklistView checklist={$currentChecklist} {handleSaveAsTemplate} />
		{:else}
			<div class="py-12 text-center">
				<p class="text-gray-500">
					{#if activeContext === 'checklists'}
						Select or create a checklist to get started.
					{:else if activeContext === 'templates'}
						Select a template to create a new checklist.
					{:else}
						No content selected.
					{/if}
				</p>
			</div>
		{/if}
	</main>
</div>
