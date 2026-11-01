// @vitest-environment node
// Checks the design tokens themselves: both themes meet WCAG contrast targets, and the two
// copies of the dark palette (data-dawg-theme="dark" and "system" + OS dark) never drift apart.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const css = readFileSync(fileURLToPath(new URL('../src/styles/core.css', import.meta.url)), 'utf8');

function block(re: RegExp): Record<string, string> {
  const body = css.match(re)?.[1];
  if (!body) throw new Error(`token block not found: ${re}`);
  const vars: Record<string, string> = {};
  for (const m of body.matchAll(/(--dawg-[\w-]+):\s*([^;]+);/g)) {
    vars[m[1]!] = m[2]!.replace(/\s+/g, ' ').trim();
  }
  return vars;
}

const light = block(
  /:root,\s*\[data-dawg-theme='light'\],\s*\[data-dawg-theme='system'\]\s*\{([^}]*)\}/,
);
const dark = block(/\n {2}\[data-dawg-theme='dark'\]\s*\{([^}]*)\}/);
const systemDark = block(
  /@media \(prefers-color-scheme: dark\)\s*\{\s*\[data-dawg-theme='system'\]\s*\{([^}]*)\}/,
);

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

function contrast(
  theme: Record<string, string>,
  fg: string,
  bg: string,
  base = '--dawg-color-surface',
) {
  const get = (name: string) => {
    const v = theme[name];
    if (!v) throw new Error(`missing token ${name}`);
    return parseColor(v);
  };
  const baseColor = get(base);
  const background = over(get(bg), baseColor);
  const foreground = over(get(fg), background);
  const [l1, l2] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (l1! + 0.05) / (l2! + 0.05);
}

const TONES = ['primary', 'neutral', 'info', 'success', 'warning', 'danger'];
const c = (name: string) => `--dawg-color-${name}`;

// [foreground, background, minimum ratio, base the background is painted on]
const PAIRS: Array<[string, string, number, string?]> = [
  // Text: WCAG 1.4.3 (4.5:1)
  [c('text'), c('bg'), 4.5],
  [c('text'), c('surface'), 4.5],
  [c('text'), c('surface-muted'), 4.5],
  [c('text'), c('surface-strong'), 4.5],
  [c('text-muted'), c('bg'), 4.5],
  [c('text-muted'), c('surface'), 4.5],
  [c('text-muted'), c('surface-muted'), 4.5],
  [c('text-subtle'), c('bg'), 4.5],
  [c('text-subtle'), c('surface'), 4.5],
  ...TONES.flatMap((t): Array<[string, string, number, string?]> => [
    [c(t), c('surface'), 4.5],
    [c(t), c('bg'), 4.5, c('bg')],
    [c(t), c(`${t}-soft`), 4.5],
    [c(t), c(`${t}-soft`), 4.5, c('bg')],
    [c(`${t}-on-solid`), c(`${t}-solid`), 4.5],
    [c(`${t}-on-solid`), c(`${t}-solid-hover`), 4.5],
    // Graphics (progress fills) against their track: WCAG 1.4.11 (3:1)
    [c(t), c('track'), 3],
  ]),
  // Focus indicator against page and surface: WCAG 1.4.11 (3:1)
  [c('focus-ring'), c('bg'), 3, c('bg')],
  [c('focus-ring'), c('surface'), 3],
];

describe('design tokens', () => {
  it('keeps the dark palette identical for data-dawg-theme="dark" and "system"', () => {
    expect(Object.keys(dark).length).toBeGreaterThan(30);
    expect(systemDark).toEqual(dark);
  });

  it('defines the same colour tokens in light and dark', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  for (const [name, theme] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    it.each(PAIRS)(`${name}: %s on %s meets %s:1`, (fg, bg, min, base) => {
      expect(contrast(theme, fg, bg, base)).toBeGreaterThanOrEqual(min);
    });
  }
});
