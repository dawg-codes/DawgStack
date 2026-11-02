import type { ThemeMode } from './define-theme';

export interface ThemeScriptOptions {
  /** localStorage key, the same one passed to ThemeProvider. Default `'dawg-theme'`. */
  storageKey?: string;
  /** Mode to use when nothing is stored. Default `'system'`. */
  defaultMode?: ThemeMode;
}

/**
 * JavaScript that applies the saved theme before the page paints, so a dark-mode user never
 * sees a flash of the light theme. Put it in a `<script>` at the start of `<body>` (or `<head>`):
 *
 * ```tsx
 * <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
 * ```
 *
 * With a strict Content Security Policy that forbids inline scripts, serve the returned code as a
 * small external file instead, or allow it with a CSP hash or nonce.
 */
export function getThemeScript({
  storageKey = 'dawg-theme',
  defaultMode = 'system',
}: ThemeScriptOptions = {}): string {
  return (
    '(function(){var m;' +
    `try{m=localStorage.getItem(${JSON.stringify(storageKey)})}catch(e){}` +
    `if(m!=="light"&&m!=="dark"&&m!=="system")m=${JSON.stringify(defaultMode)};` +
    'document.documentElement.setAttribute("data-dawg-theme",m)})()'
  );
}
