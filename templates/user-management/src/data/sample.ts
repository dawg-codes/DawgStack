import type { Role, User, UserStatus } from './types';

/** Made-up demo data. Delete this file once src/data/api.ts talks to your backend. */

const FIRST = [
  'Ana',
  'Ben',
  'Chen',
  'Dara',
  'Eli',
  'Fatima',
  'Gus',
  'Hana',
  'Ivan',
  'Jo',
  'Kiri',
  'Leo',
  'Mara',
  'Nico',
  'Omar',
  'Priya',
];
const LAST = ['Silva', 'Okafor', 'Li', 'Novak', 'Haddad', 'Moreau', 'Tanaka', 'Rossi', 'Ndiaye'];
// Dates are relative to now, so the demo always looks recent.
const NOW = Date.now();
const DAY = 86_400_000;

function roleFor(i: number): Role {
  if (i === 0 || i === 6) return 'owner';
  if (i % 9 === 1) return 'admin';
  return i % 4 === 3 ? 'viewer' : 'member';
}
function statusFor(i: number): UserStatus {
  if (i === 0) return 'active';
  if (i % 11 === 5) return 'invited';
  if (i % 13 === 9) return 'suspended';
  return 'active';
}

export const sampleUsers: User[] = Array.from({ length: 46 }, (_, i) => {
  // Every first and last name pairing is different, so names and emails are unique.
  const first = FIRST[i % FIRST.length]!;
  const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length]!;
  const status = statusFor(i);
  const addedAt = new Date(NOW - (i === 0 ? 720 : 30 + ((i * 53) % 600)) * DAY).toISOString();
  return {
    id: `u-${String(i + 1).padStart(2, '0')}`,
    name: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    role: roleFor(i),
    status,
    lastActiveAt:
      status === 'invited' ? null : new Date(NOW - ((i * 37) % 900) * 3_600_000).toISOString(),
    addedAt,
  };
});
