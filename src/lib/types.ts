// src/lib/types.ts - Data structures
export type RecurrencePattern = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface ChecklistItem {
	id: string;
	title: string;
	description?: string;
	isDone: boolean;
	createdAt: Date;
	completedAt?: Date;
}

export interface ChecklistTemplate {
	id: string;
	name: string;
	description?: string;
	items: ChecklistItem[];
	createdAt: Date;
	lastUsed?: Date;
}

export interface Checklist {
	id: string;
	name: string;
	description?: string;
	items: ChecklistItem[];
	templateId?: string; // If created from a template
	recurrencePattern?: RecurrencePattern;
	createdAt: Date;
	completedAt?: Date;
}

export interface CustomRecurrence {
	templateId: string;
	pattern: {
		type: 'days' | 'weeks' | 'months';
		interval: number; // e.g., every 2 days, every 3 weeks
		daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
		daysOfMonth?: number[]; // 1-31
	};
}
