import {
  accentPresets,
  mergeThemes,
  shapePresets,
  type AccentPresetName,
} from '@dawg-codes/react-toolkit/theme';

/**
 * The app's look. People can switch the accent in Settings → Appearance; this is the default.
 *   accentPresets: indigo, teal, pink, graphite
 *   shapePresets:  sharp, default, round
 *
 * For your own brand colours, build the theme with defineTheme instead (token names
 * autocomplete; see the toolkit README) and remove the accent picker from Settings:
 *
 *   import { defineTheme } from '@dawg-codes/react-toolkit/theme';
 *   const brand = defineTheme({
 *     light: { 'color-primary': '#0f766e', 'color-primary-solid': '#0f766e' },
 *     dark: { 'color-primary': '#5eead4', 'color-primary-solid': '#0f766e' },
 *   });
 */
export const defaultAccent: AccentPresetName = 'indigo';
export const shape = shapePresets.default;

export const buildTheme = (accent: AccentPresetName) => mergeThemes(accentPresets[accent], shape);
