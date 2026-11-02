import type { DashboardData } from './types';

// Fictional sample data. Dates are relative to today, so the demo never looks stale.
const day = 24 * 60 * 60 * 1000;
const fromNow = (ms: number) => new Date(Date.now() + ms).toISOString();

export const sampleDashboard: DashboardData = {
  stats: [
    { label: 'Active projects', value: 3, note: '1 needs attention' },
    { label: 'Tasks done this week', value: 42, note: '+8 on last week' },
    { label: 'Team members', value: 5 },
    { label: 'Open issues', value: 7, note: '2 high priority' },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Website redesign',
      status: 'active',
      progress: 64,
      owner: 'Maya Chen',
      due: fromNow(12 * day),
    },
    {
      id: 'p2',
      name: 'Mobile app launch',
      status: 'at-risk',
      progress: 38,
      owner: 'Leo Garcia',
      due: fromNow(5 * day),
    },
    {
      id: 'p3',
      name: 'Billing migration',
      status: 'active',
      progress: 81,
      owner: 'Priya Nair',
      due: fromNow(20 * day),
    },
    {
      id: 'p4',
      name: 'Help centre refresh',
      status: 'planning',
      progress: 10,
      owner: 'Sam Okafor',
      due: fromNow(45 * day),
    },
    {
      id: 'p5',
      name: 'Design system audit',
      status: 'done',
      progress: 100,
      owner: 'Ana Silva',
      due: fromNow(-3 * day),
    },
  ],
  team: [
    { id: 'm1', name: 'Maya Chen', role: 'Product lead' },
    { id: 'm2', name: 'Leo Garcia', role: 'Mobile engineer' },
    { id: 'm3', name: 'Priya Nair', role: 'Backend engineer' },
    { id: 'm4', name: 'Sam Okafor', role: 'Support lead' },
    { id: 'm5', name: 'Ana Silva', role: 'Designer' },
  ],
  activity: [
    {
      id: 'a1',
      who: 'Priya Nair',
      action: 'completed',
      target: 'Invoice export',
      at: fromNow(-25 * 60 * 1000),
    },
    {
      id: 'a2',
      who: 'Leo Garcia',
      action: 'flagged a risk on',
      target: 'Mobile app launch',
      at: fromNow(-3 * 60 * 60 * 1000),
    },
    {
      id: 'a3',
      who: 'Ana Silva',
      action: 'closed',
      target: 'Design system audit',
      at: fromNow(-1 * day),
    },
    {
      id: 'a4',
      who: 'Maya Chen',
      action: 'commented on',
      target: 'Website redesign',
      at: fromNow(-2 * day),
    },
  ],
};
