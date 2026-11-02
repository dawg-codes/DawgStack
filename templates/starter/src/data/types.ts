export type ProjectStatus = 'planning' | 'active' | 'at-risk' | 'done';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  /** 0 to 100. */
  progress: number;
  owner: string;
  /** ISO date. */
  due: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  /** Optional photo; the avatar falls back to initials. */
  avatarUrl?: string;
}

export interface ActivityItem {
  id: string;
  who: string;
  action: string;
  target: string;
  /** ISO date-time. */
  at: string;
}

export interface Stat {
  label: string;
  value: number;
  /** Short note shown under the value, e.g. "+3 this week". */
  note?: string;
}

export interface DashboardData {
  stats: Stat[];
  projects: Project[];
  team: Member[];
  activity: ActivityItem[];
}
