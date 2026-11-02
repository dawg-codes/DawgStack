import { useEffect, useState, type ReactNode } from 'react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Divider,
  EmptyState,
  Skeleton,
  Spinner,
  StatusBadge,
  buttonStyleProps,
  cardLinkClassName,
  createStatusBadge,
  type BadgeTone,
  type BadgeVariant,
  type ButtonVariant,
  VisuallyHidden,
  type StatusMap,
} from '@dawg-codes/react-toolkit';
// Components can also be imported one at a time from their own entry point:
import { ProgressBar } from '@dawg-codes/react-toolkit/progress-bar';
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  InboxIcon,
  PlusIcon,
  SlidersIcon,
  TrashIcon,
} from './icons';

type Theme = 'light' | 'dark' | 'system';
const THEME_KEY = 'dawgstack-playground-theme';

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {
    /* storage unavailable */
  }
  return 'system';
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="pg-section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {children}
    </section>
  );
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
const TONES: BadgeTone[] = ['neutral', 'primary', 'info', 'success', 'warning', 'danger'];
const BADGE_VARIANTS: BadgeVariant[] = ['soft', 'solid', 'outline'];

type Deployment = 'queued' | 'building' | 'live' | 'failed';
const DEPLOYMENT: StatusMap<Deployment> = {
  queued: { label: 'Queued', tone: 'neutral' },
  building: { label: 'Building', tone: 'info', dot: 'pulse' },
  live: { label: 'Live', tone: 'success', icon: <CheckIcon /> },
  failed: { label: 'Failed', tone: 'danger', icon: <AlertIcon /> },
};
const DeploymentStatus = createStatusBadge(DEPLOYMENT, { displayName: 'DeploymentStatus' });

