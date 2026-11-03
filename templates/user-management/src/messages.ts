import { ApiError } from './data/api';

/** All the wording for failed requests and field checks, in one place. */

export type Action = 'role' | 'suspend' | 'reactivate' | 'remove' | 'invite' | 'resend';

const SELF: Partial<Record<Action, string>> = {
  role: 'You can’t change your own role.',
  suspend: 'You can’t suspend yourself.',
  remove: 'You can’t remove yourself.',
};

export function errorMessage(error: unknown, action: Action): string {
  if (error instanceof ApiError && error.code === 'self') {
    return `${SELF[action] ?? 'You can’t do that to yourself.'} Unselect yourself and try again.`;
  }
  if (error instanceof ApiError && error.code === 'not-found') {
    return 'Someone else changed this list. Reload the page and try again.';
  }
  return 'Something went wrong. Check your connection and try again.';
}

/** "1 person" / "3 people". */
export const people = (count: number) => (count === 1 ? '1 person' : `${count} people`);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reads a list of addresses separated by commas, semicolons, spaces or new lines. Returns the
 * unique valid addresses and any text that isn't an address.
 */
export function parseEmails(text: string): { emails: string[]; invalid: string[] } {
  const parts = text
    .split(/[\s,;]+/)
    .map((part) => part.trim().replace(/^<|>$/g, ''))
    .filter(Boolean);
  const seen = new Set<string>();
  const emails: string[] = [];
  const invalid: string[] = [];
  for (const part of parts) {
    if (!EMAIL.test(part)) invalid.push(part);
    else if (!seen.has(part.toLowerCase())) {
      seen.add(part.toLowerCase());
      emails.push(part);
    }
  }
  return { emails, invalid };
}
