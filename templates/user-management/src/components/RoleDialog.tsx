import { useState } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import { Dialog } from '@dawg-codes/react-toolkit/dialog';
import { RadioGroup } from '@dawg-codes/react-toolkit/form';
import type { Role, User } from '../data/types';
import { people } from '../messages';
import { ROLES, ROLE_ORDER } from '../roles';

/**
 * Pick a new role for one person or several. Calls `onSave` with the chosen role; the caller
 * makes the request, so the same dialog serves the row menu, the details panel and bulk edits.
 */
export function RoleDialog({
  users,
  onClose,
  onSave,
  busy,
}: {
  /** Who to change. The dialog is open while this isn't empty. */
  users: User[];
  onClose: () => void;
  onSave: (role: Role) => void;
  busy: boolean;
}) {
  const open = users.length > 0;
  const [chosen, setChosen] = useState<Role | undefined>();
  // Who the dialog is about. Kept while it closes, so its title doesn't change on the way out.
  const [shown, setShown] = useState(users);
  if (open && shown !== users) {
    // Opened for different people: forget the previous choice.
    setShown(users);
    setChosen(undefined);
  }
  // Start from their current role when they all share one.
  const shared = shown.every((u) => u.role === shown[0]?.role) ? shown[0]?.role : undefined;
  const role = chosen ?? shared;
  const who = shown.length === 1 ? shown[0]!.name : shown.length ? people(shown.length) : 'people';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dismissible={!busy}
      size="sm"
      title={`Change role for ${who}`}
      description="Takes effect the next time they load a page."
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={busy}
            disabled={!role}
            onClick={() => role && onSave(role)}
          >
            Save role
          </Button>
        </>
      }
    >
      <RadioGroup
        label="Role"
        hideLabel
        variant="card"
        options={ROLE_ORDER.map((value) => ({
          value,
          label: ROLES[value].label,
          hint: ROLES[value].description,
        }))}
        value={role ?? ''}
        onValueChange={(value) => setChosen(value as Role)}
      />
    </Dialog>
  );
}
