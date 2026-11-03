import type { Role } from './data/types';

/**
 * The roles people can have, from most to least access. Rename them, change the wording, or
 * add and remove roles here and in the `Role` type in data/types.ts.
 */
export const ROLE_ORDER: readonly Role[] = ['owner', 'admin', 'member', 'viewer'];

export const ROLES: Record<Role, { label: string; description: string }> = {
  owner: {
    label: 'Owner',
    description: 'Everything, including billing and deleting the workspace.',
  },
  admin: {
    label: 'Admin',
    description: 'Manage people and settings, and everything a member can do.',
  },
  member: {
    label: 'Member',
    description: 'Create and edit projects, and comment.',
  },
  viewer: {
    label: 'Viewer',
    description: 'See projects and reports, and comment. Can’t make changes.',
  },
};

/**
 * What each role can do, shown on the Roles page. This is a description for people: your
 * server is what actually allows or refuses each action.
 */
export const PERMISSIONS: readonly { label: string; roles: readonly Role[] }[] = [
  { label: 'See projects and reports', roles: ['owner', 'admin', 'member', 'viewer'] },
  { label: 'Comment', roles: ['owner', 'admin', 'member', 'viewer'] },
  { label: 'Create and edit projects', roles: ['owner', 'admin', 'member'] },
  { label: 'Invite people and change roles', roles: ['owner', 'admin'] },
  { label: 'Change workspace settings', roles: ['owner', 'admin'] },
  { label: 'Manage billing', roles: ['owner'] },
  { label: 'Delete the workspace', roles: ['owner'] },
];

export const roleLabel = (role: Role) => ROLES[role].label;
