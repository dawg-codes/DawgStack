import { useState, type FormEvent } from 'react';
import { Button, Skeleton } from '@dawg-codes/react-toolkit';
import { Dialog } from '@dawg-codes/react-toolkit/dialog';
import {
  FormAlert,
  RadioGroup,
  SelectField,
  Switch,
  TextArea,
  TextField,
  focusFirstInvalid,
} from '@dawg-codes/react-toolkit/form';
import { PageHeader } from '@dawg-codes/react-toolkit/layout';
import { ThemeToggle, type AccentPresetName } from '@dawg-codes/react-toolkit/theme';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { appConfig } from '../app.config';
import { accentOptions, useAppearance } from '../appearance';
import { LoadError, Panel } from '../components/parts';
import {
  deleteWorkspace,
  loadNotificationSettings,
  loadProfile,
  saveNotificationSettings,
  saveProfile,
} from '../data/api';
import type { NotificationSettings, Profile } from '../data/types';
import { useLoad } from '../data/useLoad';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Lisbon',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Australia/Sydney',
];
const BIO_MAX = 280;

export function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Your profile, notifications and workspace." />
      <div className="page-stack settings">
        <ProfilePanel />
        <NotificationsPanel />
        <AppearancePanel />
        <DangerZone />
      </div>
    </>
  );
}

function ProfilePanel() {
  const { toast } = useToast();
  const { state, retry, update } = useLoad(loadProfile, []);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);

  if (state.status === 'error') return <LoadError what="your profile" onRetry={retry} />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const next: Profile = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      timezone: String(data.get('timezone') ?? 'UTC'),
      bio: String(data.get('bio') ?? '').trim(),
    };
    const problems = {
      name: next.name ? undefined : 'Enter your name',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)
        ? undefined
        : 'Enter an email address like name@example.com',
    };
    setErrors(problems);
    if (problems.name || problems.email) {
      focusFirstInvalid(form);
      return;
    }
    setSaving(true);
    try {
      update(await saveProfile(next));
      toast({ title: 'Profile saved', tone: 'success' });
    } catch {
      toast({
        title: "Couldn't save your profile. Try again.",
        tone: 'danger',
        duration: Infinity,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Panel title="Profile" description="How you appear to your team.">
      {state.status === 'loading' ? (
        <div aria-busy="true">
          <Skeleton variant="text" lines={6} />
        </div>
      ) : (
        <form className="form-grid" onSubmit={submit} noValidate>
          <TextField
            name="name"
            label="Full name"
            autoComplete="name"
            defaultValue={state.data.name}
            error={errors.name}
            required
          />
          <TextField
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            defaultValue={state.data.email}
            error={errors.email}
            required
          />
          <SelectField
            name="timezone"
            label="Time zone"
            options={TIMEZONES}
            defaultValue={state.data.timezone}
          />
          <TextArea
            name="bio"
            label="Bio"
            hint={`Optional. Up to ${BIO_MAX} characters.`}
            maxLength={BIO_MAX}
            autoGrow
            defaultValue={state.data.bio}
            className="form-grid__wide"
          />
          <div className="form-grid__actions">
            <Button type="submit" variant="primary" loading={saving}>
              Save profile
            </Button>
          </div>
        </form>
      )}
    </Panel>
  );
}

const NOTIFICATIONS: { key: keyof NotificationSettings; label: string; hint: string }[] = [
  { key: 'weeklySummary', label: 'Weekly summary', hint: 'A short email every Monday.' },
  { key: 'newOrders', label: 'New orders', hint: 'An email for every new order.' },
  { key: 'productUpdates', label: 'Product updates', hint: 'News about new features.' },
];

function NotificationsPanel() {
  const { state, retry, update } = useLoad(loadNotificationSettings, []);
  const [saved, setSaved] = useState('');

  if (state.status === 'error') return <LoadError what="notification settings" onRetry={retry} />;

  // Switches apply straight away, so each change is saved at once.
  async function toggle(key: keyof NotificationSettings, value: boolean) {
    if (state.status !== 'ready') return;
    const next = { ...state.data, [key]: value };
    update(next);
    setSaved('');
    try {
      await saveNotificationSettings(next);
      setSaved('Saved');
    } catch {
      update(state.data);
      setSaved("Couldn't save. Try again.");
    }
  }

  return (
    <Panel
      title="Email notifications"
      actions={
        <p className="panel__status" role="status">
          {saved}
        </p>
      }
    >
      <div className="switch-list">
        {NOTIFICATIONS.map((item) =>
          state.status === 'loading' ? (
            <Skeleton key={item.key} variant="text" lines={2} />
          ) : (
            <Switch
              key={item.key}
              label={item.label}
              hint={item.hint}
              labelPlacement="start"
              checked={state.data[item.key]}
              onChange={(event) => void toggle(item.key, event.target.checked)}
            />
          ),
        )}
      </div>
    </Panel>
  );
}

const ACCENT_LABELS: Record<AccentPresetName, string> = {
  indigo: 'Indigo',
  teal: 'Teal',
  pink: 'Pink',
  graphite: 'Graphite',
};

function AppearancePanel() {
  const { accent, setAccent } = useAppearance();
  return (
    <Panel title="Appearance" description="Saved in this browser.">
      <div className="appearance">
        <div className="appearance__mode">
          {/* ThemeToggle names itself "Mode" for screen readers; this is the visible label. */}
          <p className="appearance__label" aria-hidden="true">
            Mode
          </p>
          <ThemeToggle label="Mode" />
        </div>
        <RadioGroup
          label="Accent colour"
          options={accentOptions.map((value) => ({ value, label: ACCENT_LABELS[value] }))}
          value={accent}
          onValueChange={(value) => setAccent(value as AccentPresetName)}
          orientation="horizontal"
          variant="card"
        />
      </div>
    </Panel>
  );
}

function DangerZone() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const name = appConfig.name;

  async function remove() {
    if (typed !== name) {
      setError(`Type ${name} exactly to confirm`);
      return;
    }
    setBusy(true);
    try {
      await deleteWorkspace();
      setOpen(false);
      toast({ title: 'Workspace deleted (demo: nothing was removed)', tone: 'success' });
    } catch {
      setError("Couldn't delete the workspace. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Danger zone" description="Permanent actions for the whole workspace.">
      <div className="danger-row">
        <p>
          <strong>Delete this workspace.</strong> All orders, customers and settings are removed for
          everyone. This can't be undone.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            setTyped('');
            setError(undefined);
            setOpen(true);
          }}
        >
          Delete workspace
        </Button>
      </div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        role="alertdialog"
        size="sm"
        dismissible={!busy}
        title={`Delete ${name}?`}
        description="Everything in this workspace will be removed for everyone. This can't be undone."
        footer={
          <>
            <Button onClick={() => setOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" loading={busy} onClick={remove}>
              Delete workspace
            </Button>
          </>
        }
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void remove();
          }}
          noValidate
        >
          {error && <FormAlert title={error} />}
          <TextField
            label={
              <>
                Type <strong>{name}</strong> to confirm
              </>
            }
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </Dialog>
    </Panel>
  );
}
