import { accentPresets, mergeThemes, shapePresets } from '@dawg-codes/react-toolkit/theme';

/**
 * The app's look. Swap presets to restyle every component at once:
 *   accentPresets: indigo, teal, pink, graphite
 *   shapePresets:  sharp, default, round
 *
 * Or use your own brand colours (token names autocomplete; see the toolkit README):
 *
 *   import { defineTheme } from '@dawg-codes/react-toolkit/theme';
 *   const brand = defineTheme({
 *     light: { 'color-primary': '#0f766e', 'color-primary-solid': '#0f766e' },
 *     dark: { 'color-primary': '#5eead4', 'color-primary-solid': '#0f766e' },
 *   });
 *   export const theme = mergeThemes(brand, shapePresets.round);
 */
export const theme = mergeThemes(accentPresets.indigo, shapePresets.default);
