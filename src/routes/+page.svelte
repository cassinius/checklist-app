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
	import Sidebar from '$lib/components/Sidebar.svelte';

	let activeTab: 'checklists' | 'templates' = 'checklists';

	// Handle tab switching
	function switchTab(tab: 'checklists' | 'templates') {
		activeTab = tab;
	}

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
</script>

<Sidebar {activeTab} {switchTab} {handleCreateFromTemplate} {handleCreateNewChecklist} />

<main class="flex-1 overflow-y-auto p-6">
	{#if $currentChecklist}
		<ChecklistView checklist={$currentChecklist} {handleSaveAsTemplate} />
	{:else}
		<div class="py-12 text-center">
			<p class="text-gray-500">Select or create a checklist to get started</p>
		</div>
	{/if}
</main>
