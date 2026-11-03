import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  createStatusBadge,
  type StatusMap,
} from '@dawg-codes/react-toolkit';
import { appConfig } from '../app.config';
import type { User, UserStatus } from '../data/types';
import { href } from '../router';

/** Logo and app name. Replace the SVG with your own logo. */
export function Brand() {
  return (
    <a className="brand" href={href('users')}>
      <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" />
        <path d="M10 17l4 4 8-9" />
      </svg>
      <span className="brand__name">{appConfig.name}</span>
    </a>
  );
}

const USER_STATUS: StatusMap<UserStatus> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'warning' },
};
/** A person's status as a coloured label. Change the wording and colours above. */
export const UserStatusBadge = createStatusBadge(USER_STATUS, { displayName: 'UserStatusBadge' });
export const statusLabel = (status: UserStatus) => USER_STATUS[status].label;

export const isYou = (user: User) => user.id === appConfig.currentUserId;

/**
 * Picture, name and email. On narrow screens, where the table hides its Status column, a
 * status other than Active shows here instead.
 */
export function UserCell({ user }: { user: User }) {
  return (
    <span className="user-cell">
      <Avatar name={user.name} size="sm" />
      <span className="two-line">
        <span className="user-cell__name">
          {user.name}
          {isYou(user) && (
            <Badge tone="neutral" size="sm">
              You
            </Badge>
          )}
          {user.status !== 'active' && (
            <span className="narrow-only">
              <UserStatusBadge status={user.status} size="sm" />
            </span>
          )}
        </span>
        <span className="two-line__sub">{user.email}</span>
      </span>
    </span>
  );
}

/** Shown when data fails to load. */
export function LoadError({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <Card>
      <EmptyState
        title={`We couldn't load ${what}`}
        description="Check your connection, then try again."
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    </Card>
  );
}
