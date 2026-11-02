import { COMPONENT_TOKENS, DESIGN_TOKENS, type ThemeTokens } from './tokens';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = 'light' | 'dark';

/** A set of token overrides: shared ones, plus ones for light or dark only. */
export interface ThemeDefinition {
  /** Applied in both light and dark mode (e.g. radius, font, spacing). */
  tokens?: ThemeTokens;
  /** Applied in light mode only (after `tokens`). */
  light?: ThemeTokens;
  /** Applied in dark mode only (after `tokens`). */
  dark?: ThemeTokens;
}

/** A theme created with `defineTheme` or `mergeThemes`. */
export interface DawgTheme {
  readonly tokens: Readonly<ThemeTokens>;
  readonly light: Readonly<ThemeTokens>;
  readonly dark: Readonly<ThemeTokens>;
}

const KNOWN = new Set<string>([...DESIGN_TOKENS, ...COMPONENT_TOKENS]);

function check(group: ThemeTokens | undefined): Readonly<ThemeTokens> {
  const out: ThemeTokens = {};
  for (const [name, value] of Object.entries(group ?? {})) {
    if (!KNOWN.has(name)) {
      throw new Error(
        `defineTheme: unknown token "${name}". Use names like "color-primary-solid".`,
      );
    }
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`defineTheme: token "${name}" needs a non-empty CSS value.`);
    }
    out[name as keyof ThemeTokens] = value;
  }
  return Object.freeze(out);
}

/**
 * Creates a theme from token overrides. Token names are typed and checked, so typos fail early:
 *
 * ```ts
 * const brand = defineTheme({
 *   tokens: { 'radius-md': '0.25rem' },
 *   light: { 'color-primary-solid': '#0f766e' },
 *   dark: { 'color-primary-solid': '#14b8a6' },
 * });
 * ```
 */
export function defineTheme(definition: ThemeDefinition): DawgTheme {
  return Object.freeze({
    tokens: check(definition.tokens),
    light: check(definition.light),
    dark: check(definition.dark),
  });
}

/** Combines themes; later themes win where they set the same token. */
export function mergeThemes(...themes: Array<DawgTheme | null | undefined>): DawgTheme {
  const merged = { tokens: {}, light: {}, dark: {} } as Record<keyof DawgTheme, ThemeTokens>;
  for (const theme of themes) {
    if (!theme) continue;
    Object.assign(merged.tokens, theme.tokens);
    Object.assign(merged.light, theme.light);
    Object.assign(merged.dark, theme.dark);
  }
  return defineTheme(merged);
}

/** The CSS custom properties a theme sets in one mode, e.g. `{ '--dawg-radius-md': '0.25rem' }`. */
export function themeToCssVars(theme: DawgTheme, mode: ResolvedThemeMode): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries({ ...theme.tokens, ...theme[mode] })) {
    if (value !== undefined) vars[`--dawg-${name}`] = value;
  }
  return vars;
}