export function App() {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(40);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-dawg-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
  }, [theme]);

  const save = () => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 1500);
  };

  return (
    <>
      <header className="pg-header">
        <div className="pg-container pg-header-inner">
          <div>
            <h1>DawgStack playground</h1>
            <p>Phase 1 components from @dawg-codes/react-toolkit.</p>
          </div>
          <div className="pg-theme" role="group" aria-label="Colour theme">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={theme === t ? 'primary' : 'outline'}
                aria-pressed={theme === t}
                onClick={() => setTheme(t)}
              >
                {t[0]!.toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="pg-container pg-main">
        <Section id="buttons" title="Button">
          <div className="pg-row">
            {VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v[0]!.toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
          <div className="pg-row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button variant="primary" startIcon={<PlusIcon />}>
              New project
            </Button>
            <Button variant="outline" endIcon={<ArrowRightIcon />}>
              Continue
            </Button>
            <Button iconOnly variant="ghost" aria-label="Delete">
              <TrashIcon />
            </Button>
          </div>
          <div className="pg-row">
            <Button variant="primary" loading={saving} onClick={save}>
              {saving ? 'Saving…' : 'Save (shows loading)'}
            </Button>
            <Button disabled>Disabled</Button>
            <Button aria-disabled title="Focusable but unavailable">
              aria-disabled
            </Button>
            <a href="#buttons" {...buttonStyleProps({ variant: 'outline' })}>
              Link styled as a button
            </a>
          </div>
          <Button variant="secondary" fullWidth>
            Full width
          </Button>
        </Section>

        <Section id="cards" title="Card">
          <div className="pg-grid">
            <Card variant="basic">
              <CardTitle>Basic</CardTitle>
              <CardDescription>Surface colour only.</CardDescription>
            </Card>
            <Card>
              <CardTitle>Bordered</CardTitle>
              <CardDescription>The default variant.</CardDescription>
            </Card>
            <Card variant="elevated">
              <CardTitle>Elevated</CardTitle>
              <CardDescription>A soft shadow lifts it off the page.</CardDescription>
            </Card>
            <Card interactive>
              <CardHeader>
                <CardTitle>
                  <a href="#cards" className={cardLinkClassName}>
                    Interactive
                  </a>
                </CardTitle>
                <Badge tone="primary">New</Badge>
              </CardHeader>
              <CardDescription>The whole card is clickable through its one link.</CardDescription>
              <CardFooter>
                <Button size="sm" variant="ghost">
                  Other action
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section id="badges" title="Badge and StatusBadge">
          {BADGE_VARIANTS.map((variant) => (
            <div className="pg-row" key={variant}>
              {TONES.map((tone) => (
                <Badge key={tone} tone={tone} variant={variant}>
                  {tone}
                </Badge>
              ))}
            </div>
          ))}
          <div className="pg-row">
            <Badge size="sm">Small</Badge>
            <Badge tone="success" dot>
              Online
            </Badge>
            <Badge tone="danger" dot="pulse">
              Recording
            </Badge>
            <Badge tone="info" icon={<SlidersIcon />}>
              Filtered
            </Badge>
            <span className="pg-narrow">
              <Badge>A very long label that is truncated with an ellipsis</Badge>
            </span>
          </div>
          <div className="pg-row">
            {(Object.keys(DEPLOYMENT) as Deployment[]).map((s) => (
              <DeploymentStatus key={s} status={s} />
            ))}
            <StatusBadge status={'paused' as Deployment} statuses={DEPLOYMENT} />
          </div>
        </Section>

        <Section id="avatars" title="Avatar">
          <div className="pg-row">
            <Avatar size="xs" name="Ada Lovelace" />
            <Avatar size="sm" name="Grace Hopper" />
            <Avatar size="md" name="Alan Turing" src="/avatar-sample.svg" />
            <Avatar size="lg" name="Katherine Johnson" shape="square" />
            <Avatar size="xl" name="Broken Image" src="/missing-image.png" />
            <Avatar size="lg" />
          </div>
        </Section>

        <Section id="dividers" title="Divider">
          <p>Content above a divider.</p>
          <Divider />
          <div className="pg-row pg-toolbar">
            <span>Left</span>
            <Divider orientation="vertical" />
            <span>Middle</span>
            <Divider orientation="vertical" />
            <span>Right</span>
          </div>
          <Divider label="or" />
        </Section>

        <Section id="spinners" title="Spinner">
          <div className="pg-row">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" className="pg-primary" />
            <Spinner label="Loading results" showLabel />
          </div>
        </Section>

        <Section id="skeletons" title="Skeleton">
          <div className="pg-row">
            <Button size="sm" variant="outline" onClick={() => setContentLoading((v) => !v)}>
              {contentLoading ? 'Show content' : 'Show skeleton'}
            </Button>
          </div>
          <Card aria-busy={contentLoading} className="pg-media">
            {contentLoading ? (
              <>
                <VisuallyHidden role="status">Loading profile</VisuallyHidden>
                <div className="pg-media-row">
                  <Skeleton variant="circle" width={48} />
                  <div className="pg-grow">
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="25%" />
                  </div>
                </div>
                <Skeleton variant="text" lines={3} />
                <Skeleton height={120} />
              </>
            ) : (
              <>
                <div className="pg-media-row">
                  <Avatar name="Grace Hopper" size="lg" />
                  <div className="pg-grow">
                    <strong>Grace Hopper</strong>
                    <div className="pg-muted">Computer scientist</div>
                  </div>
                </div>
                <p>
                  Content replaces the skeleton once it has loaded. The card is marked aria-busy
                  while loading.
                </p>
              </>
            )}
          </Card>
        </Section>

        <Section id="progress" title="ProgressBar">
          <div className="pg-stack">
            <label className="pg-range">
              Value: {progress}
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </label>
            <ProgressBar value={progress} label="Upload" showValue />
            <ProgressBar
              value={progress}
              label="Storage used"
              showValue
              semantics="meter"
              tone={progress > 85 ? 'danger' : progress > 65 ? 'warning' : 'success'}
              formatValue={(v) => `${(v / 10).toFixed(1)} of 10 GB`}
            />
            <ProgressBar aria-label="Loading" size="sm" />
            <ProgressBar value={70} aria-label="Large neutral" size="lg" tone="neutral" />
          </div>
        </Section>

        <Section id="empty" title="EmptyState">
          <div className="pg-grid">
            <Card>
              <EmptyState
                icon={<InboxIcon />}
                title="No messages yet"
                description="When someone sends you a message, it will appear here."
                action={
                  <Button variant="primary" startIcon={<PlusIcon />}>
                    New message
                  </Button>
                }
              />
            </Card>
            <Card>
              <EmptyState
                size="sm"
                align="start"
                title="No results"
                description="Try a different search or clear the filters."
                action={<Button size="sm">Clear filters</Button>}
              />
            </Card>
          </div>
        </Section>
      </main>
    </>
  );
}
