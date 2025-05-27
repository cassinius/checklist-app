<!-- src/lib/components/ChecklistView.svelte (updated) -->
<script lang="ts">
	import {
		toggleItemCompletion,
		addItemToChecklist,
		updateChecklistItem,
		deleteChecklistItem,
		setChecklistRecurrence,
		updateChecklistDetails
	} from '$lib/stores';
	import type { Checklist, ChecklistItem, RecurrencePattern, CustomRecurrence } from '$lib/types';
	import RecurrenceModal from './RecurrenceModal.svelte';
	// EditItemModal import removed

	export let checklist: Checklist;
	export let handleSaveAsTemplate: () => void;

	let isCreatingItem = false;
	let newItemTitle = '';
	let newItemDescription = '';
	let showRecurrenceModal = false;

	// State variables for item editing modal (removed)
	// let showEditModal = false;
	// let currentEditItem: ChecklistItem | null = null;

	// New state variables for inline item editing
	let editingItemId: string | null = null;
	let inlineEditTitle: string = '';
	let inlineEditDescription: string = '';

	// For checklist details editing
	let isEditingChecklistDetails = false;
	let editingChecklistName = '';
	let editingChecklistDescription = '';

	function startEditingChecklistDetails() {
		isEditingChecklistDetails = true;
		editingChecklistName = checklist.name;
		editingChecklistDescription = checklist.description || '';
	}

	function saveChecklistDetails() {
		if (!editingChecklistName.trim()) {
			// Basic validation: name should not be empty
			alert('Checklist name cannot be empty.');
			return;
		}
		updateChecklistDetails(
			checklist.id,
			editingChecklistName.trim(),
			editingChecklistDescription.trim()
		);
		isEditingChecklistDetails = false;
	}

	function cancelEditingChecklistDetails() {
		isEditingChecklistDetails = false;
		// Resetting values is optional as they'll be re-initialized in startEditingChecklistDetails
	}

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
		event: CustomEvent<{ pattern: RecurrencePattern; customData?: CustomRecurrence }>
	) {
		const { pattern, customData } = event.detail;
		setChecklistRecurrence(checklist.id, pattern, customData);
		showRecurrenceModal = false;
	}

	// --- Inline Item Editing Functions ---

	function startInlineEdit(item: ChecklistItem) {
		editingItemId = item.id;
		inlineEditTitle = item.title;
		inlineEditDescription = item.description || '';
	}

	function saveInlineEdit() {
		if (editingItemId) {
			if (!inlineEditTitle.trim()) {
				alert('Item title cannot be empty.');
				return;
			}
			updateChecklistItem(checklist.id, editingItemId, {
				title: inlineEditTitle.trim(),
				description: inlineEditDescription.trim() || undefined
			});
			editingItemId = null;
			// Clearing these is optional as startInlineEdit repopulates
			// inlineEditTitle = '';
			// inlineEditDescription = '';
		}
	}

	function cancelInlineEdit() {
		editingItemId = null;
		// Clearing these is optional
		// inlineEditTitle = '';
		// inlineEditDescription = '';
	}

	function deleteInlineItem(itemId: string) {
		if (!confirm('Are you sure you want to delete this item?')) return;

		deleteChecklistItem(checklist.id, itemId);

		if (editingItemId === itemId) {
			editingItemId = null;
			// inlineEditTitle = ''; // Optional clear
			// inlineEditDescription = ''; // Optional clear
		}
	}

	// Old modal-related functions (openEditModal, handleEditSave, handleDeleteItem) are removed.
</script>

<div>
	<div class="mb-6">
		{#if isEditingChecklistDetails}
			<div class="mb-4">
				<input
					type="text"
					class="mb-2 w-full rounded border border-gray-300 p-2 text-2xl font-bold"
					bind:value={editingChecklistName}
					placeholder="Checklist Name"
				/>
				<textarea
					class="w-full rounded border border-gray-300 p-2"
					bind:value={editingChecklistDescription}
					placeholder="Checklist Description (optional)"
					rows="2"
				></textarea>
				<div class="mt-2 flex space-x-2">
					<button
						class="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
						on:click={saveChecklistDetails}
					>
						Save
					</button>
					<button
						class="rounded bg-gray-200 px-3 py-1  hover:bg-gray-300"
						on:click={cancelEditingChecklistDetails}
					>
						Cancel
					</button>
				</div>
			</div>
		{:else}
			<div class="group relative">
				<h2 class="text-2xl font-bold ">{checklist.name}</h2>
				{#if checklist.description}
					<p class="mt-1 ">{checklist.description}</p>
				{/if}
				<button
					class="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100"
					on:click={startEditingChecklistDetails}
					title="Edit checklist details"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5 text-gray-500 hover:"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
						/>
					</svg>
				</button>
			</div>
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
				class="flex items-center rounded px-3 py-1  hover:bg-gray-200"
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
	<div class="relative border-l-2 pl-8">
		{#each checklist.items as item (item.id)}
			<div class="relative mb-8">
				<!-- Timeline dot -->
				<div
					class="absolute -left-10.5 h-4.5 w-4.5 rounded-full {item.isDone
						? 'bg-green-500'
						: 'border-2 border-gray-300 bg-slate-700 '} flex cursor-pointer items-center justify-center"
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
					class="rounded-lg border p-4 {editingItemId === item.id
						? 'border-blue-200 bg-blue-50'
						: item.isDone
							? ' bg-green-100'
							: 'border-gray-300 '}"
				>
					{#if editingItemId === item.id}
						<div>
							<input
								type="text"
								bind:value={inlineEditTitle}
								class="mb-2 w-full rounded border border-gray-300 p-2 font-medium  focus:border-blue-500 focus:ring-blue-500"
								placeholder="Item title"
							/>
							<textarea
								bind:value={inlineEditDescription}
								class="mb-2 w-full rounded border border-gray-300 p-2 text-sm  focus:border-blue-500 focus:ring-blue-500"
								rows="2"
								placeholder="Item description (optional)"
							></textarea>
							<div class="flex justify-end space-x-2">
								<button
									class="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
									on:click={saveInlineEdit}
								>
									Save
								</button>
								<button
									class="rounded bg-gray-200 px-3 py-1 text-xs  hover:bg-gray-300"
									on:click={cancelInlineEdit}
								>
									Cancel
								</button>
							</div>
						</div>
					{:else}
						<div class="flex justify-between">
							<h3
								class="font-medium {item.isDone ? 'text-gray-500 line-through' : ''}"
							>
								{item.title}
							</h3>
							<div class="flex space-x-2">
								<button
									class="text-gray-400 hover:"
									on:click={() => startInlineEdit(item)}
									title="Edit item"
								>
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
								<button
									class="text-gray-400 hover:text-red-600"
									on:click={() => deleteInlineItem(item.id)}
									title="Delete item"
								>
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
							<p class="mt-1 text-sm {item.isDone ? 'text-gray-400' : ''}">
								{item.description}
							</p>
						{/if}
					{/if}
					{#if item.completedAt && editingItemId !== item.id}
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
				<div class="absolute -left-10.5 h-4.5 w-4.5 rounded-full bg-yellow-400"></div>
				<div class="rounded-lg border p-4">
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
							class="px-3 py-1  hover:"
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

	<!-- EditItemModal instantiation removed -->
</div>
