# DawgStack

**Build once. Stack smarter.**

DawgStack is an open-source React toolkit by Dawg Codes: reusable UI components, design tokens and developer utilities that help you build modern React applications without re-implementing the same basics in every project.

> **Status: early development.** Phase 1 (design tokens and basic components) is in progress. Nothing is published to npm yet, and the API may change before the first release.

## What's included

The [`@dawg-codes/react-toolkit`](packages/react-toolkit) package currently provides:

| Component             | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Button                | Five variants, three sizes, icons and an accessible loading state      |
| Card                  | Basic, bordered and elevated surfaces, plus accessible clickable cards |
| Badge and StatusBadge | Status and category labels; typed mapping from your own status values  |
| Avatar                | Image with automatic fallback to initials, then an icon                |
| Divider               | Horizontal, vertical and labelled separators                           |
| Spinner               | Loading indicator with an optional screen-reader label                 |
| Skeleton              | Text, block and circle loading placeholders                            |
| ProgressBar           | Determinate, indeterminate and meter-style bars                        |
| EmptyState            | "Nothing here yet" panels with an icon, explanation and actions        |
| VisuallyHidden        | Text for screen readers only                                           |

All of them share design tokens with light, dark and system themes. **See the [component documentation](packages/react-toolkit/README.md)** for props, examples, theming and known limitations.

### Principles

- **React is the only peer dependency** (18.2+ or 19), and there are no runtime dependencies.
- **Plain CSS and design tokens.** No Tailwind or CSS-in-JS required. Styles sit in cascade layers so your own CSS always wins.
- **Accessible by default.** Semantic HTML and correct ARIA, and every component is tested with axe-core. Colour contrast is tested for both themes.
- **Works anywhere.** ESM and CommonJS builds with TypeScript types, safe for server rendering, with one entry point per component.

## Try it locally

Requires Node.js 22.18+ and pnpm 10 (`corepack enable` sets up pnpm).

```bash
pnpm install
pnpm playground        # builds the library and opens a preview at http://localhost:5173
```

The playground shows every component in light, dark and system themes.

## Repository layout

```
packages/react-toolkit/   the component library (@dawg-codes/react-toolkit)
apps/playground/          local preview app that uses the built library
tooling/                  repository checks
```

## Scripts

| Command              | What it does                                                                   |
| -------------------- | ------------------------------------------------------------------------------ |
| `pnpm check`         | Everything below, in order: what CI runs                                       |
| `pnpm lint`          | ESLint, including accessibility rules for JSX                                  |
| `pnpm format:check`  | Prettier                                                                       |
| `pnpm typecheck`     | TypeScript (strict)                                                            |
| `pnpm test`          | Unit, accessibility and design-token contrast tests (Vitest)                   |
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
