import { useState, type FormEvent } from 'react';
import { Button } from '@dawg-codes/react-toolkit';
import { Dialog } from '@dawg-codes/react-toolkit/dialog';
import { SelectField, TextArea, focusFirstInvalid } from '@dawg-codes/react-toolkit/form';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { appConfig } from '../app.config';
import { inviteUsers } from '../data/api';
import type { Role, User } from '../data/types';
import { errorMessage, parseEmails, people } from '../messages';
import { ROLES, ROLE_ORDER } from '../roles';

const FORM_ID = 'invite-form';

/** Invite one or more people by email, all with the same role. */
export function InviteDialog({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited: (users: User[]) => void;
}) {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [role, setRole] = useState<Role>('member');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const close = () => {
    if (busy) return;
    onClose();
    setText('');
    setRole('member');
    setError(undefined);
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const { emails, invalid } = parseEmails(text);
    const problem =
      invalid.length > 0
        ? `These aren't email addresses: ${invalid.slice(0, 3).join(', ')}${invalid.length > 3 ? '…' : ''}`
        : emails.length === 0
          ? 'Enter at least one email address'
          : emails.length > appConfig.maxInvites
            ? `Invite up to ${appConfig.maxInvites} people at a time`
            : undefined;
    setError(problem);
    if (problem) {
      focusFirstInvalid(form);
      return;
    }
    setBusy(true);
    try {
      const { invited, alreadyMembers } = await inviteUsers(emails, role);
      onInvited(invited);
      toast({
        tone: invited.length ? 'success' : 'info',
        title: invited.length
          ? `Invited ${people(invited.length)} as ${ROLES[role].label.toLowerCase()}`
          : 'Nobody new to invite',
        description: alreadyMembers.length
          ? `Already here: ${alreadyMembers.join(', ')}`
          : undefined,
      });
      setBusy(false);
      onClose();
      setText('');
      setRole('member');
    } catch (err) {
      setBusy(false);
      toast({ tone: 'danger', title: errorMessage(err, 'invite'), duration: Infinity });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      dismissible={!busy}
      title="Invite people"
      description={`They'll get an email with a link to join ${appConfig.name}.`}
      footer={
        <>
          <Button onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID} variant="primary" loading={busy}>
            Send invitations
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className="dialog-form" onSubmit={submit} noValidate>
        <TextArea
          label="Email addresses"
          hint={`Separate addresses with commas or new lines. Up to ${appConfig.maxInvites} at a time.`}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError(undefined); // checked again on Send
          }}
          error={error}
          rows={3}
          autoGrow
          spellCheck={false}
          autoComplete="off"
          required
        />
        <SelectField
          label="Role"
          hint={ROLES[role].description}
          options={ROLE_ORDER.map((value) => ({ value, label: ROLES[value].label }))}
          value={role}
          onChange={(event) => setRole(event.target.value as Role)}
        />
      </form>
    </Dialog>
  );
}
