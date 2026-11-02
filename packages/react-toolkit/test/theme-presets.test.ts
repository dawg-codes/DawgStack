// @vitest-environment node
// Every accent preset must meet the same WCAG targets as the default palette, in both modes,
// and the token list used for typed themes must match what the CSS actually defines.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { themeToCssVars } from '../src/components/theme/define-theme';
import { accentPresets, shapePresets } from '../src/components/theme/presets';
import { COMPONENT_TOKENS, DESIGN_TOKENS } from '../src/components/theme/tokens';
import { contrast, coreTokens, indicatorPairs, tonePairs } from './contrast';

const PAIRS = [...tonePairs('primary'), ...indicatorPairs];

describe('accent presets', () => {
  for (const [name, preset] of Object.entries(accentPresets)) {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = { ...coreTokens[mode], ...themeToCssVars(preset, mode) };
      it.each(PAIRS)(`${name} (${mode}): %s on %s meets %s:1`, (fg, bg, min, base) => {
        expect(contrast(tokens, fg, bg, base)).toBeGreaterThanOrEqual(min);
      });
    }
  }

  it('set the same tokens in light and dark mode', () => {
    for (const preset of Object.values(accentPresets)) {
      expect(Object.keys(preset.dark).sort()).toEqual(Object.keys(preset.light).sort());
    }
  });
});

describe('shape presets', () => {
  it('only change shape tokens', () => {
    for (const preset of Object.values(shapePresets)) {
      for (const name of Object.keys(preset.tokens)) expect(name).toMatch(/radius/);
      expect(preset.light).toEqual({});
      expect(preset.dark).toEqual({});
    }
  });
});

describe('theme token list', () => {
  const root = fileURLToPath(new URL('../src/', import.meta.url));

  it('matches the tokens defined in core.css', () => {
    const css = readFileSync(`${root}styles/core.css`, 'utf8');
    const defined = [...new Set([...css.matchAll(/--dawg-([a-z0-9-]+):/g)].map((m) => m[1]))];
    expect([...DESIGN_TOKENS].sort()).toEqual(defined.sort());
  });

  it('matches the per-component hooks used in component styles', () => {
    const hooks = new Set<string>();
    for (const dir of readdirSync(`${root}components`)) {
      for (const file of readdirSync(`${root}components/${dir}`).filter((f) =>
        f.endsWith('.css'),
      )) {
        const css = readFileSync(`${root}components/${dir}/${file}`, 'utf8');
        for (const m of css.matchAll(/var\(--dawg-([a-z0-9-]+),/g)) hooks.add(m[1]!);
      }
    }
    for (const token of DESIGN_TOKENS) hooks.delete(token);
    expect([...COMPONENT_TOKENS].sort()).toEqual([...hooks].sort());
  });
});
