# @dawg-codes/react-toolkit

Accessible, themeable React components and design tokens from **DawgStack**.

> **Status: early development (0.0.0), not published to npm yet.** The API may change before the first release. To try the components today, run the playground from this repository (see the [root README](../../README.md)).

- **React is the only peer dependency** (18.2+ or 19). There are no runtime dependencies.
- **Plain CSS with design tokens.** There's no CSS-in-JS and no Tailwind requirement. All styles live in cascade layers, so your own CSS always wins.
- **Light, dark and system themes**, with WCAG AA colour contrast checked by tests in both themes.
- **Import everything or one component at a time.** Ships ESM and CommonJS with TypeScript types, and server-rendering safe.

## Contents

- [Styles](#styles)
- [Theming](#theming)
- [Components](#components): [Button](#button) · [Card](#card) · [Badge and StatusBadge](#badge-and-statusbadge) · [Avatar](#avatar) · [Divider](#divider) · [Spinner](#spinner) · [Skeleton](#skeleton) · [ProgressBar](#progressbar) · [EmptyState](#emptystate) · [VisuallyHidden](#visuallyhidden)
- [Browser support](#browser-support)
- [Known limitations](#known-limitations)

## Styles

Import the CSS once, near the root of your app. Choose one of two options.

```ts
// Option 1: everything (about 34 kB unminified, under 7 kB gzipped)
import '@dawg-codes/react-toolkit/styles.css';

// Option 2: only what you use. core.css is always required and must come first.
import '@dawg-codes/react-toolkit/core.css';
import '@dawg-codes/react-toolkit/css/button.css';
import '@dawg-codes/react-toolkit/css/card.css';
```

Component files in `css/` are named after the component's entry point: `avatar`, `badge` (also covers StatusBadge), `button`, `card`, `divider`, `empty-state`, `progress-bar`, `skeleton` and `spinner`. VisuallyHidden's styles are in `core.css`.

The toolkit never styles `html` or `body`. Use the tokens for your page if you like:

```css
body {
  background: var(--dawg-color-bg);
  color: var(--dawg-color-text);
}
```

Components can be imported from the root, or from their own entry point to keep bundles small (both tree-shake):

```tsx
import { Button, Card } from '@dawg-codes/react-toolkit';
import { ProgressBar } from '@dawg-codes/react-toolkit/progress-bar';
```

## Theming

### Light, dark and system

Light is the default. Set `data-dawg-theme` on `<html>`, or on any element to theme only that part of the page:

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

There is no theme provider or toggle component yet. Set the attribute yourself (the playground shows one way, with the choice saved in `localStorage`).

### Customising tokens

Override any token with ordinary CSS. Because the toolkit's styles are in cascade layers, your unlayered rules win without `!important`:

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
| Surfaces        | `--dawg-color-bg`, `-surface`, `-surface-muted`, `-surface-strong`, `-border`, `-border-strong`                                                                                                                    |
| Text            | `--dawg-color-text`, `-text-muted`, `-text-subtle`, `--dawg-color-focus-ring`                                                                                                                                      |
| Tones           | for each of `primary`, `neutral`, `info`, `success`, `warning`, `danger`: `--dawg-color-<tone>` (text and graphics), `-soft` (tinted background), `-border`, `-solid`, `-solid-hover`, `-on-solid` (text on solid) |
| Type and layout | `--dawg-font-size-xs` … `-xl`, `--dawg-font-weight-*`, `--dawg-space-1` … `-12`, `--dawg-radius-xs` … `-full`, `--dawg-control-height-sm/md/lg`, `--dawg-touch-target`                                             |
| Effects         | `--dawg-shadow-sm/md/lg`, `--dawg-duration-*`, `--dawg-easing-*`                                                                                                                                                   |

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

## Browser support

The styles need cascade layers, `color-mix()` and logical properties, which are supported in Chrome and Edge 111+, Firefox 113+ and Safari 16.2+ (all released in 2023). Browsers without cascade-layer support ignore the styles completely. The interactive card's focus ring around the whole card needs `:has()`; without it, the focus ring stays on the link itself.

## Server rendering and React Server Components

Components render on the server: there is no `window` or `document` access during import or render, and this was checked with `renderToString` through both ESM and CommonJS. Every entry point is marked `'use client'`, so in the Next.js App Router you can import them from Server Components.

## Known limitations

- **Not published yet.** This is a pre-release workspace package.
- **No theme provider or toggle yet.** Set `data-dawg-theme` yourself.
- **No icon set.** Pass your own SVG icons to `icon`, `startIcon` and similar props.
- **Not included yet:** Tooltip, Tabs and Breadcrumbs.
- **Button is always a `<button>`.** For links, use `buttonStyleProps()` on an `<a>` or your router's link.
- **Card's `as` is limited to non-interactive elements**, by design. Use the stretched-link pattern for clickable cards.
- **Avatar initials come from the first and last words of the name** and may not suit every naming convention. Pass `alt` and a custom `fallback`, or render your own initials, if needed.
- **Right-to-left layouts are only partly tested.** ProgressBar has been checked in a right-to-left page; the other components use logical properties in most places but have not been tested in RTL yet.
