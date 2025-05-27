import { writable, get } from 'svelte/store';
import type {
	Checklist,
	ChecklistTemplate,
	ChecklistItem,
	RecurrencePattern,
	CustomRecurrence
} from './types';
import { sampleChecklist } from '../fixtures/sampleChecklist';

/**
 *
 */
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

// --- Local Storage Persistence ---

const LOCAL_STORAGE_KEYS_CHECKLISTS = 'checklistsData';
const LOCAL_STORAGE_KEYS_TEMPLATES = 'templatesData';

// Helper function to recursively parse date strings to Date objects
function parseDates(obj: any): any {
	if (!obj) return obj;
	if (typeof obj === 'string') {
		// Basic ISO date string check
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(obj)) {
			const date = new Date(obj);
			if (!isNaN(date.getTime())) return date;
		}
	} else if (Array.isArray(obj)) {
		return obj.map((item) => parseDates(item));
	} else if (typeof obj === 'object') {
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				// Date keys in Checklist, ChecklistItem, ChecklistTemplate
				if (['createdAt', 'completedAt', 'lastUsed'].includes(key)) {
					if (obj[key]) {
						const date = new Date(obj[key]);
						if (!isNaN(date.getTime())) {
							obj[key] = date;
						} else {
							// console.warn(`Failed to parse date for key ${key}:`, obj[key]);
						}
					}
				} else {
					obj[key] = parseDates(obj[key]); // Recurse for nested objects/arrays
				}
			}
		}
	}
	return obj;
}

// Load initial data for checklists
let initialChecklists: Checklist[] = [sampleChecklist]; // Default
if (typeof window !== 'undefined') {
	try {
		const storedChecklists = localStorage.getItem(LOCAL_STORAGE_KEYS_CHECKLISTS);
		if (storedChecklists) {
			const parsed = JSON.parse(storedChecklists);
			initialChecklists = parseDates(parsed);
		}
	} catch (error) {
		console.error('Error loading checklists from Local Storage:', error);
		// Fallback to sampleChecklist is already default
	}
}

// Load initial data for templates
let initialTemplates: ChecklistTemplate[] = sampleTemplates; // Default
if (typeof window !== 'undefined') {
	try {
		const storedTemplates = localStorage.getItem(LOCAL_STORAGE_KEYS_TEMPLATES);
		if (storedTemplates) {
			const parsed = JSON.parse(storedTemplates);
			initialTemplates = parseDates(parsed);
		}
	} catch (error) {
		console.error('Error loading templates from Local Storage:', error);
		// Fallback to sampleTemplates is already default
	}
}

// Create stores
export const checklists = writable<Checklist[]>(initialChecklists);
export const templates = writable<ChecklistTemplate[]>(initialTemplates);

// Determine initial currentChecklist
// If initialChecklists has data and sampleChecklist (by id) is in it, use that.
// Otherwise, if initialChecklists has any data, use the first one.
// Otherwise, set to null.
let initialCurrentChecklist: Checklist | null = null;
if (initialChecklists.length > 0) {
	const sampleInLoaded = initialChecklists.find(c => c.id === sampleChecklist.id);
	if (sampleInLoaded) {
		initialCurrentChecklist = sampleInLoaded;
	} else {
		initialCurrentChecklist = initialChecklists[0];
	}
}
export const currentChecklist = writable<Checklist | null>(initialCurrentChecklist);


// Subscribe to changes and save to Local Storage
if (typeof window !== 'undefined') {
	checklists.subscribe((value) => {
		localStorage.setItem(LOCAL_STORAGE_KEYS_CHECKLISTS, JSON.stringify(value));
	});

	templates.subscribe((value) => {
		localStorage.setItem(LOCAL_STORAGE_KEYS_TEMPLATES, JSON.stringify(value));
	});
}

// --- Store actions ---

// Helper to update currentChecklist if it's the one being modified
function updateCurrentChecklistIfNeeded(checklistId: string, modifiedList: Checklist | null) {
    if (get(currentChecklist)?.id === checklistId) {
        currentChecklist.set(modifiedList);
    }
}

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

	// No direct update to currentChecklist here, it's derived or set by other actions.
	// The main checklists store update will trigger UI updates for components subcribed to currentChecklist
	// if currentChecklist happens to be the one modified.
	// However, if a checklist is modified, and it IS the currentChecklist, we should update it.
	const modifiedChecklist = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklist);
}

// Update checklist details (name and description)
export function updateChecklistDetails(
	checklistId: string,
	name: string,
	description?: string
) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					name: name,
					description: description
				};
			}
			return list;
		});
	});

	const modifiedChecklistAfterUpdate = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklistAfterUpdate);
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

	const modifiedChecklistAfterAddItem = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklistAfterAddItem);
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

	if (get(currentChecklist)?.id === checklistId) {
		currentChecklist.set(null); // Clear current if it's the one deleted
	}
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

	const modifiedChecklistAfterItemUpdate = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklistAfterItemUpdate);
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

	const modifiedChecklistAfterItemDelete = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklistAfterItemDelete);
}

// Set recurrence pattern
export function setChecklistRecurrence(
	checklistId: string,
	pattern: RecurrencePattern,
	customData?: CustomRecurrence
) {
	checklists.update((lists) => {
		return lists.map((list) => {
			if (list.id === checklistId) {
				return {
					...list,
					recurrencePattern: pattern,
					customRecurrenceDetails: pattern === 'custom' ? customData : undefined
				};
			}
			return list;
		});
	});

	const modifiedChecklistAfterRecurrence = get(checklists).find(c => c.id === checklistId) || null;
	updateCurrentChecklistIfNeeded(checklistId, modifiedChecklistAfterRecurrence);
}
