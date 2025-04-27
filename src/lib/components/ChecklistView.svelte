<!-- src/lib/components/ChecklistView.svelte (updated) -->
<script lang="ts">
	import { toggleItemCompletion, addItemToChecklist } from '$lib/stores';
	import type { Checklist, ChecklistItem, RecurrencePattern } from '$lib/types';
	import RecurrenceModal from './RecurrenceModal.svelte';

	export let checklist: Checklist;
	export let handleSaveAsTemplate: () => void;

	let isCreatingItem = false;
	let newItemTitle = '';
	let newItemDescription = '';
	let showRecurrenceModal = false;

	function toggleItem(itemId: string) {
		toggleItemCompletion(checklist.id, itemId);
	}

	function addNewItem() {
		if (!newItemTitle.trim()) return;

		addItemToChecklist(checklist.id, {
			title: newItemTitle.trim(),
			description: newItemDescription.trim() || undefined
		});

		newItemTitle = '';
		newItemDescription = '';
		isCreatingItem = false;
	}

	function openRecurrenceModal() {
		showRecurrenceModal = true;
	}

	function handleRecurrenceSave(
		event: CustomEvent<{ pattern: RecurrencePattern; customData?: any }>
	) {
		// Here we would update the checklist with the new recurrence pattern
		// For now, we'll just show an alert
		const { pattern, customData } = event.detail;
		console.log('Recurrence pattern saved:', pattern, customData);

		// In a real app, you would update the recurrence in your store
		alert(`Recurrence set to: ${pattern}`);

		showRecurrenceModal = false;
	}
</script>

