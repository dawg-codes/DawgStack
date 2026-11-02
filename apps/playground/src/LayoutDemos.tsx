import { useEffect, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardTitle,
  ProgressBar,
  buttonStyleProps,
} from '@dawg-codes/react-toolkit';
import {
  Checkbox,
  FormAlert,
  PasswordField,
  TextField,
  focusFirstInvalid,
} from '@dawg-codes/react-toolkit/form';
import {
  AppHeader,
  AppShell,
  AuthLayout,
  MobileTabBar,
  PageHeader,
  SideNav,
  type NavItem,
  type NavSection,
} from '@dawg-codes/react-toolkit/layout';
import { DropdownMenu } from '@dawg-codes/react-toolkit/menu';
import { ThemeToggle } from '@dawg-codes/react-toolkit/theme';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import {
  CalendarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from './icons';

/** The current location hash, e.g. "#/app/projects". The demos use it as a tiny router. */
export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash;
}

const Brand = () => (
  <a href="#/app/overview" className="pg-brand">
    <svg viewBox="0 0 32 32" aria-hidden="true" className="pg-brand-mark">
      <rect width="32" height="32" rx="8" />
      <path d="M10 17l4 4 8-9" />
    </svg>
    Acme
  </a>
);

const SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Overview', href: '#/app/overview', icon: <HomeIcon /> },
      { label: 'Projects', href: '#/app/projects', icon: <FolderIcon />, badge: '4' },
      { label: 'Calendar', href: '#/app/calendar', icon: <CalendarIcon /> },
      { label: 'Inbox', href: '#/app/inbox', icon: <InboxIcon />, badge: '12' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Team', href: '#/app/team', icon: <UsersIcon /> },
      { label: 'Settings', href: '#/app/settings', icon: <SettingsIcon /> },
    ],
  },
];
const TABS: NavItem[] = [
  { label: 'Overview', href: '#/app/overview', icon: <HomeIcon /> },
  { label: 'Projects', href: '#/app/projects', icon: <FolderIcon /> },
  { label: 'Inbox', href: '#/app/inbox', icon: <InboxIcon />, badge: '12' },
  { label: 'Settings', href: '#/app/settings', icon: <SettingsIcon /> },
];
const PROJECTS = [
  { name: 'Website redesign', progress: 72, status: 'On track' },
  { name: 'Mobile app', progress: 45, status: 'At risk' },
  { name: 'Billing migration', progress: 90, status: 'On track' },
  { name: 'Help centre', progress: 20, status: 'Planning' },
  { name: 'Data warehouse', progress: 58, status: 'On track' },
  { name: 'Onboarding emails', progress: 100, status: 'Done' },
];

export function AppShellDemo({ hash }: { hash: string }) {
  const { toast } = useToast();
  const page = hash.replace('#/app/', '') || 'projects';
  const all = SECTIONS.flatMap((s) => s.items);
  const current = all.find((item) => item.href === hash) ?? all[1]!;

  return (
    <AppShell
      header={
        <AppHeader
          brand={<Brand />}
          actions={
            <>
              <ThemeToggle hideLabels size="sm" />
              <DropdownMenu
                label={<UsersIcon />}
                iconOnly
                variant="ghost"
                aria-label="Account"
                align="end"
                items={[
                  { label: 'Profile', onSelect: () => toast({ title: 'Profile' }) },
                  { label: 'Sign out', href: '#/sign-in' },
                ]}
              />
            </>
          }
        />
      }
      sidebar={
        <SideNav
          sections={SECTIONS}
          currentHref={current.href}
          footer={
            <a href="#/" className="pg-back">
              ← Back to the playground
            </a>
          }
        />
      }
      tabBar={<MobileTabBar items={TABS} currentHref={current.href} />}
    >
      <PageHeader
        eyebrow={<a href="#/">Playground</a>}
        title={current.label}
        description={
          page === 'projects'
            ? 'Everything your team is working on, with progress and status.'
            : 'A demo page. Use the navigation to move around.'
        }
        actions={
          <Button
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={() => toast({ title: 'Project created', tone: 'success' })}
          >
            New project
          </Button>
        }
      />
      <ul className="pg-project-grid">
        {PROJECTS.map((project) => (
          <Card as="li" key={project.name}>
            <CardTitle as="h2">{project.name}</CardTitle>
            <CardDescription>
              <Badge tone={project.status === 'At risk' ? 'warning' : 'neutral'}>
                {project.status}
              </Badge>
            </CardDescription>
            <ProgressBar value={project.progress} label="Progress" showValue />
          </Card>
        ))}
      </ul>
    </AppShell>
  );
}

export function SignInDemo() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [signedIn, setSignedIn] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(String(data.get('email')))) {
      next.email = 'Enter an email address like name@example.com';
    }
    if (!data.get('password')) next.password = 'Enter your password';
    setErrors(next);
    setSignedIn(Object.keys(next).length === 0);
    if (Object.keys(next).length) focusFirstInvalid(event.currentTarget);
  };

  return (
    <AuthLayout
      brand={<Brand />}
      title="Sign in"
      description="Welcome back. Sign in to continue to Acme."
      actions={<ThemeToggle hideLabels size="sm" />}
      footer={
        <>
          No account? <a href="#/sign-in">Create one</a> · <a href="#/">Back to the playground</a>
        </>
      }
      aside={
        <div className="pg-auth-aside">
          <p className="pg-auth-quote">“We shipped our new dashboard in a week.”</p>
          <p>Plan, track and ship your projects in one place.</p>
        </div>
      }
    >
      <form className="pg-form" onSubmit={submit} noValidate>
        {signedIn && (
          <FormAlert tone="success" title="Signed in">
            This demo doesn't check passwords.
          </FormAlert>
        )}
        <TextField
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          error={errors.email}
          required
        />
        <PasswordField
          name="password"
          label="Password"
          error={errors.password}
          required
          hint={<a href="#/sign-in">Forgot your password?</a>}
        />
        <Checkbox name="remember" label="Keep me signed in" />
        <Button type="submit" variant="primary" fullWidth>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}

/** Links from the main playground page to the full-page layout demos. */
export function LayoutLinks() {
  return (
    <div className="pg-row">
      <a href="#/app/projects" {...buttonStyleProps({ variant: 'primary' })}>
        Open the app layout demo
      </a>
      <a href="#/sign-in" {...buttonStyleProps({ variant: 'outline' })}>
        Open the sign-in demo
      </a>
    </div>
  );
}
