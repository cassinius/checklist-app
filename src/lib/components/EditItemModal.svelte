<!-- src/lib/components/EditItemModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ChecklistItem } from '$lib/types';

	export let show = false;
	export let item: ChecklistItem | null = null;

	const dispatch = createEventDispatcher<{
		close: void;
		save: { title: string; description?: string };
		delete: string;
	}>();

	let title = '';
	let description = '';

	$: if (item && show) {
		title = item.title;
		description = item.description || '';
	}

	function close() {
		dispatch('close');
	}

	function save() {
		if (!title.trim()) return;

		dispatch('save', {
			title: title.trim(),
			description: description.trim() || undefined
		});
	}

	function deleteItem() {
		if (item) {
			if (confirm('Are you sure you want to delete this item?')) {
				dispatch('delete', item.id);
			}
		}
	}
</script>

{#if show && item}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
		<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold">Edit Item</h2>
				<button class="text-gray-500 hover:text-gray-700" on:click={close}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label for="title" class="mb-1 block text-gray-700">Title</label>
					<input
						id="title"
						type="text"
						bind:value={title}
						class="w-full rounded border border-gray-300 p-2"
						placeholder="Item title"
					/>
				</div>

				<div>
					<label for="description" class="mb-1 block text-gray-700">Description (optional)</label>
					<textarea
						id="description"
						bind:value={description}
						class="w-full rounded border border-gray-300 p-2"
						placeholder="Description"
						rows={3}
					></textarea>
				</div>
			</div>

			<div class="mt-6 flex justify-between">
				<button
					class="flex items-center rounded bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200"
					on:click={deleteItem}
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
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
					Delete
				</button>

				<div class="space-x-2">
					<button
						class="rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
						on:click={close}
					>
						Cancel
					</button>
					<button
						class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						on:click={save}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