<div>
	<div class="mb-6">
		<h2 class="text-2xl font-bold text-gray-800">{checklist.name}</h2>
		{#if checklist.description}
			<p class="mt-1 text-gray-600">{checklist.description}</p>
		{/if}
		<div class="mt-4 flex space-x-3">
			<button
				class="flex items-center rounded bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
				on:click={handleSaveAsTemplate}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
					/>
				</svg>
				Save as Template
			</button>
			<button
				class="flex items-center rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200"
				on:click={openRecurrenceModal}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				{checklist.recurrencePattern
					? `Recurrence: ${checklist.recurrencePattern}`
					: 'Set Recurrence'}
			</button>
		</div>
	</div>

	<!-- Timeline view -->
	<div class="relative border-l-2 border-gray-200 pl-8">
		{#each checklist.items as item (item.id)}
			<div class="relative mb-8">
				<!-- Timeline dot -->
				<div
					class="absolute -left-10 h-5 w-5 rounded-full {item.isDone
						? 'bg-green-500'
						: 'border-2 border-gray-300 bg-white'} flex cursor-pointer items-center justify-center"
					on:click={() => toggleItem(item.id)}
				>
					{#if item.isDone}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3 w-3 text-white"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="3"
								d="M5 13l4 4L19 7"
							/>
						</svg>
					{/if}
				</div>

				<!-- Item content -->
				<div
					class="rounded-lg border p-4 {item.isDone
						? 'border-gray-200 bg-gray-50'
						: 'border-gray-300 bg-white'}"
				>
					<div class="flex justify-between">
						<h3 class="font-medium {item.isDone ? 'text-gray-500 line-through' : 'text-gray-800'}">
							{item.title}
						</h3>
						<div class="flex space-x-2">
							<button class="text-gray-400 hover:text-gray-600">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>
							<button class="text-gray-400 hover:text-red-600">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>
					{#if item.description}
						<p class="mt-1 text-sm {item.isDone ? 'text-gray-400' : 'text-gray-600'}">
							{item.description}
						</p>
					{/if}
					{#if item.completedAt}
						<div class="mt-2 flex items-center text-xs text-gray-500">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-3 w-3 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Completed {new Date(item.completedAt).toLocaleString()}
						</div>
					{/if}
				</div>
			</div>
		{/each}

		<!-- Add new item form -->
		{#if isCreatingItem}
			<div class="relative mb-6">
				<div class="absolute -left-10 h-5 w-5 rounded-full border-2 border-blue-300 bg-white"></div>
				<div class="rounded-lg border border-blue-300 bg-white p-4">
					<input
						type="text"
						placeholder="Item title"
						class="mb-2 w-full rounded border border-gray-300 p-2"
						bind:value={newItemTitle}
					/>
					<textarea
						placeholder="Description (optional)"
						class="mb-2 w-full rounded border border-gray-300 p-2"
						bind:value={newItemDescription}
						rows={2}
					></textarea>
					<div class="flex justify-end space-x-2">
						<button
							class="px-3 py-1 text-gray-600 hover:text-gray-800"
							on:click={() => (isCreatingItem = false)}
						>
							Cancel
						</button>
						<button
							class="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
							on:click={addNewItem}
						>
							Add Item
						</button>
					</div>
				</div>
			</div>
		{:else}
			<button
				class="flex items-center text-blue-600 hover:text-blue-800"
				on:click={() => (isCreatingItem = true)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="mr-1 h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Add new item
			</button>
		{/if}
	</div>

	<!-- Recurrence Modal -->
	<RecurrenceModal
		show={showRecurrenceModal}
		currentPattern={checklist.recurrencePattern}
		on:close={() => (showRecurrenceModal = false)}
		on:save={handleRecurrenceSave}
	/>
</div>


<!-- 
<script lang="ts">
  import { toggleItemCompletion, addItemToChecklist, updateChecklistItem, deleteChecklistItem, setChecklistRecurrence } from '$lib/stores';
  import type { Checklist, ChecklistItem, RecurrencePattern } from '$lib/types';
  import RecurrenceModal from './RecurrenceModal.svelte';
  import EditItemModal from './EditItemModal.svelte';
  
  export let checklist: Checklist;
  export let handleSaveAsTemplate: () => void;
  
  let isCreatingItem = false;
  let newItemTitle = '';
  let newItemDescription = '';
  let showRecurrenceModal = false;
  
  // For item editing
  let showEditModal = false;
  let currentEditItem: ChecklistItem | null = null;
  
  function toggleItem(itemId: string) {
    toggleItemCompletion(checklist.id, itemId);
  }
  
  function addNewItem() {
    if (!newItemTitle.trim()) return;
    
    addItemToChecklist(checklist.id, {
      title: newItemTitle.trim(),
      description: newItemDescription.trim() || undefined
    });
    
    newItemTitle = '';
    newItemDescription = '';
    isCreatingItem = false;
  }
  
  function openRecurrenceModal() {
    showRecurrenceModal = true;
  }
  
  function handleRecurrenceSave(event: CustomEvent<{ pattern: RecurrencePattern, customData?: any }>) {
    const { pattern, customData } = event.detail;
    setChecklistRecurrence(checklist.id, pattern, customData);
    showRecurrenceModal = false;
  }
  
  function openEditModal(item: ChecklistItem) {
    currentEditItem = item;
    showEditModal = true;
  }
  
  function handleEditSave(event: CustomEvent<{ title: string, description?: string }>) {
    if (!currentEditItem) return;
    
    const { title, description } = event.detail;
    updateChecklistItem(checklist.id, currentEditItem.id, {
      title,
      description: description === undefined ? null : description
    });
    
    showEditModal = false;
    currentEditItem = null;
  }
  
  function handleDeleteItem(event: CustomEvent<string>) {
    const itemId = event.detail;
    deleteChecklistItem(checklist.id, itemId);
    
    showEditModal = false;
    currentEditItem = null;
  }
</script>

<div>
  <div class="mb-6">
    <h2 class="text-2xl font-bold text-gray-800">{checklist.name}</h2>
    {#if checklist.description}
      <p class="text-gray-600 mt-1">{checklist.description}</p>
    {/if}
    <div class="flex mt-4 space-x-3">
      <button 
        class="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center"
        on:click={handleSaveAsTemplate}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Save as Template
      </button>
      <button 
        class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center"
        on:click={openRecurrenceModal}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {checklist.recurrencePattern ? `Recurrence: ${checklist.recurrencePattern}` : 'Set Recurrence'}
      </button>
    </div>
  </div>

  <div class="relative pl-8 border-l-2 border-gray-200">
    {#each checklist.items as item (item.id)}
      <div class="mb-8 relative">
        <div 
          class="absolute -left-10 w-5 h-5 rounded-full {item.isDone ? 'bg-green-500' : 'border-2 border-gray-300 bg-white'} flex items-center justify-center cursor-pointer"
          on:click={() => toggleItem(item.id)}
        >
          {#if item.isDone}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </div>
        
        <div class="p-4 border rounded-lg {item.isDone ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}">
          <div class="flex justify-between">
            <h3 class="font-medium {item.isDone ? 'line-through text-gray-500' : 'text-gray-800'}">
              {item.title}
            </h3>
            <div class="flex space-x-2">
              <button 
                class="text-gray-400 hover:text-gray-600"
                on:click={() => openEditModal(item)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
          {#if item.description}
            <p class="mt-1 text-sm {item.isDone ? 'text-gray-400' : 'text-gray-600'}">
              {item.description}
            </p>
          {/if}
          {#if item.completedAt}
            <div class="mt-2 text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Completed {new Date(item.completedAt).toLocaleString()}
            </div>
          {/if}
        </div>
      </div>
    {/each}

    Add new item form
    {#if isCreatingItem}
      <div class="mb-6 relative">
        <div class="absolute -left-10 w-5 h-5 rounded-full border-2 border-blue-300 bg-white"></div>
        <div class="p-4 border rounded-lg border-blue-300 bg-white">
          <input
            type="text"
            placeholder="Item title"
            class="w-full mb-2 p-2 border border-gray-300 rounded"
            bind:value={newItemTitle} -->