import { appConfig } from '../app.config';
import { sampleUsers } from './sample';
import type { InviteResult, Role, User } from './types';

/**
 * Every call to your backend lives in this file. Replace each function body with a real
 * request, for example:
 *
 *   const response = await fetch('/api/users', { signal, credentials: 'include' });
 *   if (!response.ok) throw new ApiError('network');
 *   return (await response.json()) as User[];
 *
 * The pages only use these functions, ApiError and the types in types.ts. Until then, they
 * work on the made-up people in sample.ts after a short pause, so loading states are visible.
 *
 * Your server must check every request again, whatever the screens allow: that the signed-in
 * person may manage people, that nobody changes their own role or removes themselves, that at
 * least one owner always remains, and that invitations are rate-limited.
 */

/** Why a request failed. The wording people see is in src/messages.ts. */
export type ApiErrorCode = 'self' | 'not-found' | 'network';

export class ApiError extends Error {
  constructor(public readonly code: ApiErrorCode) {
    super(code);
    this.name = 'ApiError';
  }
}

export async function loadUsers(signal?: AbortSignal): Promise<User[]> {
  await delay(500, signal);
  return users.map(copy);
}

/** Invite people by email. Addresses that already belong to someone are skipped. */
export async function inviteUsers(emails: readonly string[], role: Role): Promise<InviteResult> {
  await delay(700);
  const taken = new Set(users.map((u) => u.email.toLowerCase()));
  const alreadyMembers = emails.filter((email) => taken.has(email.toLowerCase()));
  const invited = emails
    .filter((email) => !taken.has(email.toLowerCase()))
    .map((email): User => ({
      id: `u-${nextId++}`,
      name: email.split('@')[0]!,
      email,
      role,
      status: 'invited',
      lastActiveAt: null,
      addedAt: new Date().toISOString(),
    }));
  users = [...invited, ...users];
  return { invited: invited.map(copy), alreadyMembers };
}

export async function resendInvite(id: string): Promise<void> {
  await delay(500);
  find(id);
}

export async function changeRole(ids: readonly string[], role: Role): Promise<User[]> {
  await delay(600);
  refuseSelf(ids);
  return update(ids, (u) => ({ ...u, role }));
}

/** Suspends the active people among `ids`; returns the people who changed. */
export async function suspendUsers(ids: readonly string[]): Promise<User[]> {
  await delay(600);
  refuseSelf(ids);
  return update(
    ids.filter((id) => find(id).status === 'active'),
    (u) => ({ ...u, status: 'suspended' }),
  );
}

/** Reactivates the suspended people among `ids`; returns the people who changed. */
export async function reactivateUsers(ids: readonly string[]): Promise<User[]> {
  await delay(600);
  return update(
    ids.filter((id) => find(id).status === 'suspended'),
    (u) => ({ ...u, status: 'active' }),
  );
}

/** Removes people, or cancels their invitations. */
export async function removeUsers(ids: readonly string[]): Promise<void> {
  await delay(700);
  refuseSelf(ids);
  ids.forEach(find);
  users = users.filter((u) => !ids.includes(u.id));
}

// ---- Demo state (in memory; resets when the page reloads) ----
// Callers get copies, as they would from a real server.
const copy = (user: User): User => ({ ...user });
let users = sampleUsers.map(copy);
let nextId = users.length + 1;

function find(id: string): User {
  const user = users.find((u) => u.id === id);
  if (!user) throw new ApiError('not-found');
  return user;
}
function refuseSelf(ids: readonly string[]) {
  if (ids.includes(appConfig.currentUserId)) throw new ApiError('self');
}
function update(ids: readonly string[], change: (user: User) => User): User[] {
  ids.forEach(find);
  users = users.map((u) => (ids.includes(u.id) ? change(u) : u));
  return users.filter((u) => ids.includes(u.id)).map(copy);
}
function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
