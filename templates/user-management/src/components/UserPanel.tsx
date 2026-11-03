import { Button } from '@dawg-codes/react-toolkit';
import { Dialog } from '@dawg-codes/react-toolkit/dialog';
import type { User } from '../data/types';
import { formatDate, formatRelative } from '../format';
import { ROLES } from '../roles';
import { UserStatusBadge, isYou } from './parts';

export interface UserActions {
  changeRole: (user: User) => void;
  resendInvite: (user: User) => void;
  suspend: (user: User) => void;
  reactivate: (user: User) => void;
  remove: (user: User) => void;
}

/** A side panel with one person's details and the actions that apply to them. */
export function UserPanel({
  user,
  onClose,
  actions,
  busy,
}: {
  user: User | null;
  onClose: () => void;
  actions: UserActions;
  busy: boolean;
}) {
  const you = user ? isYou(user) : false;
  return (
    <Dialog
      open={user !== null}
      onClose={onClose}
      placement="end"
      title={user?.name ?? 'Person'}
      description={user?.email}
      footer={
        user &&
        !you && (
          <>
            {user.status === 'invited' && (
              <Button onClick={() => actions.resendInvite(user)} loading={busy}>
                Resend invitation
              </Button>
            )}
            {user.status === 'active' && (
              <Button onClick={() => actions.suspend(user)}>Suspend</Button>
            )}
            {user.status === 'suspended' && (
              <Button onClick={() => actions.reactivate(user)} loading={busy}>
                Reactivate
              </Button>
            )}
            <Button variant="danger" onClick={() => actions.remove(user)}>
              {user.status === 'invited' ? 'Cancel invitation' : 'Remove'}
            </Button>
          </>
        )
      }
    >
      {user && (
        <div className="panel-body">
          <dl className="details">
            <dt>Role</dt>
            <dd className="details__role">
              <span>
                <strong>{ROLES[user.role].label}</strong>
                <span className="details__hint">{ROLES[user.role].description}</span>
              </span>
              {!you && (
                <Button size="sm" onClick={() => actions.changeRole(user)}>
                  Change
                </Button>
              )}
            </dd>
            <dt>Status</dt>
            <dd>
              <UserStatusBadge status={user.status} />
            </dd>
            <dt>Last active</dt>
            <dd>{user.lastActiveAt ? formatRelative(user.lastActiveAt) : 'Hasn’t joined yet'}</dd>
            <dt>Added</dt>
            <dd>{formatDate(user.addedAt)}</dd>
          </dl>
          {you && (
            <p className="panel-note">
              This is you. Ask another owner to change your role or remove you.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
