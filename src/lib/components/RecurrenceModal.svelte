<!-- src/lib/components/RecurrenceModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { RecurrencePattern } from '$lib/types';

	export let show = false;
	export let currentPattern: RecurrencePattern | undefined = undefined;

	const dispatch = createEventDispatcher<{
		close: void;
		save: { pattern: RecurrencePattern; customData?: any };
	}>();

	let selectedPattern: RecurrencePattern = currentPattern || 'once';
	let customInterval = 1;
	let customType: 'days' | 'weeks' | 'months' = 'days';
	let selectedDaysOfWeek: number[] = [];
	let selectedDaysOfMonth: number[] = [];

	// Close modal
	function close() {
		dispatch('close');
	}

	// Save recurrence pattern
	function save() {
		let customData;

		if (selectedPattern === 'custom') {
			customData = {
				type: customType,
				interval: customInterval,
				daysOfWeek: customType === 'weeks' ? selectedDaysOfWeek : undefined,
				daysOfMonth: customType === 'months' ? selectedDaysOfMonth : undefined
			};
		}

		dispatch('save', {
			pattern: selectedPattern,
			customData
		});
	}

	// Toggle day of week selection
	function toggleDayOfWeek(day: number) {
		if (selectedDaysOfWeek.includes(day)) {
			selectedDaysOfWeek = selectedDaysOfWeek.filter((d) => d !== day);
		} else {
			selectedDaysOfWeek = [...selectedDaysOfWeek, day];
		}
	}

	// Toggle day of month selection
	function toggleDayOfMonth(day: number) {
		if (selectedDaysOfMonth.includes(day)) {
			selectedDaysOfMonth = selectedDaysOfMonth.filter((d) => d !== day);
		} else {
			selectedDaysOfMonth = [...selectedDaysOfMonth, day];
		}
	}

	// Day names
	const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
</script>

{#if show}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-gray-600">
		<div class="w-full max-w-md rounded-lg p-6 shadow-xl">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-bold">Set Recurrence Pattern</h2>
				<button class="text-gray-500 hover:" on:click={close}>
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
					<label class="mb-2 block ">Recurrence Pattern</label>
					<div class="space-y-2">
						<label class="flex items-center">
							<input type="radio" bind:group={selectedPattern} value="once" class="mr-2" />
							<span>Once (no recurrence)</span>
						</label>
						<label class="flex items-center">
							<input type="radio" bind:group={selectedPattern} value="daily" class="mr-2" />
							<span>Daily</span>
						</label>
						<label class="flex items-center">
							<input type="radio" bind:group={selectedPattern} value="weekly" class="mr-2" />
							<span>Weekly</span>
						</label>
						<label class="flex items-center">
							<input type="radio" bind:group={selectedPattern} value="monthly" class="mr-2" />
							<span>Monthly</span>
						</label>
						<label class="flex items-center">
							<input type="radio" bind:group={selectedPattern} value="custom" class="mr-2" />
							<span>Custom</span>
						</label>
					</div>
				</div>

				{#if selectedPattern === 'custom'}
					<div class="border-t pt-4">
						<label class="mb-2 block ">Custom Recurrence</label>

						<div class="mb-4 flex items-center">
							<span class="mr-2">Every</span>
							<input
								type="number"
								bind:value={customInterval}
								min="1"
								class="w-16 rounded border border-gray-300 px-2 py-1"
							/>
							<select bind:value={customType} class="ml-2 rounded border border-gray-300 px-2 py-1">
								<option value="days">day(s)</option>
								<option value="weeks">week(s)</option>
								<option value="months">month(s)</option>
							</select>
						</div>

						{#if customType === 'weeks'}
							<div class="mb-4">
								<label class="mb-2 block ">On these days:</label>
								<div class="flex flex-wrap gap-2">
									{#each daysOfWeek as day, index}
										<button
											class="h-10 w-10 rounded-full {selectedDaysOfWeek.includes(index)
												? 'bg-blue-500 text-white'
												: ' '} flex items-center justify-center"
											on:click={() => toggleDayOfWeek(index)}
										>
											{day}
										</button>
									{/each}
								</div>
							</div>
						{/if}

						{#if customType === 'months'}
							<div class="mb-4">
								<label class="mb-2 block ">On these days of the month:</label>
								<div class="flex flex-wrap gap-2">
									{#each Array(31) as _, index}
										<button
											class="h-8 w-8 rounded {selectedDaysOfMonth.includes(index + 1)
												? 'bg-blue-500 text-white'
												: ' '} flex items-center justify-center"
											on:click={() => toggleDayOfMonth(index + 1)}
										>
											{index + 1}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<div class="mt-6 flex justify-end space-x-2">
				<button class="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300" on:click={close}>
					Cancel
				</button>
				<button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700" on:click={save}>
					Save
				</button>
			</div>
		</div>
	</div>
{/if}
