// src/lib/stores.ts - Svelte stores for state management
import { writable } from 'svelte/store';
import type { Checklist, ChecklistTemplate, ChecklistItem, RecurrencePattern } from './types';

// Sample data
const sampleChecklist: Checklist = {
	id: 'checklist-1',
	name: 'Monday Morning Setup',
	description: 'Tasks to start the week',
	items: [
		{
			id: 'item-1',
			title: 'Check emails',
			description: 'Process inbox and flag important messages',
			isDone: true,
			createdAt: new Date(),
			completedAt: new Date()
		},
		{
			id: 'item-2',
			title: 'Team standup',
			description: 'Discuss weekly goals',
			isDone: false,
			createdAt: new Date()
		},
		{
			id: 'item-3',
			title: 'Update project timeline',
			isDone: false,
			createdAt: new Date()
		},
		{
			id: 'item-4',
			title: 'Review pull requests',
			description: 'At least 3 PRs',
			isDone: false,
			createdAt: new Date()
		}
	],
	createdAt: new Date()
};

const sampleTemplates: ChecklistTemplate[] = [
	{
		id: 'template-1',
		name: 'Morning Routine',
		items: [
			{ id: 't1-item-1', title: 'Meditate', isDone: false, createdAt: new Date() },
			{ id: 't1-item-2', title: 'Exercise', isDone: false, createdAt: new Date() },
			{ id: 't1-item-3', title: 'Plan the day', isDone: false, createdAt: new Date() }
		],
		createdAt: new Date()
	},
	{
		id: 'template-2',
		name: 'Project Setup',
		items: [
			{ id: 't2-item-1', title: 'Create repository', isDone: false, createdAt: new Date() },
			{
				id: 't2-item-2',
				title: 'Setup development environment',
				isDone: false,
				createdAt: new Date()
			},
			{ id: 't2-item-3', title: 'Write project brief', isDone: false, createdAt: new Date() }
		],
		createdAt: new Date()
	}
];

// Create stores
export const checklists = writable<Checklist[]>([sampleChecklist]);
export const templates = writable<ChecklistTemplate[]>(sampleTemplates);
export const currentChecklist = writable<Checklist | null>(sampleChecklist);

// Store actions
export function toggleItemCompletion(checklistId: string, itemId: string) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					items: list.items.map((item) =>
						item.id === itemId
							? {
									...item,
									isDone: !item.isDone,
									completedAt: !item.isDone ? new Date() : undefined
								}
							: item
					)
				};
			}
			return list;
		});
	});

	// Also update currentChecklist if it matches
	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return {
				...list,
				items: list.items.map((item) =>
					item.id === itemId
						? {
								...item,
								isDone: !item.isDone,
								completedAt: !item.isDone ? new Date() : undefined
							}
						: item
				)
			};
		}
		return list;
	});
}

export function addItemToChecklist(
	checklistId: string,
	item: Omit<ChecklistItem, 'id' | 'createdAt' | 'isDone'>
) {
	const newItem: ChecklistItem = {
		id: `item-${Date.now()}`,
		title: item.title,
		description: item.description,
		isDone: false,
		createdAt: new Date()
	};

	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					items: [...list.items, newItem]
				};
			}
			return list;
		});
	});

	// Also update currentChecklist if it matches
	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return {
				...list,
				items: [...list.items, newItem]
			};
		}
		return list;
	});
}

export function saveAsTemplate(checklist: Checklist) {
	const newTemplate: ChecklistTemplate = {
		id: `template-${Date.now()}`,
		name: checklist.name,
		description: checklist.description,
		items: checklist.items.map((item) => ({
			...item,
			isDone: false,
			completedAt: undefined
		})),
		createdAt: new Date()
	};

	templates.update((t) => [...t, newTemplate]);
	return newTemplate;
}

export function createChecklistFromTemplate(templateId: string) {
	let newChecklist: Checklist | null = null;

	templates.update((temps) => {
		const template = temps.find((t) => t.id === templateId);
		if (template) {
			newChecklist = {
				id: `checklist-${Date.now()}`,
				name: template.name,
				description: template.description,
				items: template.items.map((item) => ({
					...item,
					id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					isDone: false,
					createdAt: new Date(),
					completedAt: undefined
				})),
				templateId: template.id,
				createdAt: new Date()
			};

			// Update the lastUsed field on the template
			return temps.map((t) => (t.id === templateId ? { ...t, lastUsed: new Date() } : t));
		}
		return temps;
	});

	if (newChecklist) {
		checklists.update((lists) => [...lists, newChecklist!]);
		currentChecklist.set(newChecklist);
	}

	return newChecklist;
}

export function createNewChecklist(name: string, description?: string) {
	const newChecklist: Checklist = {
		id: `checklist-${Date.now()}`,
		name,
		description,
		items: [],
		createdAt: new Date()
	};

	checklists.update((lists) => [...lists, newChecklist]);
	currentChecklist.set(newChecklist);

	return newChecklist;
}

export function deleteChecklist(checklistId: string) {
	checklists.update((lists) => lists.filter((list) => list.id !== checklistId));

	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return null;
		}
		return list;
	});
}

export function deleteTemplate(templateId: string) {
	templates.update((temps) => temps.filter((temp) => temp.id !== templateId));
}

// Add these functions to src/lib/stores.ts

// Update a checklist item
export function updateChecklistItem(
	checklistId: string,
	itemId: string,
	updates: {
		title?: string;
		description?: string | null;
	}
) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					items: list.items.map((item) => {
						if (item.id === itemId) {
							return {
								...item,
								title: updates.title ?? item.title,
								description:
									updates.description === null
										? undefined
										: (updates.description ?? item.description)
							};
						}
						return item;
					})
				};
			}
			return list;
		});
	});

	// Also update currentChecklist if it matches
	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return {
				...list,
				items: list.items.map((item) => {
					if (item.id === itemId) {
						return {
							...item,
							title: updates.title ?? item.title,
							description:
								updates.description === null ? undefined : (updates.description ?? item.description)
						};
					}
					return item;
				})
			};
		}
		return list;
	});
}

// Delete a checklist item
export function deleteChecklistItem(checklistId: string, itemId: string) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					items: list.items.filter((item) => item.id !== itemId)
				};
			}
			return list;
		});
	});

	// Also update currentChecklist if it matches
	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return {
				...list,
				items: list.items.filter((item) => item.id !== itemId)
			};
		}
		return list;
	});
}

// Set recurrence pattern
export function setChecklistRecurrence(
	checklistId: string,
	pattern: RecurrencePattern,
	customData?: any
) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					recurrencePattern: pattern
					// Store customData in a real application
				};
			}
			return list;
		});
	});

	// Also update currentChecklist if it matches
	currentChecklist.update((list) => {
		if (list && list.id === checklistId) {
			return {
				...list,
				recurrencePattern: pattern
				// Store customData in a real application
			};
		}
		return list;
	});
}
