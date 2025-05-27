import type { Checklist } from "$lib/types";

export const sampleChecklist: Checklist = {
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