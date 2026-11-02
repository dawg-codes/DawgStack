import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
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
  ThemeProvider,
  ThemeScope,
  ThemeToggle,
  accentPresets,
  mergeThemes,
  shapePresets,
  useTheme,
  type AccentPresetName,
  type ShapePresetName,
} from '@dawg-codes/react-toolkit/theme';
import { ToastProvider } from '@dawg-codes/react-toolkit/toast';
import { FormsDemo } from './FormsDemo';
import { AppShellDemo, LayoutLinks, SignInDemo, useHash } from './LayoutDemos';
import { OverlaysDemo } from './OverlaysDemo';
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  InboxIcon,
  PlusIcon,
  SlidersIcon,
  TrashIcon,
} from './icons';

const ACCENTS: { value: AccentPresetName; label: string; swatch: string }[] = [
  { value: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
  { value: 'teal', label: 'Teal', swatch: '#0f766e' },
  { value: 'pink', label: 'Pink', swatch: '#be185d' },
  { value: 'graphite', label: 'Graphite', swatch: '#27272a' },
];
const SHAPES: { value: ShapePresetName; label: string }[] = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'default', label: 'Default' },
  { value: 'round', label: 'Round' },
];

/** A choice remembered in localStorage (wrapped in try/catch: storage can be blocked). */
function useStoredChoice<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key) as T | null;
      if (saved && allowed.includes(saved)) return saved;
    } catch {
      /* storage unavailable */
    }
    return fallback;
  });
  const update = (next: T) => {
    setValue(next);
    try {
      localStorage.setItem(key, next);
    } catch {
      /* storage unavailable: the choice lasts for this visit */
    }
  };
  return [value, update] as const;
}

/** A row of native radio buttons styled as chips. */
function ChoiceGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: { value: T; label: string; swatch?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="pg-choice">
      <legend>{legend}</legend>
      <div className="pg-choice-options">
        {options.map((o) => (
          <label key={o.value} className="pg-choice-option">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className="pg-choice-box">
              {o.swatch && (
                <span className="pg-swatch" style={{ background: o.swatch }} aria-hidden="true" />
              )}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
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
  const [accent, setAccent] = useStoredChoice(
    'dawgstack-playground-accent',
    'indigo',
    ACCENTS.map((a) => a.value),
  );
  const [shape, setShape] = useStoredChoice(
    'dawgstack-playground-shape',
    'default',
    SHAPES.map((s) => s.value),
  );
  // Theme modules combine: one accent preset plus one shape preset.
  const hash = useHash();
  // Start each demo page at the top (but keep links to sections such as #buttons working).
  const page = hash.startsWith('#/') ? hash.split('/')[1] : 'playground';
  const shownPage = useRef(page);
  useEffect(() => {
    if (page === shownPage.current) return;
    shownPage.current = page;
    window.scrollTo(0, 0);
  }, [page]);
  const theme = useMemo(
    () => mergeThemes(accentPresets[accent], shapePresets[shape]),
    [accent, shape],
  );
  return (
    <ThemeProvider theme={theme}>
      <ToastProvider>
        {hash.startsWith('#/app') ? (
          <AppShellDemo hash={hash} />
        ) : hash === '#/sign-in' ? (
          <SignInDemo />
        ) : (
          <Playground
            customise={
              <div className="pg-customise">
                <ChoiceGroup
                  legend="Accent"
                  name="accent"
                  value={accent}
                  options={ACCENTS}
                  onChange={setAccent}
                />
                <ChoiceGroup
                  legend="Corners"
                  name="shape"
                  value={shape}
                  options={SHAPES}
                  onChange={setShape}
                />
              </div>
            }
          />
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}

function ModeReadout() {
  const { mode, resolvedMode } = useTheme();
  return (
    <p className="pg-muted" aria-live="polite">
      Mode: <strong>{mode}</strong>
      {mode === 'system' && ` (showing ${resolvedMode})`}
    </p>
  );
}

function Playground({ customise }: { customise: ReactNode }) {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(40);
  const [contentLoading, setContentLoading] = useState(true);

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
            <p>Components from @dawg-codes/react-toolkit.</p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="pg-container pg-main">
        <Section id="customise" title="Customise">
          <p className="pg-muted">
            Every style on this page comes from design tokens. Switch the mode, accent and corner
            presets to restyle all components at once: no component code changes.
          </p>
          <ModeReadout />
          {customise}
        </Section>

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

        <Section id="forms" title="Form controls">
          <FormsDemo />
        </Section>

        <Section id="layouts" title="App layout">
          <p className="pg-muted">
            AppShell, AppHeader, SideNav, MobileTabBar, PageHeader and AuthLayout are full-page
            layouts, so they have demo pages of their own. Resize the window to see the sidebar turn
            into a drawer and the tab bar appear on phones.
          </p>
          <LayoutLinks />
        </Section>

        <Section id="overlays" title="Dialogs, toasts and menus">
          <OverlaysDemo />
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
        <Section id="scope" title="ThemeScope">
          <p className="pg-muted">
            Theme one part of a page: this panel is always dark with the pink accent, whatever the
            page uses.
          </p>
          <ThemeScope mode="dark" theme={accentPresets.pink} className="pg-scope">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Scoped theme</CardTitle>
                <Badge tone="primary">Pink</Badge>
              </CardHeader>
              <CardDescription>Tokens set on this element apply only inside it.</CardDescription>
              <ProgressBar value={64} label="Progress" showValue />
              <CardFooter>
                <Button variant="ghost">Cancel</Button>
                <Button variant="primary">Continue</Button>
              </CardFooter>
            </Card>
          </ThemeScope>
        </Section>
      </main>
    </>
  );
}
