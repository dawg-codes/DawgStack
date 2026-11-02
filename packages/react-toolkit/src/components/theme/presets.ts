import { defineTheme, type DawgTheme } from './define-theme';

// Ready-made theme modules. Accents change the primary colour; shapes change corner radii.
// Combine one of each with mergeThemes(). Every accent meets WCAG AA in light and dark mode
// (checked by test/theme-presets.test.ts).

/** The default palette (core.css), as an empty theme so it can be selected like the others. */
const indigo = defineTheme({});

const teal = defineTheme({
  light: {
    'color-primary': '#0f766e',
    'color-primary-soft': '#ccfbf1',
    'color-primary-border': '#99f6e4',
    'color-primary-solid': '#0f766e',
    'color-primary-solid-hover': '#115e59',
    'color-primary-on-solid': '#ffffff',
    'color-focus-ring': '#0f766e',
  },
  dark: {
    'color-primary': '#5eead4',
    'color-primary-soft': 'rgb(20 184 166 / 0.16)',
    'color-primary-border': 'rgb(45 212 191 / 0.34)',
    'color-primary-solid': '#0f766e',
    'color-primary-solid-hover': '#115e59',
    'color-primary-on-solid': '#ffffff',
    'color-focus-ring': '#5eead4',
  },
});

// Pink rather than a red: a red accent would look like the danger tone (destructive actions).
const pink = defineTheme({
  light: {
    'color-primary': '#be185d',
    'color-primary-soft': '#fce7f3',
    'color-primary-border': '#fbcfe8',
    'color-primary-solid': '#be185d',
    'color-primary-solid-hover': '#9d174d',
    'color-primary-on-solid': '#ffffff',
    'color-focus-ring': '#be185d',
  },
  dark: {
    'color-primary': '#f9a8d4',
    'color-primary-soft': 'rgb(236 72 153 / 0.16)',
    'color-primary-border': 'rgb(244 114 182 / 0.34)',
    'color-primary-solid': '#be185d',
    'color-primary-solid-hover': '#9d174d',
    'color-primary-on-solid': '#ffffff',
    'color-focus-ring': '#f9a8d4',
  },
});

/** Monochrome: near-black accents in light mode, near-white in dark mode. */
const graphite = defineTheme({
  light: {
    'color-primary': '#27272a',
    'color-primary-soft': '#f4f4f5',
    'color-primary-border': '#d4d4d8',
    'color-primary-solid': '#18181b',
    'color-primary-solid-hover': '#3f3f46',
    'color-primary-on-solid': '#ffffff',
    'color-focus-ring': '#18181b',
  },
  dark: {
    'color-primary': '#e4e4e7',
    'color-primary-soft': 'rgb(228 228 231 / 0.12)',
    'color-primary-border': 'rgb(228 228 231 / 0.28)',
    'color-primary-solid': '#fafafa',
    'color-primary-solid-hover': '#e4e4e7',
    'color-primary-on-solid': '#18181b',
    'color-focus-ring': '#e4e4e7',
  },
});

export type AccentPresetName = 'indigo' | 'teal' | 'pink' | 'graphite';

/** Colour modules: `mergeThemes(accentPresets.teal, shapePresets.round)`. */
export const accentPresets: Readonly<Record<AccentPresetName, DawgTheme>> = Object.freeze({
  indigo,
  teal,
  pink,
  graphite,
});

export type ShapePresetName = 'sharp' | 'default' | 'round';

/** Corner-radius modules. `round` also makes buttons pill-shaped. */
export const shapePresets: Readonly<Record<ShapePresetName, DawgTheme>> = Object.freeze({
  sharp: defineTheme({
    tokens: {
      'radius-xs': '0.125rem',
      'radius-sm': '0.125rem',
      'radius-md': '0.125rem',
      'radius-lg': '0.25rem',
      'radius-xl': '0.25rem',
      'badge-radius': '0.125rem',
    },
  }),
  default: defineTheme({}),
  round: defineTheme({
    tokens: {
      'radius-sm': '0.5rem',
      'radius-md': '0.75rem',
      'radius-lg': '1.25rem',
      'radius-xl': '1.5rem',
      'button-radius': '9999px',
    },
  }),
});
