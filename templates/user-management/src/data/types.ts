/** The shapes of the data the pages use. Match them to what your backend returns. */

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

/** `invited`: hasn't accepted the invitation yet. `suspended`: can't sign in until reactivated. */
export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  /** ISO date-time of their last visit, or null if they haven't signed in yet. */
  lastActiveAt: string | null;
  /** ISO date-time they were added (invited). */
  addedAt: string;
}

export interface InviteResult {
  invited: User[];
  /** Addresses that already belong to someone here, so weren't invited again. */
  alreadyMembers: string[];
}
