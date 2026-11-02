# DawgStack

**Build once. Stack smarter.**

DawgStack is an open-source React toolkit by Dawg Codes: reusable UI components, design tokens and developer utilities that help you build modern React applications without re-implementing the same basics in every project.

> **Status: early development.** Nothing is published to npm yet, and the API may change before the first release.

| Light                                                                | Dark                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| ![The playground in light mode](docs/screenshots/overview-light.png) | ![The playground in dark mode](docs/screenshots/overview-dark.png) |

## Features

- **Accessible components.** Buttons, cards, badges, avatars, loading states and more. They use semantic HTML and correct ARIA, work with the keyboard, and are tested with axe-core.
- **Themes users can switch.** A ready-made toggle for light, dark or follow-the-system. The choice is saved, follows the OS live, stays in sync across tabs, and never flashes the wrong theme on load.
- **Modular styling.** Mix and match accent presets (indigo, teal, pink, graphite) with shape presets (sharp, default, round), define your own typed theme, or give one part of a page its own theme.
- **Take only what you need.** Import all styles, just the components you use, or none and style everything yourself. Every component also has its own JavaScript entry point.
- **Customise without forking.** 105 tokens (90 design tokens and 15 per-component hooks), all in CSS cascade layers, so your own CSS always wins without `!important`.
- **Contrast you can trust.** Every colour pair in both themes and in every preset is tested against WCAG AA. Reduced motion, Windows High Contrast and right-to-left progress bars are handled.
- **Works anywhere.** React 18 and 19, ESM and CommonJS, TypeScript types, server rendering and React Server Components. React is the only peer dependency, and there are no runtime dependencies.

## A quick look

```tsx
import '@dawg-codes/react-toolkit/styles.css';
import { Button, Card, CardTitle, ProgressBar } from '@dawg-codes/react-toolkit';
import {
  ThemeProvider,
  ThemeToggle,
  accentPresets,
  mergeThemes,
  shapePresets,
} from '@dawg-codes/react-toolkit/theme';

const theme = mergeThemes(accentPresets.teal, shapePresets.round);

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <ThemeToggle />
      <Card>
        <CardTitle>Storage</CardTitle>
        <ProgressBar value={72} label="Used" showValue />
        <Button variant="primary">Upgrade</Button>
      </Card>
    </ThemeProvider>
  );
}
```

## Screenshots

**Components**: cards (including an accessible clickable card), badges with typed statuses, and avatars with automatic fallbacks.

![Cards, badges and avatars](docs/screenshots/components.png)

**Presets**: the same buttons under four theme modules. Clockwise from top left: indigo with default corners (light), teal with round corners (light), graphite (dark), and pink with sharp corners (dark).

![Buttons in four preset combinations](docs/screenshots/presets.png)

**Loading and progress**: skeleton placeholders, determinate, indeterminate and meter-style progress bars, in dark mode.

![Skeleton and progress components in dark mode](docs/screenshots/feedback-dark.png)

**On a phone**: the theme toggle and the Customise panel wrap to fit small screens.

![The playground on a phone, light and dark](docs/screenshots/mobile.png)

## What's included

The [`@dawg-codes/react-toolkit`](packages/react-toolkit) package provides:

| Component             | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| Button                | Five variants, three sizes, icons and an accessible loading state       |
| Card                  | Basic, bordered and elevated surfaces, plus accessible clickable cards  |
| Badge and StatusBadge | Status and category labels; typed mapping from your own status values   |
| Avatar                | Image with automatic fallback to initials, then an icon                 |
| Divider               | Horizontal, vertical and labelled separators                            |
| Spinner               | Loading indicator with an optional screen-reader label                  |
| Skeleton              | Text, block and circle loading placeholders                             |
| ProgressBar           | Determinate, indeterminate and meter-style bars                         |
| EmptyState            | "Nothing here yet" panels with an icon, explanation and actions         |
| VisuallyHidden        | Text for screen readers only                                            |
| Theme tools           | ThemeProvider, ThemeToggle, ThemeScope, presets and typed custom themes |

**See the [component documentation](packages/react-toolkit/README.md)** for props, examples, theming and known limitations.

## Try it locally

Requires Node.js 22.18+ and pnpm 10 (`corepack enable` sets up pnpm).

```bash
pnpm install
pnpm playground        # builds the library and opens a preview at http://localhost:5173
```

The playground shows every component, with live controls for the mode, accent and corner presets.

## Repository layout

```
packages/react-toolkit/   the component library (@dawg-codes/react-toolkit)
apps/playground/          local preview app that uses the built library
docs/screenshots/         images used in this README
tooling/                  repository checks
```

## Scripts

| Command              | What it does                                                                   |
| -------------------- | ------------------------------------------------------------------------------ |
| `pnpm check`         | Everything below, in order: what CI runs                                       |
| `pnpm lint`          | ESLint, including accessibility rules for JSX                                  |
| `pnpm format:check`  | Prettier                                                                       |
| `pnpm typecheck`     | TypeScript (strict)                                                            |
| `pnpm test`          | Unit, accessibility and colour-contrast tests (Vitest)                         |
| `pnpm build`         | Builds the library into `packages/react-toolkit/dist`                          |
| `pnpm check:package` | Checks the package's exports and types for every module system (publint, attw) |
| `pnpm leak-guard`    | Fails if a file contains a blocked term                                        |
| `pnpm playground`    | Runs the preview app                                                           |

### Adding a component

1. Create `packages/react-toolkit/src/components/<name>/` with the component, `index.ts`, `<name>.css` (wrapped in `@layer dawg.components`) and tests.
2. Export it from `packages/react-toolkit/src/index.ts`.
3. Run `pnpm --filter @dawg-codes/react-toolkit sync-exports` to update the package's entry points.
4. Run `pnpm check`.

## License

[MIT](LICENSE) © 2026 Dawg Codes
