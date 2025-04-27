<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
	import { checklists, templates, currentChecklist } from '$lib/stores';
	import type { ChecklistTemplate } from '$lib/types';

	export let activeTab: 'checklists' | 'templates';
	export let switchTab: (tab: 'checklists' | 'templates') => void;
	export let handleCreateFromTemplate: (templateId: string) => void;
	export let handleCreateNewChecklist: () => void;
</script>

<aside class="flex w-64 flex-col border-r border-gray-200 bg-white">
	<!-- Tabs -->
	<div class="flex border-b border-gray-200">
		<button
			class="flex-1 py-3 text-center {activeTab === 'checklists'
				? 'border-b-2 border-blue-600 font-semibold text-blue-600'
				: 'text-gray-600'}"
			on:click={() => switchTab('checklists')}
		>
			Checklists
		</button>
		<button
			class="flex-1 py-3 text-center {activeTab === 'templates'
				? 'border-b-2 border-blue-600 font-semibold text-blue-600'
				: 'text-gray-600'}"
			on:click={() => switchTab('templates')}
		>
			Templates
		</button>
	</div>

	<!-- List content -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if activeTab === 'checklists'}
			<div>
				<div class="mb-4">
					<button
						class="flex w-full items-center justify-center rounded bg-gray-100 py-2 text-gray-700 hover:bg-gray-200"
						on:click={handleCreateNewChecklist}
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
						New Checklist
					</button>
				</div>
				<div class="space-y-2">
					{#each $checklists as checklist}
						<div
							class="p-3 {$currentChecklist?.id === checklist.id
								? 'border border-blue-200 bg-blue-50'
								: 'border border-gray-200 bg-white'} cursor-pointer rounded hover:bg-blue-100"
							on:click={() => currentChecklist.set(checklist)}
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
			</div>
		{:else}
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
	</div>
</aside>
