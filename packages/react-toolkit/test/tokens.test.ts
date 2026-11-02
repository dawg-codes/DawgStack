// @vitest-environment node
// Checks the design tokens themselves: both themes meet WCAG contrast targets, and the two
// copies of the dark palette (data-dawg-theme="dark" and "system" + OS dark) never drift apart.
import { describe, expect, it } from 'vitest';
import {
  contrast,
  coreTokens,
  controlPairs,
  indicatorPairs,
  selectionPairs,
  neutralTextPairs,
  tonePairs,
  type Pair,
} from './contrast';

const { light, dark, systemDark } = coreTokens;
const TONES = ['primary', 'neutral', 'info', 'success', 'warning', 'danger'];
const PAIRS: Pair[] = [
  ...neutralTextPairs,
  ...TONES.flatMap(tonePairs),
  ...indicatorPairs,
  ...controlPairs,
  ...selectionPairs,
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
