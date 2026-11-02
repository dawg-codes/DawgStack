import { useState } from 'react';
import { Button, Card, CardTitle } from '@dawg-codes/react-toolkit';
import { ConfirmDialog, Dialog } from '@dawg-codes/react-toolkit/dialog';
import { SelectField, TextField } from '@dawg-codes/react-toolkit/form';
import { DropdownMenu, type MenuItem } from '@dawg-codes/react-toolkit/menu';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { ArchiveIcon, CopyIcon, EditIcon, MoreIcon, TrashIcon } from './icons';

const PROJECTS = ['Website redesign', 'Mobile app', 'Billing migration', 'Help centre'];

export function OverlaysDemo() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [terms, setTerms] = useState(false);

  const save = () => {
    setEditing(false);
    toast({ title: 'Profile saved', tone: 'success' });
  };
  const confirmDelete = () => {
    setBusy(true);
    // Pretend to call a server.
    setTimeout(() => {
      const name = deleting;
      setBusy(false);
      setDeleting(null);
      toast({
        title: `${name} deleted`,
        action: {
          label: 'Undo',
          onClick: () => toast({ title: `${name} restored`, tone: 'info' }),
        },
      });
    }, 900);
  };

  const rowActions = (name: string): MenuItem[] => [
    { label: 'Edit', icon: <EditIcon />, onSelect: () => setEditing(true) },
    {
      label: 'Duplicate',
      icon: <CopyIcon />,
      onSelect: () => toast({ title: `${name} duplicated` }),
    },
    { label: 'Archive', icon: <ArchiveIcon />, disabled: true },
    'separator',
    { label: 'Delete', icon: <TrashIcon />, tone: 'danger', onSelect: () => setDeleting(name) },
  ];

  return (
    <div className="pg-grid pg-form-grid">
      <Card>
        <CardTitle as="h3">Dialogs</CardTitle>
        <div className="pg-row">
          <Button variant="primary" onClick={() => setEditing(true)}>
            Edit profile
          </Button>
          <Button variant="danger" onClick={() => setDeleting('Website redesign')}>
            Delete project
          </Button>
          <Button variant="outline" onClick={() => setTerms(true)}>
            Long content
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle as="h3">Toasts</CardTitle>
        <div className="pg-row">
          <Button onClick={() => toast({ title: 'Link copied' })}>Neutral</Button>
          <Button
            onClick={() =>
              toast({ title: 'Saved', description: 'Your changes are live.', tone: 'success' })
            }
          >
            Success
          </Button>
          <Button
            onClick={() =>
              toast({
                title: 'Storage almost full',
                description: '92% of 10 GB used.',
                tone: 'warning',
              })
            }
          >
            Warning
          </Button>
          <Button
            onClick={() =>
              toast({
                title: "Couldn't upload report.pdf",
                description: 'Check your connection and try again.',
                tone: 'danger',
                duration: Infinity,
              })
            }
          >
            Error (stays)
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle as="h3">Menus</CardTitle>
        <div className="pg-row">
          <DropdownMenu label="Actions" items={rowActions('Website redesign')} />
          <DropdownMenu
            label={<MoreIcon />}
            iconOnly
            aria-label="More options"
            variant="ghost"
            align="end"
            items={[
              { label: 'Help centre', href: '#menus-help' },
              { label: 'Keyboard shortcuts', onSelect: () => toast({ title: 'Shortcuts' }) },
            ]}
          />
        </div>
        {/* A scrolling container: the menus still show in full. */}
        <div className="pg-clip" role="group" aria-label="Projects">
          {PROJECTS.map((name) => (
            <div key={name} className="pg-clip-row">
              <span>{name}</span>
              <DropdownMenu
                label={<MoreIcon />}
                iconOnly
                aria-label={`Actions for ${name}`}
                variant="ghost"
                size="sm"
                align="end"
                items={rowActions(name)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Dialog
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit profile"
        description="This is shown to people you work with."
        footer={
          <>
            <Button onClick={() => setEditing(false)}>Cancel</Button>
            <Button variant="primary" type="submit" form="pg-profile">
              Save
            </Button>
          </>
        }
      >
        <form
          id="pg-profile"
          className="pg-form"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <TextField label="Display name" defaultValue="Ana Silva" required />
          <SelectField label="Time zone" options={['UTC', 'Europe/Lisbon', 'Asia/Tokyo']} />
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title={`Delete ${deleting ?? 'project'}?`}
        description="Its files and history will be removed. You can undo this for a few seconds."
        confirmLabel="Delete project"
        tone="danger"
        loading={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <Dialog
        open={terms}
        onClose={() => setTerms(false)}
        title="Terms of service"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setTerms(false)}>
            I understand
          </Button>
        }
      >
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i}>
            Section {i + 1}. Only the body of a dialog scrolls, so its title and actions stay in
            view however long the content is. The page behind it doesn't scroll while it is open.
          </p>
        ))}
      </Dialog>
    </div>
  );
}
