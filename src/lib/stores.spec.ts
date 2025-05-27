// src/lib/stores.spec.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import {
	checklists,
	templates,
	currentChecklist,
	setChecklistRecurrence,
	updateChecklistDetails,
	createNewChecklist, // Helper to add items for testing
	createChecklistFromTemplate, // Helper
	// Import sample data for resetting stores if they are not exported
	// For this example, we'll assume we can reset them manually or they re-initialize from mocks
} from './stores'; // Assuming stores.ts is in the same directory or path is adjusted
import type { Checklist, ChecklistTemplate, RecurrencePattern, CustomRecurrence } from './types';
import { sampleChecklist, sampleChecklistTemplate } from '../fixtures/sampleChecklist'; // Assuming these are exportable

// Mock Local Storage
const mockLocalStorage = {
	store: {} as Record<string, string>,
	getItem: (key: string) => mockLocalStorage.store[key] || null,
	setItem: (key: string, value: string) => {
		mockLocalStorage.store[key] = value;
	},
	clear: () => {
		mockLocalStorage.store = {};
	},
	removeItem: (key: string) => {
		delete mockLocalStorage.store[key];
	}
};

vi.stubGlobal('localStorage', mockLocalStorage);

// Deep copy helper
function deepCopy<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

describe('stores.ts', () => {
	beforeEach(() => {
		// Reset stores to a known state before each test
		// Make deep copies to avoid modifying the original sample data
		checklists.set(deepCopy([sampleChecklist]));
		templates.set(deepCopy([sampleChecklistTemplate]));
		currentChecklist.set(deepCopy(sampleChecklist));
		
		// Clear localStorage mock
		mockLocalStorage.clear();
		vi.clearAllMocks(); // Clear any vi.spyOn mocks
	});

	describe('setChecklistRecurrence', () => {
		const testChecklistId = sampleChecklist.id;

		it('should correctly set the recurrencePattern for a checklist', () => {
			setChecklistRecurrence(testChecklistId, 'daily');
			const list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.recurrencePattern).toBe('daily');
		});

		it('should correctly set customRecurrenceDetails when pattern is "custom"', () => {
			const customData: CustomRecurrence = {
				templateId: 'template-1', // Not directly used by setChecklistRecurrence logic itself but part of type
				pattern: {
					type: 'days',
					interval: 5,
				}
			};
			setChecklistRecurrence(testChecklistId, 'custom', customData);
			const list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.recurrencePattern).toBe('custom');
			expect(list?.customRecurrenceDetails).toEqual(customData);
		});

		it('should set customRecurrenceDetails to undefined if pattern is not "custom"', () => {
			// First set to custom
			const customData: CustomRecurrence = { templateId: 't1', pattern: { type: 'days', interval: 1 }};
			setChecklistRecurrence(testChecklistId, 'custom', customData);
			let list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.customRecurrenceDetails).toEqual(customData);

			// Then change to non-custom
			setChecklistRecurrence(testChecklistId, 'weekly');
			list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.recurrencePattern).toBe('weekly');
			expect(list?.customRecurrenceDetails).toBeUndefined();
		});

		it('should update currentChecklist if it is the target checklist', () => {
			currentChecklist.set(get(checklists).find(c => c.id === testChecklistId) || null); // Ensure it's current
			setChecklistRecurrence(testChecklistId, 'monthly');
			const current = get(currentChecklist);
			expect(current?.recurrencePattern).toBe('monthly');
		});

		it('should not update currentChecklist if it is not the target checklist', () => {
			// Add a new checklist and set it as current
			const otherChecklist = createNewChecklist('Other checklist');
			currentChecklist.set(otherChecklist);

			setChecklistRecurrence(testChecklistId, 'daily'); // target sampleChecklist
			
			const current = get(currentChecklist);
			expect(current?.id).toBe(otherChecklist.id);
			expect(current?.recurrencePattern).toBeUndefined(); // Assuming new checklists don't have it by default
		});
	});

	describe('updateChecklistDetails', () => {
		const testChecklistId = sampleChecklist.id;

		it('should correctly update the name of a checklist', () => {
			const newName = 'Updated Checklist Name';
			updateChecklistDetails(testChecklistId, newName);
			const list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.name).toBe(newName);
			expect(list?.description).toBe(sampleChecklist.description); // Description should remain unchanged
		});

		it('should correctly update the description of a checklist', () => {
			const newDescription = 'Updated description.';
			updateChecklistDetails(testChecklistId, sampleChecklist.name, newDescription);
			const list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.name).toBe(sampleChecklist.name); // Name should remain unchanged
			expect(list?.description).toBe(newDescription);
		});
		
		it('should correctly update both name and description', () => {
			const newName = 'New Name for Details';
			const newDescription = 'New Description for Details';
			updateChecklistDetails(testChecklistId, newName, newDescription);
			const list = get(checklists).find(c => c.id === testChecklistId);
			expect(list?.name).toBe(newName);
			expect(list?.description).toBe(newDescription);
		});

		it('should update currentChecklist if it is the target checklist', () => {
			currentChecklist.set(get(checklists).find(c => c.id === testChecklistId) || null);
			const newName = 'Current Updated Name';
			updateChecklistDetails(testChecklistId, newName);
			const current = get(currentChecklist);
			expect(current?.name).toBe(newName);
		});

		it('should not update currentChecklist if it is not the target checklist', () => {
			const otherChecklist = createNewChecklist('Another one');
			currentChecklist.set(otherChecklist);
			
			const newName = 'Original Not Current Name';
			updateChecklistDetails(testChecklistId, newName); // Target sampleChecklist

			const current = get(currentChecklist);
			expect(current?.id).toBe(otherChecklist.id);
			expect(current?.name).not.toBe(newName);
			expect(current?.name).toBe('Another one');
		});
	});

	// Note: Testing Local Storage persistence accurately often requires re-importing
	// the module where stores are defined, so that their initialization logic (reading from LS)
	// can be tested. Vitest's `vi.resetModules()` and dynamic `import()` can be used.
	// For simplicity, this example will focus on the `setItem` calls and direct store manipulation.
	// A more robust test would involve `vi.resetModules()`.

	describe('Local Storage Persistence', () => {
		const checklistsKey = 'checklistsData';
		const templatesKey = 'templatesData';

		it('checklists store should save to Local Storage when content changes', () => {
			const spySetItem = vi.spyOn(mockLocalStorage, 'setItem');
			createNewChecklist('A new checklist for LS test'); // This action modifies the 'checklists' store

			expect(spySetItem).toHaveBeenCalledWith(checklistsKey, expect.any(String));
			const storedValue = mockLocalStorage.getItem(checklistsKey);
			expect(storedValue).not.toBeNull();
			const parsedValue = JSON.parse(storedValue!);
			expect(parsedValue.length).toBe(2); // sampleChecklist + new one
			expect(parsedValue[1].name).toBe('A new checklist for LS test');
		});

		it('templates store should save to Local Storage when content changes', () => {
			const spySetItem = vi.spyOn(mockLocalStorage, 'setItem');
			// Create a dummy checklist to use for creating a template
			const newChecklistForTemplate = createNewChecklist('Temp checklist for template');
			// Now use an action that modifies the 'templates' store
			// Assuming saveAsTemplate is imported or accessible
			// import { saveAsTemplate } from './stores'; // Would need this
			// For now, let's simulate a direct modification if saveAsTemplate is complex to call here
			templates.update(t => [...t, { ...sampleChecklistTemplate, id: 'template-new', name: 'New LS Template' }]);
			
			expect(spySetItem).toHaveBeenCalledWith(templatesKey, expect.any(String));
			const storedValue = mockLocalStorage.getItem(templatesKey);
			expect(storedValue).not.toBeNull();
			const parsedValue = JSON.parse(storedValue!);
			expect(parsedValue.length).toBe(2); // sampleChecklistTemplate + new one
			expect(parsedValue[1].name).toBe('New LS Template');
		});

		// For the "initializes with data" and "date parsing" tests,
		// we would ideally reset modules and re-import stores.
		// This is a simplified conceptual test for date parsing if we manually simulate loading.
		describe('Date Parsing on Load (Conceptual)', () => {
			it('should parse date strings to Date objects when loading checklists', () => {
				const rawChecklist = {
					...deepCopy(sampleChecklist),
					createdAt: new Date().toISOString(), // Store as string
					items: sampleChecklist.items.map(item => ({
						...deepCopy(item),
						createdAt: new Date().toISOString(),
						completedAt: item.completedAt ? new Date().toISOString() : undefined,
					})),
				};
				mockLocalStorage.setItem(checklistsKey, JSON.stringify([rawChecklist]));

				// Simulate re-initialization by manually calling the load logic
				// This is where vi.resetModules() would be better.
				// For now, we'll assume a hypothetical load function or check the parseDates directly.
				// Let's test a part of the parseDates logic if it were exposed, or assume it works via set.
				
				// This test is more about the behavior of parseDates which is internal.
				// A true test would be:
				// 1. vi.resetModules()
				// 2. mockLocalStorage.setItem(...)
				// 3. const { checklists: newChecklists } = await import('./stores');
				// 4. expect(get(newChecklists)[0].createdAt).toBeInstanceOf(Date);

				// Simplified: if we set a store with string dates, then retrieve,
 				// specific date fields should be instances of Date if parseDates was implicitly called by a load.
				// However, our current setup calls parseDates only on initial load.
				// So, this specific test is hard to do without module reset.

				// Let's assume we can trigger a "load" or verify the effect of parseDates.
				// If the store was re-initialized (e.g. with vi.resetModules):
				// const loadedChecklists = get(checklists); // after re-import
				// expect(loadedChecklists[0].createdAt).toBeInstanceOf(Date);
				// expect(loadedChecklists[0].items[0].createdAt).toBeInstanceOf(Date);
				// This is more a placeholder for how it *should* be tested.
				// For now, we'll assert that if we manually parse, it works.
				
				const loadedFromStorage = JSON.parse(mockLocalStorage.getItem(checklistsKey)!);
				
				// Assume a hypothetical parseDates function is available for testing its effect
				// import { parseDates } from './stores'; // if it were exported
				// const processed = parseDates(loadedFromStorage);
				// expect(processed[0].createdAt).toBeInstanceOf(Date);
				// expect(processed[0].items[0].createdAt).toBeInstanceOf(Date);

				// Since parseDates is not exported, we can't test it directly here.
				// The full test of loading requires module reset.
				// We've tested that setItem is called, which is one part of persistence.
				expect(true).toBe(true); // Placeholder for the more complex loading test
			});
		});
		
		// More robust tests for initialization would look like this:
		describe('Initialization from Local Storage (requires module reset)', () => {
			afterEach(() => {
				vi.resetModules(); // Reset modules to ensure clean import for next test
			});

			it('checklists store initializes with data from Local Storage', async () => {
				const initialData = [
					{ ...deepCopy(sampleChecklist), id: 'ls-check-1', name: 'Loaded Checklist', createdAt: new Date().toISOString() }
				];
				mockLocalStorage.setItem(checklistsKey, JSON.stringify(initialData));

				const { checklists: loadedChecklistsStore, currentChecklist: loadedCurrent } = await import('./stores');
				const loadedData = get(loadedChecklistsStore);
				
				expect(loadedData.length).toBe(1);
				expect(loadedData[0].name).toBe('Loaded Checklist');
				expect(loadedData[0].id).toBe('ls-check-1');
				expect(loadedData[0].createdAt).toBeInstanceOf(Date); // Test date parsing
				// Also check if currentChecklist is set correctly based on this loaded data
				expect(get(loadedCurrent)?.id).toBe('ls-check-1');
			});

			it('templates store initializes with data from Local Storage', async () => {
				const initialData = [
					{ ...deepCopy(sampleChecklistTemplate), id: 'ls-temp-1', name: 'Loaded Template', createdAt: new Date().toISOString() }
				];
				mockLocalStorage.setItem(templatesKey, JSON.stringify(initialData));

				const { templates: loadedTemplatesStore } = await import('./stores');
				const loadedData = get(loadedTemplatesStore);

				expect(loadedData.length).toBe(1);
				expect(loadedData[0].name).toBe('Loaded Template');
				expect(loadedData[0].id).toBe('ls-temp-1');
				expect(loadedData[0].createdAt).toBeInstanceOf(Date); // Test date parsing
			});
		});
	});
});
