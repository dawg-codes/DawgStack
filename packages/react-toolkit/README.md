# @dawg-codes/react-toolkit

Accessible, themeable React components and design tokens from **DawgStack**.

> **Status: early development (0.0.0), not published to npm yet.** The API may change before the first release. To try the components today, run the playground from this repository (see the [root README](../../README.md)).

- **React is the only peer dependency** (18.2+ or 19). There are no runtime dependencies.
- **Plain CSS with design tokens.** There's no CSS-in-JS and no Tailwind requirement. All styles live in cascade layers, so your own CSS always wins.
- **Switchable, modular theming.** Light, dark and system modes with a ready-made toggle, mix-and-match accent and shape presets, typed custom themes and scoped themes. WCAG AA contrast is tested for every theme.
- **Import everything or one component at a time.** Ships ESM and CommonJS with TypeScript types, and server-rendering safe.

## Contents

- [Styles](#styles)
- [Theming](#theming): [ThemeProvider and ThemeToggle](#themeprovider-and-themetoggle) · [Presets](#presets) · [Custom themes](#custom-themes) · [Theming part of a page](#theming-part-of-a-page) · [Plain HTML and CSS](#plain-html-and-css)
- [Components](#components): [Button](#button) · [Card](#card) · [Badge and StatusBadge](#badge-and-statusbadge) · [Avatar](#avatar) · [Divider](#divider) · [Spinner](#spinner) · [Skeleton](#skeleton) · [ProgressBar](#progressbar) · [EmptyState](#emptystate) · [VisuallyHidden](#visuallyhidden)
- [Forms](#forms): [Shared props](#shared-props) · [Validation](#validation) · [Controls](#controls)
- [Dialogs, toasts and menus](#dialogs-toasts-and-menus): [Dialog](#dialog) · [ConfirmDialog](#confirmdialog) · [Toasts](#toasts) · [DropdownMenu](#dropdownmenu)
- [App layout](#app-layout): [AppShell and AppHeader](#appshell-and-appheader) · [SideNav and MobileTabBar](#sidenav-and-mobiletabbar) · [PageHeader](#pageheader) · [AuthLayout](#authlayout)
- [Data](#data): [DataTable](#datatable) · [Pagination](#pagination) · [CSV](#csv)
- [Browser support](#browser-support)
- [Known limitations](#known-limitations)

## Styles

Import the CSS once, near the root of your app. Choose one of two options.

```ts
// Option 1: everything (about 94 kB unminified, about 15 kB gzipped)
import '@dawg-codes/react-toolkit/styles.css';

// Option 2: only what you use. core.css is always required and must come first.
import '@dawg-codes/react-toolkit/core.css';
import '@dawg-codes/react-toolkit/css/button.css';
import '@dawg-codes/react-toolkit/css/card.css';
```

Component files in `css/` are named after the component's entry point: `avatar`, `badge` (also covers StatusBadge), `button`, `card`, `dialog` (also covers ConfirmDialog), `divider`, `empty-state`, `form` (all form controls), `layout` (AppShell, AppHeader, SideNav, MobileTabBar, PageHeader and AuthLayout), `menu` (DropdownMenu), `pagination`, `progress-bar`, `skeleton`, `spinner`, `table` (DataTable), `theme` (ThemeToggle) and `toast`. The `csv` entry has no styles. VisuallyHidden's styles are in `core.css`. ConfirmDialog and DropdownMenu are built with Button, so they also need `button.css`; AppShell's narrow-screen drawer is a Dialog, so it needs `dialog.css`; and DataTable uses Button, DropdownMenu and Skeleton, so it needs their files too.

**The CSS is optional.** To use your own styles instead, skip these imports: every component renders stable `dawg-*` class names, plus `data-*` attributes for its options (for example `data-variant="primary"`), for you to style.

The toolkit doesn't style `html` or `body`, except to stop the page scrolling while a modal Dialog is open. Use the tokens for your page if you like:

```css
body {
  background: var(--dawg-color-bg);
  color: var(--dawg-color-text);
}
```

**Your global styles win, so scope element rules.** Your own unlayered CSS beats the toolkit's layered styles, including plain element selectors. A global `a { color: … }` would recolour the links inside SideNav, MobileTabBar and AppShell's skip link. Style only links without a class instead:

```css
a:not([class]) {
  color: var(--dawg-color-primary);
}
```

Components can be imported from the root, or from their own entry point to keep bundles small (both tree-shake):

```tsx
import { Button, Card } from '@dawg-codes/react-toolkit';
import { ProgressBar } from '@dawg-codes/react-toolkit/progress-bar';
```

## Theming

Everything visual comes from design tokens (CSS custom properties), so you can restyle every component at once without touching component code:

| You want to…                                              | Use                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| Let users switch light, dark or follow the system setting | [`ThemeProvider` and `ThemeToggle`](#themeprovider-and-themetoggle) |
| Switch the look with ready-made modules                   | [Presets](#presets): 4 accents × 3 corner shapes                    |
| Apply your own brand, typed and checked                   | [`defineTheme`](#custom-themes)                                     |
| Theme one area differently                                | [`ThemeScope`](#theming-part-of-a-page)                             |
| Change tokens with plain CSS, no JavaScript               | [Plain HTML and CSS](#plain-html-and-css)                           |

The theme tools have their own entry point, `@dawg-codes/react-toolkit/theme`, and are also exported from the root. ThemeToggle's styles are in `css/theme.css`.

### ThemeProvider and ThemeToggle

```tsx
import { ThemeProvider, ThemeToggle } from '@dawg-codes/react-toolkit/theme';

export function App() {
  return (
    <ThemeProvider>
      <header>
        <ThemeToggle />
      </header>
      …
    </ThemeProvider>
  );
}
```

`ThemeProvider` sets `data-dawg-theme` on `<html>` and remembers the choice in `localStorage`. In `system` mode it follows the operating system, including live changes. It keeps open tabs in sync, applies changes before the browser paints, and is safe for server rendering.

| Prop                   | Type                            | Default        | Notes                                                        |
| ---------------------- | ------------------------------- | -------------- | ------------------------------------------------------------ |
| `defaultMode`          | `'light' \| 'dark' \| 'system'` | `'system'`     | Used until the user chooses                                  |
| `mode`, `onModeChange` | as above, and a callback        | —              | Control the mode yourself (nothing is saved to storage then) |
| `storageKey`           | `string \| null`                | `'dawg-theme'` | `null` turns saving off                                      |
| `theme`                | `DawgTheme`                     | —              | Token overrides: a preset, your own theme, or several merged |

`ThemeToggle` is a group of native radio buttons (Light, Dark and System), so arrow keys and screen readers work as expected. It has five props:

- `options` sets which choices appear, and in what order.
- `labels` replaces the text of each choice, for example for translations.
- `label` names the group for screen readers (default "Theme").
- `hideLabels` shows icons only; the text stays available to screen readers and as a tooltip.
- `size` is `'sm'` or `'md'`.

To build your own control, use the hook:

```tsx
import { useTheme } from '@dawg-codes/react-toolkit/theme';

function DarkModeButton() {
  // mode: what the user chose. resolvedMode: 'light' or 'dark', what is showing now.
  const { resolvedMode, toggle } = useTheme();
  return <Button onClick={toggle}>{resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}</Button>;
}
```

**Avoid a flash of the wrong theme.** React runs after the page first paints, so a dark-mode user would briefly see light colours. A tiny script at the start of the page applies the saved choice straight away:

```tsx
import { getThemeScript } from '@dawg-codes/react-toolkit/theme';

// For example in a Next.js root layout, inside <body>:
<script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />;
```

Pass it the same `storageKey` and `defaultMode` as your `ThemeProvider`. With a strict Content Security Policy, serve it as a small file or allow it with a hash or nonce. The playground injects it with a short Vite plugin (`apps/playground/vite.config.ts`).

### Presets

Presets are ready-made theme modules. Combine one accent with one shape using `mergeThemes`:

```tsx
import {
  ThemeProvider,
  accentPresets,
  mergeThemes,
  shapePresets,
} from '@dawg-codes/react-toolkit/theme';

const theme = mergeThemes(accentPresets.teal, shapePresets.round);

<ThemeProvider theme={theme}>…</ThemeProvider>;
```

| Module          | Options                                                         |
| --------------- | --------------------------------------------------------------- |
| `accentPresets` | `indigo` (the default), `teal`, `pink`, `graphite` (monochrome) |
| `shapePresets`  | `sharp`, `default`, `round` (also makes buttons pill-shaped)    |

Every accent meets WCAG AA contrast in light and dark mode, and tests check every colour pair. To switch at runtime, change the `theme` prop; the playground's Customise panel does exactly that.

### Custom themes

`defineTheme` creates a theme from token overrides. Token names are typed, so your editor autocompletes all 119 of them. They are also checked when the theme is created, so a typo fails straight away instead of silently doing nothing.

```tsx
import {
  ThemeProvider,
  defineTheme,
  mergeThemes,
  shapePresets,
} from '@dawg-codes/react-toolkit/theme';

const brand = defineTheme({
  tokens: { 'font-family': '"Inter", system-ui, sans-serif', 'radius-md': '0.375rem' },
  light: {
    'color-primary': '#0f766e',
    'color-primary-solid': '#0f766e',
    'color-primary-solid-hover': '#115e59',
  },
  dark: {
    'color-primary': '#5eead4',
    'color-primary-solid': '#0f766e',
    'color-primary-solid-hover': '#115e59',
  },
});

<ThemeProvider theme={mergeThemes(brand, shapePresets.round)}>…</ThemeProvider>;
```

- `tokens` apply in both modes; `light` and `dark` apply only in that mode.
- A token's name is its CSS custom property without `--dawg-` (`color-primary-solid` is `--dawg-color-primary-solid`). `DESIGN_TOKENS` and `COMPONENT_TOKENS` list them all.
- In `mergeThemes`, later themes win where two set the same token.
- `themeToCssVars(theme, 'light')` returns the CSS variables if you want to apply them yourself.
- Check colour contrast when you choose your own colours; only the defaults and presets are tested for you.

### Theming part of a page

`ThemeScope` gives one area its own mode or theme, such as a dark sidebar in a light app or a brand preview:

```tsx
import { ThemeScope, accentPresets } from '@dawg-codes/react-toolkit/theme';

<ThemeScope mode="dark" theme={accentPresets.pink} style={{ background: 'var(--dawg-color-bg)' }}>
  …
</ThemeScope>;
```

It renders a `<div>` and passes through any `<div>` props. Without `mode`, it follows the surrounding mode.

### Plain HTML and CSS

No JavaScript is needed for themes. Light is the default; set `data-dawg-theme` on `<html>`, or on any element to theme just that part of the page:

```html
<!-- Always dark -->
<html data-dawg-theme="dark">
  …
</html>

<!-- Follows the operating system setting -->
<html data-dawg-theme="system">
  …
</html>

<!-- A light area inside a dark page -->
<section data-dawg-theme="light">…</section>
```

#### Customising tokens with CSS

Override any token with ordinary CSS. Because the toolkit's styles are in cascade layers, your unlayered rules win without `!important`. (A `theme` passed to `ThemeProvider` is applied as inline variables on `<html>`, so it takes priority over these.)

```css
:root {
  --dawg-color-primary-solid: #0f766e; /* button and solid badge background */
  --dawg-color-primary-solid-hover: #115e59;
  --dawg-color-primary: #0f766e; /* text, links and progress fill */
  --dawg-radius-md: 0.25rem;
}
[data-dawg-theme='dark'] {
  --dawg-color-primary: #5eead4;
}
```

Check contrast when you change colours. The defaults pass WCAG AA in both themes.

**Token groups** (see `core.css` for the full list):

| Group           | Examples                                                                                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Surfaces        | `--dawg-color-bg`, `-surface`, `-surface-muted`, `-surface-strong`, `-border`, `-border-strong`, `-border-input` (form control edges, 3:1 against surfaces)                                                        |
| Text            | `--dawg-color-text`, `-text-muted`, `-text-subtle`, `--dawg-color-focus-ring`                                                                                                                                      |
| Tones           | for each of `primary`, `neutral`, `info`, `success`, `warning`, `danger`: `--dawg-color-<tone>` (text and graphics), `-soft` (tinted background), `-border`, `-solid`, `-solid-hover`, `-on-solid` (text on solid) |
| Type and layout | `--dawg-font-size-xs` … `-xl`, `--dawg-font-weight-*`, `--dawg-space-1` … `-12`, `--dawg-radius-xs` … `-full`, `--dawg-control-height-sm/md/lg`, `--dawg-touch-target`                                             |
| Effects         | `--dawg-shadow-sm/md/lg`, `--dawg-duration-*`, `--dawg-easing-*`, `--dawg-color-overlay` (behind modal dialogs)                                                                                                    |

**Per-component hooks.** Set these anywhere: they inherit, so `:root` works.

| Property                                                        | Affects                                           |
| --------------------------------------------------------------- | ------------------------------------------------- |
| `--dawg-font-family`                                            | All components (default: inherit your app's font) |
| `--dawg-button-radius`                                          | Button corners                                    |
| `--dawg-card-bg`, `--dawg-card-radius`, `--dawg-card-gap`       | Card background, corners, spacing between parts   |
| `--dawg-badge-radius`                                           | Badge corners                                     |
| `--dawg-avatar-size`, `--dawg-avatar-bg`, `--dawg-avatar-color` | Avatar size (any CSS length) and initials colours |
| `--dawg-divider-color`                                          | Divider line                                      |
| `--dawg-skeleton-radius`                                        | Skeleton corners                                  |
| `--dawg-spinner-color`, `--dawg-spinner-size`                   | Spinner colour and size                           |
| `--dawg-progress-track`, `--dawg-progress-fill`                 | ProgressBar colours                               |
| `--dawg-input-bg`, `--dawg-input-radius`                        | Form control background and corners               |
| `--dawg-dialog-radius`                                          | Dialog corners                                    |
| `--dawg-menu-radius`, `--dawg-menu-z`                           | DropdownMenu corners and stacking (default 1100)  |
| `--dawg-toast-radius`, `--dawg-toast-z`                         | Toast corners and stacking (default 1000)         |
| `--dawg-sidebar-width`                                          | AppShell sidebar width (default 16rem)            |
| `--dawg-app-header-height`, `--dawg-app-header-z`               | AppHeader minimum height and stacking             |
| `--dawg-app-padding`                                            | Space around AppShell's main content              |
| `--dawg-auth-width`                                             | AuthLayout panel width (default 26rem)            |

Every component also accepts `className` and `style`, and exposes its options as `data-*` attributes (for example `data-variant="primary"`) that you can target in CSS.

## Components

All components forward `ref` and pass extra props (such as `id`, `aria-*`, `data-*` and event handlers) to their root element.

### Button

A button with variants, sizes, icons and a loading state.

```tsx
import { Button } from '@dawg-codes/react-toolkit';

<Button variant="primary" startIcon={<PlusIcon />} onClick={create}>
  New project
</Button>
<Button variant="primary" type="submit" loading={saving}>Save</Button>
<Button iconOnly variant="ghost" aria-label="Delete"><TrashIcon /></Button>
```

| Prop                   | Type                                                           | Default       | Notes                                                         |
| ---------------------- | -------------------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| `variant`              | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'secondary'` | Use `primary` for the main action in a view                   |
| `size`                 | `'sm' \| 'md' \| 'lg'`                                         | `'md'`        | `sm` and `md` grow to touch-friendly heights on touch screens |
| `loading`              | `boolean`                                                      | `false`       | Shows a spinner and ignores clicks and form submission        |
| `startIcon`, `endIcon` | `ReactNode`                                                    | —             | Hidden from assistive technology                              |
| `iconOnly`             | `boolean`                                                      | `false`       | Square button; **give it an `aria-label`**                    |
| `fullWidth`            | `boolean`                                                      | `false`       |                                                               |
| `type`                 | `'button' \| 'submit' \| 'reset'`                              | `'button'`    | Set `type="submit"` explicitly in forms                       |

Plus all native `<button>` attributes.

**Accessibility.** While `loading`, the button stays focusable and keeps its accessible name; it is marked `aria-busy` and `aria-disabled`, so keyboard users don't lose their place. Use `disabled` for an unavailable action, or `aria-disabled` when the button should stay focusable (for example, so a nearby message can explain why it's unavailable). Clicks are ignored in both cases.

**Links that look like buttons.** `buttonStyleProps()` returns the class and data attributes, so any element can use the button look without the toolkit depending on a router:

```tsx
import { buttonStyleProps } from '@dawg-codes/react-toolkit';

<a href="/new" {...buttonStyleProps({ variant: 'primary' })}>New project</a>
<Link to="/new" {...buttonStyleProps({ variant: 'outline', size: 'sm' })}>New project</Link>
```

### Card

A surface that groups related content.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Badge,
  Button,
} from '@dawg-codes/react-toolkit';

<Card variant="elevated" as="article">
  <CardHeader>
    <CardTitle as="h2">Monthly report</CardTitle>
    <Badge tone="success">Ready</Badge>
  </CardHeader>
  <CardDescription>Updated every morning.</CardDescription>
  <CardFooter>
    <Button variant="primary">Open</Button>
  </CardFooter>
</Card>;
```

| Prop          | Type                                                 | Default      | Notes                                                                           |
| ------------- | ---------------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `variant`     | `'basic' \| 'bordered' \| 'elevated'`                | `'bordered'` | `basic` is the surface colour only                                              |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`                     | `'md'`       | `md` and `lg` grow slightly on wider screens                                    |
| `interactive` | `boolean`                                            | `false`      | Hover and focus styles for a clickable card (see below); works with any variant |
| `as`          | `'div' \| 'section' \| 'article' \| 'aside' \| 'li'` | `'div'`      | Use `li` inside a `<ul>`                                                        |

Parts: `CardHeader` (title and actions in a row; wraps on narrow cards), `CardTitle` (`as`: `h2`–`h6` or `p`; default `h3`), `CardDescription` (muted paragraph) and `CardFooter` (actions, aligned to the end and pushed to the bottom).

**Clickable cards.** Don't wrap a card in `<a>` or put `onClick` on it. Mark the card `interactive` and give its one main link `cardLinkClassName`. That link's click area stretches over the whole card, keyboard focus draws a ring around the card, and other buttons or links inside stay clickable:

```tsx
import { Card, CardTitle, cardLinkClassName } from '@dawg-codes/react-toolkit';

<Card interactive>
  <CardTitle>
    <a href="/projects/42" className={cardLinkClassName}>
      Website redesign
    </a>
  </CardTitle>
  …
</Card>;
```

The link can be a router link too: pass `className={cardLinkClassName}` to it.

### Badge and StatusBadge

A short status or category label.

```tsx
import { Badge } from '@dawg-codes/react-toolkit';

<Badge tone="success">Paid</Badge>
<Badge tone="danger" variant="solid" icon={<AlertIcon />}>Overdue</Badge>
<Badge tone="info" dot="pulse">Syncing</Badge>
```

| Prop      | Type                                                                     | Default     | Notes                                                   |
| --------- | ------------------------------------------------------------------------ | ----------- | ------------------------------------------------------- |
| `tone`    | `'neutral' \| 'primary' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Always pair colour with a clear text label              |
| `variant` | `'soft' \| 'solid' \| 'outline'`                                         | `'soft'`    |                                                         |
| `size`    | `'sm' \| 'md'`                                                           | `'md'`      |                                                         |
| `icon`    | `ReactNode`                                                              | —           | Hidden from assistive technology                        |
| `dot`     | `boolean \| 'pulse'`                                                     | `false`     | `'pulse'` animates, and stays still with reduced motion |

Long labels are truncated with an ellipsis when space runs out. Set a `title` if users need the full text.

**StatusBadge** maps your own status values to a label and tone. The types check that every status is defined and that you only pass known values:

```tsx
import { createStatusBadge, StatusBadge, type StatusMap } from '@dawg-codes/react-toolkit';

type Order = 'pending' | 'paid' | 'refunded';
const ORDER_STATUS: StatusMap<Order> = {
  pending: { label: 'Pending', tone: 'warning', dot: true },
  paid: { label: 'Paid', tone: 'success' },
  refunded: { label: 'Refunded' }, // tone defaults to neutral
};

// Inline:
<StatusBadge status={order.status} statuses={ORDER_STATUS} />;

// Or create a reusable component once:
const OrderStatus = createStatusBadge(ORDER_STATUS, { displayName: 'OrderStatus' });
<OrderStatus status="paid" variant="solid" />;
```

If a value isn't in the map at runtime (for example, a new status from your API), it shows a neutral badge with the raw value. Pass `fallback={{ label: 'Unknown', tone: 'danger' }}` to change that. StatusBadge accepts the same `variant`, `size` and other props as Badge.

### Avatar

A picture, initials or icon that represents a person or thing.

```tsx
import { Avatar } from '@dawg-codes/react-toolkit';

<Avatar src={user.photoUrl} name={user.name} />
<Avatar name="Ada Lovelace" size="lg" />   {/* shows "AL" */}
<Avatar size="sm" />                       {/* generic person icon */}
```

| Prop       | Type                                   | Default     | Notes                                                          |
| ---------- | -------------------------------------- | ----------- | -------------------------------------------------------------- |
| `src`      | `string`                               | —           | If the image fails, the avatar shows initials, then the icon   |
| `name`     | `string`                               | —           | Used for initials and as the accessible name                   |
| `alt`      | `string`                               | `name`      | Accessible name if different. **`alt=""` makes it decorative** |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | 1.5, 2, 2.5, 3 and 4 rem. Any size via `--dawg-avatar-size`    |
| `shape`    | `'circle' \| 'square'`                 | `'circle'`  |                                                                |
| `fallback` | `ReactNode`                            | person icon | Shown when there is no image and no name                       |
| `imgProps` | `<img>` attributes                     | —           | For example `referrerPolicy`, `loading`, `crossOrigin`         |

**Accessibility.** The avatar is a single `role="img"` element named by `alt` or `name`, so screen readers announce it once. When the person's name is printed right next to the avatar, pass `alt=""` to avoid repeating it.

`getInitials(name)` is exported too: it uses the first letter of the first and last words, for example `getInitials('Grace Brewster Murray Hopper')` returns `'GH'`.

### Divider

A thin line that separates content.

```tsx
import { Divider } from '@dawg-codes/react-toolkit';

<Divider />                                  {/* <hr> */}
<Divider label="or" />                       {/* line, "or", line */}
<div style={{ display: 'flex' }}>A <Divider orientation="vertical" /> B</div>
```

| Prop          | Type                             | Default        | Notes                                               |
| ------------- | -------------------------------- | -------------- | --------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'`     | `'horizontal'` | Vertical stretches to the height of its flex row    |
| `label`       | `ReactNode`                      | —              | Horizontal only. The text is read by screen readers |
| `decorative`  | `boolean`                        | `false`        | Hidden from assistive technology                    |
| `spacing`     | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'`         | Space around the line                               |

### Spinner

An indeterminate loading indicator. It uses the current text colour.

```tsx
import { Spinner } from '@dawg-codes/react-toolkit';

<Spinner />                                      {/* decorative */}
<Spinner label="Loading results" />              {/* announced, label visually hidden */}
<Spinner label="Loading results" showLabel />    {/* label shown next to it */}
```

| Prop        | Type                   | Default | Notes                                                                                            |
| ----------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `size`      | `'sm' \| 'md' \| 'lg'` | `'md'`  | 1, 1.25 and 2 rem                                                                                |
| `label`     | `string`               | —       | With a label the spinner is a `role="status"`; without one it's hidden from assistive technology |
| `showLabel` | `boolean`              | `false` |                                                                                                  |

With reduced motion, the spinner turns more slowly rather than stopping, so it doesn't look frozen.

### Skeleton

A placeholder shown while content loads.

```tsx
import { Skeleton } from '@dawg-codes/react-toolkit';

<section aria-busy={loading} aria-label="Profile">
  {loading ? (
    <>
      <Skeleton variant="circle" width={48} />
      <Skeleton variant="text" lines={3} />
      <Skeleton height={160} /> {/* e.g. an image or chart */}
    </>
  ) : (
    <Profile />
  )}
</section>;
```

| Prop       | Type                           | Default                                          | Notes                                                       |
| ---------- | ------------------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| `variant`  | `'rect' \| 'text' \| 'circle'` | `'rect'`                                         |                                                             |
| `width`    | `number \| string`             | full width (`circle`: 2.5rem)                    | Numbers are pixels; strings are any CSS length              |
| `height`   | `number \| string`             | 1rem (`text`: one line; `circle`: same as width) |                                                             |
| `lines`    | `number`                       | `1`                                              | For `text`: several lines, the last one shorter             |
| `animated` | `boolean`                      | `true`                                           | The shimmer also stops when the user prefers reduced motion |

**Accessibility.** Skeletons are always hidden from assistive technology. Mark the loading region with `aria-busy="true"` and, if helpful, announce the loading state, for example with `<VisuallyHidden role="status">Loading profile</VisuallyHidden>`. To build a card placeholder, put skeletons inside a `Card`.

### ProgressBar

A horizontal bar for task progress or a measurement.

```tsx
import { ProgressBar } from '@dawg-codes/react-toolkit';

<ProgressBar value={uploaded} max={total} label="Uploading" showValue />
<ProgressBar aria-label="Loading" />   {/* no value: indeterminate */}
<ProgressBar
  semantics="meter"
  value={7.2}
  max={10}
  label="Storage used"
  showValue
  tone="warning"
  formatValue={(v, max) => `${v} of ${max} GB`}
/>
```

| Prop          | Type                                                                     | Default         | Notes                                                                               |
| ------------- | ------------------------------------------------------------------------ | --------------- | ----------------------------------------------------------------------------------- |
| `value`       | `number \| null`                                                         | —               | 0 to `max`, clamped. Leave it out for an indeterminate bar                          |
| `max`         | `number`                                                                 | `100`           |                                                                                     |
| `label`       | `ReactNode`                                                              | —               | Visible label and accessible name. **Without it, pass `aria-label`**                |
| `showValue`   | `boolean`                                                                | `false`         | Shows the formatted value next to the label                                         |
| `formatValue` | `(value, max) => string`                                                 | rounded percent | Also used as `aria-valuetext`                                                       |
| `tone`        | `'primary' \| 'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'primary'`     |                                                                                     |
| `size`        | `'sm' \| 'md' \| 'lg'`                                                   | `'md'`          | Bar thickness                                                                       |
| `semantics`   | `'progressbar' \| 'meter'`                                               | `'progressbar'` | `meter` is for measurements in a known range (quota, capacity); never indeterminate |

The bar fills from the right in right-to-left layouts. With reduced motion, an indeterminate bar is shown as a still, half-strength bar.

### EmptyState

Explains why an area has no content and what to do next.

```tsx
import { EmptyState, Button } from '@dawg-codes/react-toolkit';

<EmptyState
  icon={<InboxIcon />}
  title="No messages yet"
  description="When someone sends you a message, it will appear here."
  action={<Button variant="primary">New message</Button>}
/>;
```

| Prop           | Type                    | Default    | Notes                                      |
| -------------- | ----------------------- | ---------- | ------------------------------------------ |
| `title`        | `ReactNode`             | (required) |                                            |
| `description`  | `ReactNode`             | —          | Short text (rendered in a `<p>`)           |
| `icon`         | `ReactNode`             | —          | Hidden from assistive technology           |
| `action`       | `ReactNode`             | —          | Buttons or links                           |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3`        | Pick the level that fits your page outline |
| `size`         | `'sm' \| 'md'`          | `'md'`     | `sm` for cards, tables and panels          |
| `align`        | `'center' \| 'start'`   | `'center'` |                                            |

Extra `children` are rendered between the description and the actions. If the empty state appears as the result of a search, announce it through your own live region.

### VisuallyHidden

Content hidden on screen but read by screen readers.

```tsx
import { VisuallyHidden } from '@dawg-codes/react-toolkit';

<button type="button">
  <CloseIcon aria-hidden="true" />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>;
```

The `.dawg-visually-hidden` class is also available in plain HTML.

## Forms

Labelled form controls built on native elements, so browser autofill, form submission, `FormData` and screen readers work as usual. Each control wires up its label, hint and error message for you. Import them from `@dawg-codes/react-toolkit/form` (or the root); the styles are in `css/form.css`.

```tsx
import { Checkbox, PasswordField, TextField } from '@dawg-codes/react-toolkit/form';

<TextField name="email" type="email" label="Email" autoComplete="email" required />
<PasswordField name="password" label="Password" />
<Checkbox name="remember" label="Keep me signed in" />
```

### Shared props

Every control takes these:

| Prop        | Type        | Notes                                                                                                                  |
| ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| `label`     | `ReactNode` | Required, so every control has a name                                                                                  |
| `hint`      | `ReactNode` | Help text, read by screen readers along with the control                                                               |
| `error`     | `ReactNode` | Shows the message with an icon and marks the control invalid (`aria-invalid`). `true` marks it invalid with no message |
| `hideLabel` | `boolean`   | Hides the label visually; screen readers still read it                                                                 |

- **Where props go.** The `ref`, `id` and native attributes (`name`, `required`, `autoComplete`, `onChange` and so on) go to the input itself. `className` and `style` go to the wrapper, so `style={{ maxWidth: 320 }}` sizes the whole field. RadioGroup is the exception: everything goes to its `<fieldset>`.
- **Ids.** Without an `id`, one is generated. The hint and error get `<id>-hint` and `<id>-error`, and are added to any `aria-describedby` you pass.
- **Required fields** get a `*` after the label. It's hidden from screen readers, which announce the native `required` instead.

### Validation

Validate in your submit handler, pass the messages to `error`, then call `focusFirstInvalid` so keyboard and screen reader users land on the first problem:

```tsx
import { Button } from '@dawg-codes/react-toolkit';
import { focusFirstInvalid, PasswordField, TextField } from '@dawg-codes/react-toolkit/form';

function SignUp() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = validate(data); // your rules
    setErrors(next);
    if (Object.keys(next).length) focusFirstInvalid(event.currentTarget);
    else save(data);
  }

  return (
    <form onSubmit={submit} noValidate>
      <TextField name="email" type="email" label="Email" error={errors.email} required />
      <PasswordField
        name="password"
        label="Password"
        autoComplete="new-password"
        error={errors.password}
      />
      <Button type="submit" variant="primary">
        Create account
      </Button>
    </form>
  );
}
```

`focusFirstInvalid` waits one frame, so React has rendered the messages first. Write messages that say how to fix the problem ("Enter an email address like name@example.com"), not just that something is wrong.

**Error summary.** For longer forms, show a `FormAlert` at the top that lists every problem and links to each field. It takes focus (`tabIndex={-1}`), so you can move focus to it instead of the first field:

```tsx
<FormAlert
  ref={summaryRef}
  title="There is a problem"
  items={[
    { message: 'Enter your email', fieldId: 'email' },
    { message: 'Choose a plan', fieldId: 'plan' },
  ]}
/>
```

Clicking a link focuses the field and scrolls its label into view; for a radio group, it focuses the checked radio (or the first). Give each field the matching `id`.

### Controls

| Component          | Built on                                          | Its own props                                                                                                       |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TextField`        | `<input>`                                         | `size` (`'sm' \| 'md' \| 'lg'`), `startIcon` (decorative), `endAddon` (a unit such as `kg`, or a small button)      |
| `TextArea`         | `<textarea>`                                      | `autoGrow` (grows with the text, from `rows` lines; default 3)                                                      |
| `SelectField`      | `<select>`                                        | `options` (objects or strings, or pass `<option>`s), `placeholder`, `size`                                          |
| `Checkbox`         | `<input type="checkbox">`                         | `indeterminate` (for "select all")                                                                                  |
| `RadioGroup`       | `<fieldset role="radiogroup">` with native radios | `options`, `value` / `defaultValue` / `onValueChange`, `name`, `required`, `orientation`, `variant` (`'card'`)      |
| `Switch`           | `<input type="checkbox" role="switch">`           | `labelPlacement` (`'start' \| 'end'`)                                                                               |
| `SearchField`      | `<input type="search">`                           | `value` / `defaultValue` / `onValueChange`, `clearLabel`                                                            |
| `PasswordField`    | `<input type="password">`                         | `strength`, `showLabel`, `strengthPrefix`                                                                           |
| `OneTimeCodeField` | `<input>`                                         | `length` (6), `characters` (`'digits' \| 'alphanumeric'`), `value` / `defaultValue` / `onValueChange`, `onComplete` |
| `FormAlert`        | `<div role="alert">` or `role="status"`           | `title`, `items`, `tone` (`'danger' \| 'warning' \| 'info' \| 'success'`)                                           |
| `FieldError`       | `<p>`                                             | An error message with its icon, for your own controls                                                               |

**SelectField** is the browser's own picker, which works well on phones and with screen readers. With `placeholder` it starts on an empty choice; when the field is `required`, that choice can't be picked again, so the browser's required check works. Multiple selection isn't supported.

**RadioGroup** uses native radios, so arrow keys move between choices. The group carries the `error`, `hint`, `required` and `disabled` state; each option can have its own `hint` and `disabled`. With `variant="card"` each choice is a bordered box that is clickable anywhere.

**Switch** is for settings that apply straight away. In a form that is submitted, use a Checkbox. It works like a checkbox: `checked`, `defaultChecked` and `onChange`.

**SearchField** shows a clear button once there is text. Escape also clears it; when the field is already empty, Escape is passed on (for example, to close a dialog). Put it inside a `<search>` element or `<form role="search">`.

**PasswordField** has a show/hide button: a toggle (`aria-pressed`) whose name stays "Show password". The password is hidden again when its form is submitted, so browsers still offer to save it. It defaults to `autoComplete="current-password"`; use `"new-password"` on sign-up and reset forms.

Pass `strength={estimatePasswordStrength}` to show a meter on sign-up forms (not sign-in). The meter's text is linked to the field and announced politely when it changes. `estimatePasswordStrength` is a rough, offline guide: length counts most, mixing character types helps, and common passwords, repeats and sequences ("1234", "qwer") count against it. It is not a security check: enforce your real rules on the server, ideally including a check against breached-password lists. You can pass your own function returning `{ score: 0–4, label }`, or translated labels as its second argument.

**OneTimeCodeField** is a single input, not one box per digit, so pasting, the browser's one-time-code autofill and screen readers all work. Spaces, dashes and other characters that can't be part of the code are removed as users type or paste. `onComplete` is called once the code is full, for example to submit automatically.

**FormAlert** is announced at once for `danger` and `warning` (`role="alert"`), and politely for `info` and `success` (`role="status"`). Extra `children` are shown under the title.

## Dialogs, toasts and menus

Import them from `@dawg-codes/react-toolkit/dialog`, `/toast` and `/menu` (or the root).

### Dialog

A modal dialog built on the native `<dialog>` element. The browser keeps keyboard focus inside it, makes the rest of the page inert and shows it above everything else; the toolkit adds the layout, a close button, backdrop clicks and returning focus to where it was.

```tsx
import { Dialog } from '@dawg-codes/react-toolkit/dialog';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Edit profile</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Edit profile"
  description="This is shown to people you work with."
  footer={
    <>
      <Button onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="primary" type="submit" form="profile">Save</Button>
    </>
  }
>
  <form id="profile" onSubmit={save}>…</form>
</Dialog>
```

| Prop              | Type                           | Default    | Notes                                                                            |
| ----------------- | ------------------------------ | ---------- | -------------------------------------------------------------------------------- |
| `open`            | `boolean`                      | (required) |                                                                                  |
| `onClose`         | `() => void`                   | (required) | Called for the close button, Escape and backdrop clicks; set `open` to false     |
| `title`           | `ReactNode`                    | (required) | An `<h2>`, and the dialog's accessible name                                      |
| `description`     | `ReactNode`                    | —          | Read by screen readers when the dialog opens                                     |
| `footer`          | `ReactNode`                    | —          | Actions. On phones they stack full width, the last one on top                    |
| `size`            | `'sm' \| 'md' \| 'lg'`         | `'md'`     | Maximum width: 26, 32 or 48rem                                                   |
| `dismissible`     | `boolean`                      | `true`     | `false` ignores Escape and backdrop clicks and hides the close button            |
| `initialFocus`    | `RefObject<HTMLElement>`       | —          | What to focus on opening; otherwise the browser picks the first focusable item   |
| `closeLabel`      | `string`                       | `'Close'`  | Accessible name of the × button                                                  |
| `hideCloseButton` | `boolean`                      | `false`    |                                                                                  |
| `role`            | `'dialog' \| 'alertdialog'`    | `'dialog'` | Use ConfirmDialog for confirmations                                              |
| `placement`       | `'center' \| 'start' \| 'end'` | `'center'` | `start` and `end` make a full-height side panel (20, 24 or 32rem wide by `size`) |

The body scrolls when the content is long, so the title and actions stay in view, and the page behind doesn't scroll. To put a form's submit button in the footer, give the form an `id` and the button `form="that-id"`.

### ConfirmDialog

Asks the user to confirm an action (`role="alertdialog"`).

```tsx
import { ConfirmDialog } from '@dawg-codes/react-toolkit/dialog';

<ConfirmDialog
  open={confirming}
  title="Delete this project?"
  description="Its files and history will be removed."
  confirmLabel="Delete project"
  tone="danger"
  loading={deleting}
  onConfirm={remove}
  onCancel={() => setConfirming(false)}
/>;
```

- Label the confirm button with what it does ("Delete project"), not "OK" or "Yes".
- With `tone="danger"`, the button is red and **Cancel** gets focus first, so an accidental Enter doesn't delete anything. Otherwise the confirm button gets focus.
- While `loading`, the confirm button shows a spinner, Cancel is disabled and Escape is ignored. Close the dialog yourself when the work is done.
- Also takes `cancelLabel`, `size` (default `sm`) and `children` for extra content.

### Toasts

Short messages that appear for a few seconds, such as "Saved". Add a `ToastProvider` once, near the root, then call `toast()` from anywhere below it:

```tsx
import { ToastProvider, useToast } from '@dawg-codes/react-toolkit/toast';

<ToastProvider>
  <App />
</ToastProvider>;

function SaveButton() {
  const { toast } = useToast();
  return (
    <Button onClick={() => save().then(() => toast({ title: 'Saved', tone: 'success' }))}>
      Save
    </Button>
  );
}
```

`toast(options)` returns an id, and `dismiss(id)` hides one toast (`dismiss()` hides them all).

| Option        | Type                                                        | Default     | Notes                                                          |
| ------------- | ----------------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `title`       | `ReactNode`                                                 | (required)  |                                                                |
| `description` | `ReactNode`                                                 | —           |                                                                |
| `tone`        | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Adds an icon and a coloured edge                               |
| `action`      | `{ label: string; onClick: () => void }`                    | —           | A button such as Undo. The toast closes after it runs          |
| `duration`    | `number`                                                    | provider's  | Milliseconds, or `Infinity` to stay until closed               |
| `id`          | `string`                                                    | generated   | Reuse an id to replace a toast, e.g. "Uploading…" → "Uploaded" |

`ToastProvider` takes `position` (`'top-start'`, `'top-center'`, `'top-end'`, `'bottom-start'`, `'bottom-center'` or `'bottom-end'`, the default), `duration` (default 5000), `limit` (default 4; the oldest goes first), and `label` and `closeLabel` for translations.

**Accessibility.** Toasts are announced politely by screen readers from a live region that is always on the page. They pause while the pointer or keyboard focus is on them, or the tab is hidden, and every toast has a close button. Because toasts disappear, anything important, and anything a toast's action does, must also be available somewhere else in your app. For errors the user has to act on, prefer a message in the page, such as a FormAlert, or `duration: Infinity`.

### DropdownMenu

A button that opens a list of actions, following the ARIA menu button pattern.

```tsx
import { DropdownMenu } from '@dawg-codes/react-toolkit/menu';

<DropdownMenu
  label="Actions"
  items={[
    { label: 'Edit', icon: <EditIcon />, onSelect: edit },
    { label: 'Duplicate', onSelect: duplicate },
    { label: 'Help', href: '/help' },
    'separator',
    { label: 'Delete', tone: 'danger', onSelect: confirmDelete },
  ]}
/>

<DropdownMenu label={<MoreIcon />} iconOnly aria-label="Actions for Ana" variant="ghost" align="end" items={…} />
```

| Prop                             | Type               | Default        | Notes                                                   |
| -------------------------------- | ------------------ | -------------- | ------------------------------------------------------- |
| `label`                          | `ReactNode`        | (required)     | The button's content                                    |
| `items`                          | `MenuItem[]`       | (required)     | Actions, links (`href`) or `'separator'`                |
| `align`                          | `'start' \| 'end'` | `'start'`      | Which edge of the button the menu lines up with         |
| `aria-label`                     | `string`           | —              | **Required with `iconOnly`**; name the thing it acts on |
| `variant`, `size`, `iconOnly`, … | as Button          | as Button      |                                                         |
| `showArrow`                      | `boolean`          | not `iconOnly` | Down arrow after the label                              |

Each item takes `label`, `onSelect` or `href`, and optionally `icon`, `tone: 'danger'`, `disabled` and `textValue` (for type-to-select when the label isn't plain text).

**Keyboard.** Enter, Space or the arrow keys open the menu. Arrow keys move between items (disabled items can be reached but not chosen), Home and End jump to the ends, and typing a letter jumps to the next item starting with it. Enter or Space chooses; Escape closes and returns focus to the button; Tab closes and moves on.

**Positioning.** The menu is positioned against the window, so it isn't cut off inside scrolling tables or cards that hide overflow. It opens upwards when there isn't room below and stays on screen, including in right-to-left pages. It sits above toasts.

## App layout

The frame of an app and of its sign-in pages. Import from `@dawg-codes/react-toolkit/layout` (or the root). The playground has full-page demos of both: run `pnpm playground` and open "App layout".

### AppShell and AppHeader

```tsx
import {
  AppHeader,
  AppShell,
  MobileTabBar,
  PageHeader,
  SideNav,
} from '@dawg-codes/react-toolkit/layout';

<AppShell
  header={
    <AppHeader
      brand={<Logo />}
      actions={
        <>
          <ThemeToggle hideLabels size="sm" />
          <AccountMenu />
        </>
      }
    />
  }
  sidebar={<SideNav sections={sections} currentHref={pathname} />}
  tabBar={<MobileTabBar items={tabs} currentHref={pathname} />}
>
  <PageHeader title="Projects" actions={<Button variant="primary">New project</Button>} />…
</AppShell>;
```

What you get:

- **A skip link** ("Skip to main content") as the first thing keyboard users reach. It moves focus to `<main>` without changing the URL, so it also works with hash-based routers.
- **Landmarks:** AppHeader is the `<header>` (banner), SideNav and MobileTabBar are labelled `<nav>`s, and your page goes in `<main>`.
- **A sticky header**, and on screens 64rem (1024px) and wider, a sticky sidebar column that scrolls on its own.
- **A navigation drawer on narrower screens.** AppHeader shows a menu button that opens the same sidebar in a modal side panel (a Dialog with `placement="start"`): focus stays inside, Escape closes it, choosing a link closes it, and focus returns to the menu button. Widening the window closes it.
- **A bottom tab bar on phones** (narrower than 48rem), with room left under the page so nothing is hidden behind it.

| AppShell prop   | Notes                                                 |
| --------------- | ----------------------------------------------------- |
| `header`        | Usually an AppHeader                                  |
| `sidebar`       | Usually a SideNav; shown as a column or in the drawer |
| `tabBar`        | Usually a MobileTabBar                                |
| `children`      | The page, rendered in `<main>`                        |
| `skipLinkLabel` | Default `'Skip to main content'`                      |
| `navTitle`      | Heading of the drawer. Default `'Menu'`               |
| `mainId`        | Id of `<main>`; generated by default                  |

AppHeader takes `brand` (start), `children` (middle, e.g. a search field) and `actions` (end), plus `menuLabel` (default `'Open navigation'`). For your own menu button, `useAppShell()` returns `{ navOpen, openNav, closeNav, hasSidebar }`.

### SideNav and MobileTabBar

```tsx
const sections: NavSection[] = [
  { items: [{ label: 'Overview', href: '/', icon: <HomeIcon /> }, { label: 'Inbox', href: '/inbox', icon: <InboxIcon />, badge: '12' }] },
  { title: 'Workspace', items: [{ label: 'Settings', href: '/settings', icon: <SettingsIcon /> }] },
];

<SideNav sections={sections} currentHref={pathname} footer={<UserCard />} />
<MobileTabBar items={tabs} currentHref={pathname} />
```

- Pass `items` for one list or `sections` for headed groups. Each item has `label`, `href`, and optionally `icon` (decorative), `badge` and `current`.
- The current page gets `aria-current="page"` and is marked by more than colour: a tinted background and a bar in the side navigation, a pill behind the icon in the tab bar. Set it with `currentHref` or an item's `current`.
- Badges are read after the label ("Inbox 12"). If a number needs explaining, pass text such as `<><span aria-hidden="true">12</span><VisuallyHidden>12 unread</VisuallyHidden></>`.
- **Routers.** Links are plain `<a>` elements by default. Pass `renderLink` to use your router's link: `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
- MobileTabBar is for up to five destinations, each with an icon and a short label. SideNav also takes `header`, `footer` and `label` (default `'Main'`; the tab bar's is `'Primary'`).

### PageHeader

The top of a page: an `<h1>` title, an optional `description`, `actions` that wrap under the title on phones, and an `eyebrow` above the title for breadcrumbs or a back link. Use `titleAs="h2"` if the page already has an `<h1>`.

### AuthLayout

A full-page layout for sign-in, sign-up and password reset screens.

```tsx
import { AuthLayout } from '@dawg-codes/react-toolkit/layout';

<AuthLayout
  brand={<Logo />}
  title="Sign in"
  description="Welcome back."
  actions={<ThemeToggle hideLabels size="sm" />}
  footer={
    <>
      No account? <a href="/sign-up">Create one</a>
    </>
  }
  aside={<p>Plan, track and ship your projects in one place.</p>}
>
  <form>…</form>
</AuthLayout>;
```

The form sits in a centred panel inside `<main>`, under an `<h1>`. `actions` go in a `<header>` in the top corner, and `aside` becomes an `<aside>` panel in the accent colour on screens 64rem and wider (hidden on smaller ones, so don't put anything essential there).

## Data

Lists of records: import from `@dawg-codes/react-toolkit/table`, `/pagination` and `/csv` (or the root). The playground's "Data table" section puts them together with search, a filter, bulk actions and export.

### DataTable

A real `<table>`, so screen readers announce rows, columns and headers, with sorting, selection, row actions, and loading and empty states.

```tsx
import { DataTable, type DataTableColumn } from '@dawg-codes/react-toolkit/table';

const columns: DataTableColumn<Member>[] = [
  { key: 'name', header: 'Name', rowHeader: true, sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  {
    key: 'status',
    header: 'Status',
    cell: (m) => <MemberStatus status={m.status} />,
    value: (m) => m.status,
  },
  { key: 'projects', header: 'Projects', sortable: true, align: 'end', hideBelow: 'md' },
];

<DataTable
  caption="Team members"
  columns={columns}
  rows={members}
  getRowId={(m) => m.id}
  selectable
  bulkActions={(ids, clear) => (
    <Button
      size="sm"
      variant="danger"
      onClick={() => {
        remove(ids);
        clear();
      }}
    >
      Remove
    </Button>
  )}
  rowActions={(m) => [
    { label: 'Edit', onSelect: () => edit(m) },
    'separator',
    { label: 'Remove', tone: 'danger', onSelect: () => confirmRemove(m) },
  ]}
  empty={<EmptyState size="sm" title="No members found" />}
/>;
```

**Columns.** Each has a `key` and `header`. By default a cell shows `row[key]`; pass `cell` to render something else and `value` for the raw value used to sort and export. Mark the column that names each row with `rowHeader`: its cells become row headers (`<th scope="row">`) and its value labels each row's checkbox and actions menu ("Select Ana Silva", "Actions for Ana Silva"). Also `align` (`'end'` for numbers), `width`, and `hideBelow: 'md' | 'lg'` to drop less important columns on small screens.

| Prop                                                     | Notes                                                                                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `caption`                                                | Required: names the table for screen readers. `hideCaption` hides it visually                                                             |
| `sortable` columns                                       | Press a header to sort; press again to reverse. The sorted header gets `aria-sort`                                                        |
| `sort`, `defaultSort`, `onSortChange`                    | `{ key, direction: 'asc' \| 'desc' }`, controlled or not. Add `manualSort` when your server sorts the rows                                |
| `selectable`                                             | A checkbox per row and a select-all checkbox (with a "some selected" state) for the rows passed in                                        |
| `selectedIds`, `defaultSelectedIds`, `onSelectionChange` | Selected row ids, controlled or not. The count is announced to screen readers                                                             |
| `bulkActions`                                            | `(ids, clear) => ReactNode`, shown above the table while rows are selected, with a Clear selection button                                 |
| `rowActions`                                             | `(row) => MenuItem[]`: a DropdownMenu at the end of each row                                                                              |
| `loading`, `loadingRows`                                 | Placeholder rows when there are no rows yet; `aria-busy` on the table                                                                     |
| `empty`                                                  | Shown when there are no rows. Default "No results."                                                                                       |
| `density`                                                | `'comfortable'` (default) or `'compact'`                                                                                                  |
| `maxHeight`                                              | Limits the height and keeps the header visible while rows scroll                                                                          |
| labels                                                   | `selectAllLabel`, `selectRowLabel`, `rowActionsLabel`, `selectedCountLabel`, `clearSelectionLabel`, `actionsHeaderLabel` for translations |

Sorting puts numbers and dates in order by value and text in natural order ("Item 2" before "Item 10"), ignoring case; empty values always go last. `sortRows(rows, column, direction)` does the same outside the table.

**Small screens.** The table scrolls sideways inside its own frame instead of widening the page, and the frame can be focused and scrolled with the arrow keys. Use `hideBelow` to keep it narrow on phones.

### Pagination

```tsx
import { Pagination, paginate } from '@dawg-codes/react-toolkit/pagination';

const current = paginate(filteredRows, page, 10); // { items, page, pageCount, from, to, total }

<DataTable rows={current.items} … />
<Pagination
  page={current.page}
  pageCount={current.pageCount}
  onPageChange={setPage}
  summary={`Showing ${current.from}–${current.to} of ${current.total}`}
/>;
```

A `<nav aria-label="Pagination">` with Previous and Next, page numbers with gaps (1 … 4 5 6 … 20), and the current page marked with `aria-current="page"`. On phones the numbers give way to "Page 2 of 10". Pass ``getHref={(page) => `?page=${page}`}`` to render links instead of buttons, so pages can be bookmarked. Also takes `siblingCount`, and `label`, `previousLabel`, `nextLabel`, `pageLabel` and `compactLabel` for translations.

### CSV

Functions with no React and no dependencies.

```ts
import { downloadCsv, parseCsv, toCsv } from '@dawg-codes/react-toolkit/csv';
import { tableToCsv } from '@dawg-codes/react-toolkit/table';

downloadCsv(tableToCsv(filteredRows, columns), 'members'); // uses each column's value and header
const csv = toCsv(rows, [{ header: 'Name', value: (r) => r.name }]);
const table = parseCsv(fileText); // string[][]
```

- `toCsv` writes RFC 4180 CSV: values with commas, quotes or line breaks are quoted, dates become ISO text, and lines end with `\r\n`. Options: `delimiter` (e.g. `;`) and `newline`.
- **Formula protection.** Text starting with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'`, so spreadsheet apps show it instead of running it as a formula (CSV injection). Numbers are left alone. Turn it off with `protectFormulas: false` only for files that never reach a spreadsheet.
- `downloadCsv(csv, filename)` saves the file in the browser, with a byte order mark so Excel reads accented and non-Latin text correctly.
- `parseCsv(text)` reads CSV back into rows of strings, including quoted values with line breaks. It doesn't convert or trust anything: validate the values as you would any user input.

## Browser support

The styles need cascade layers, `color-mix()` and logical properties, which are supported in Chrome and Edge 111+, Firefox 113+ and Safari 16.2+ (all released in 2023). Browsers without cascade-layer support ignore the styles completely. `:has()` is used for the interactive card's focus ring, the focus ring around a whole form control (with its icon and buttons) and the selected radio card's border. Without it, the card's ring stays on the link, form controls fall back to `:focus-within`, and a selected radio card shows only its checked radio. TextArea's `autoGrow` needs CSS `field-sizing` (Chrome and Edge 123+); elsewhere the text area keeps its height and users can resize it. Dialog uses the native `<dialog>` element and `:modal`; the page-scroll lock behind it also uses `:has()`. Side-panel dialogs slide in from the correct edge in right-to-left pages using `:dir()`.

## Server rendering and React Server Components

Components render on the server: there is no `window` or `document` access during import or render, and this was checked with `renderToString` through both ESM and CommonJS. Every entry point is marked `'use client'`, so in the Next.js App Router you can import them from Server Components.

## Known limitations

- **Not published yet.** This is a pre-release workspace package.
- **No icon set.** Pass your own SVG icons to `icon`, `startIcon` and similar props.
- **Not included yet:** Tooltip, Tabs and Breadcrumbs; in forms, multiple select, combobox (autocomplete), date picker and file upload; submenus and checkable items in DropdownMenu; collapsible groups in SideNav; column resizing, row virtualisation and a stacked phone layout in DataTable.
- **DataTable sorts and selects the rows you pass in.** For server-side data, pass one page of rows, sort on the server (`manualSort`) and paginate there. Select-all selects the rows shown, not every row in your data.
- **AppShell's breakpoints are fixed:** the sidebar becomes a column at 64rem and the tab bar hides at 48rem, because CSS media queries can't read custom properties.
- **Toasts shown while a modal Dialog is open appear behind it** and can't be reached until it closes, because the browser makes everything outside the dialog inert. Show messages inside the dialog instead (for example with FormAlert).
- **Menus and toasts are rendered where you put them, not in a portal**, so React stays the only dependency. They use fixed positioning, which breaks inside an ancestor with `transform`, `filter` or `contain`; put the ToastProvider near the root.
- **Button is always a `<button>`.** For links, use `buttonStyleProps()` on an `<a>` or your router's link.
- **Card's `as` is limited to non-interactive elements**, by design. Use the stretched-link pattern for clickable cards.
- **Avatar initials come from the first and last words of the name** and may not suit every naming convention. Pass `alt` and a custom `fallback`, or render your own initials, if needed.
- **Right-to-left layouts are only partly tested.** ProgressBar, Switch, DropdownMenu and AppShell (sidebar and drawer) have been checked in a right-to-left page; the other components use logical properties in most places but have not been tested in RTL yet.

## License

[MIT](LICENSE) © 2026 Dawg Codes
