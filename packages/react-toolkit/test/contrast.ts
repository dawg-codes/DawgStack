// Shared WCAG contrast helpers for the token and preset tests (Node only).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type TokenMap = Record<string, string>;

const css = readFileSync(fileURLToPath(new URL('../src/styles/core.css', import.meta.url)), 'utf8');

function block(re: RegExp): TokenMap {
  const body = css.match(re)?.[1];
  if (!body) throw new Error(`token block not found: ${re}`);
  const vars: TokenMap = {};
  for (const m of body.matchAll(/(--dawg-[\w-]+):\s*([^;]+);/g)) {
    vars[m[1]!] = m[2]!.replace(/\s+/g, ' ').trim();
  }
  return vars;
}

/** Colour tokens from core.css: light, dark, and the dark copy used for "system". */
export const coreTokens = {
  light: block(
    /:root,\s*\[data-dawg-theme='light'\],\s*\[data-dawg-theme='system'\]\s*\{([^}]*)\}/,
  ),
  dark: block(/\n {2}\[data-dawg-theme='dark'\]\s*\{([^}]*)\}/),
  systemDark: block(
    /@media \(prefers-color-scheme: dark\)\s*\{\s*\[data-dawg-theme='system'\]\s*\{([^}]*)\}/,
  ),
};

type RGBA = [number, number, number, number];

function parseColor(value: string): RGBA {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const rgb = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] ? Number(rgb[4]) : 1];
  throw new Error(`unsupported colour: ${value}`);
}

/** Paints a possibly translucent colour over an opaque base. */
function over([r, g, b, a]: RGBA, [br, bg, bb]: RGBA): RGBA {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio of `fg` on `bg`, with `bg` painted on `base` (for translucent colours). */
export function contrast(theme: TokenMap, fg: string, bg: string, base = '--dawg-color-surface') {
  const get = (name: string) => {
    const v = theme[name];
    if (!v) throw new Error(`missing token ${name}`);
    return parseColor(v);
  };
  const background = over(get(bg), get(base));
  const foreground = over(get(fg), background);
  const [l1, l2] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (l1! + 0.05) / (l2! + 0.05);
}

export type Pair = [fg: string, bg: string, min: number, base?: string];

const c = (name: string) => `--dawg-color-${name}`;

/** Pairs that involve one tone; used for every tone in core.css and for each accent preset. */
export function tonePairs(tone: string): Pair[] {
  return [
    // Text: WCAG 1.4.3 (4.5:1)
    [c(tone), c('surface'), 4.5],
    [c(tone), c('bg'), 4.5, c('bg')],
    [c(tone), c(`${tone}-soft`), 4.5],
    [c(tone), c(`${tone}-soft`), 4.5, c('bg')],
    [c(`${tone}-on-solid`), c(`${tone}-solid`), 4.5],
    [c(`${tone}-on-solid`), c(`${tone}-solid-hover`), 4.5],
    // Graphics against what they sit on: WCAG 1.4.11 (3:1)
    [c(tone), c('track'), 3], // progress fills
  ];
}

/** Focus indicator and selected-state ring (ThemeToggle) contrast: WCAG 1.4.11 (3:1). */
export const indicatorPairs: Pair[] = [
  [c('focus-ring'), c('bg'), 3, c('bg')],
  [c('focus-ring'), c('surface'), 3],
  [c('primary'), c('surface-muted'), 3],
];

export const neutralTextPairs: Pair[] = [
  [c('text'), c('bg'), 4.5],
  [c('text'), c('surface'), 4.5],
  [c('text'), c('surface-muted'), 4.5],
  [c('text'), c('surface-strong'), 4.5],
  [c('text-muted'), c('bg'), 4.5],
  [c('text-muted'), c('surface'), 4.5],
  [c('text-muted'), c('surface-muted'), 4.5],
  [c('text-subtle'), c('bg'), 4.5],
  [c('text-subtle'), c('surface'), 4.5],
];

/** Form controls: their boundaries and the switch thumb must stand out (WCAG 1.4.11, 3:1). */
export const controlPairs: Pair[] = [
  [c('border-input'), c('surface'), 3],
  [c('border-input'), c('bg'), 3, c('bg')],
  [c('border-input'), c('surface-muted'), 3],
  [c('text-muted'), c('surface-strong'), 3], // switch thumb on its "off" track
];

/** Text on selected table rows (tinted with the accent): body text and muted text. */
export const selectionPairs: Pair[] = [
  [c('text'), c('primary-soft'), 4.5],
  [c('text-muted'), c('primary-soft'), 4.5],
];
