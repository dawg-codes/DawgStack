import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import {
  themeToCssVars,
  type DawgTheme,
  type ResolvedThemeMode,
  type ThemeMode,
} from './define-theme';
import { useBeforePaint } from '../../utils/use-before-paint';

// Theme changes are applied before the browser paints (useBeforePaint), so a switch never shows a
// frame of the old colours. On the server a plain effect is used, which React 18 doesn't warn about.

const DARK_QUERY = '(prefers-color-scheme: dark)';
const isMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

function subscribeToSystem(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
const systemPrefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(DARK_QUERY).matches;

/** Whether the operating system prefers dark mode. Always `false` during server rendering. */
export function useSystemPrefersDark(): boolean {
  return useSyncExternalStore(subscribeToSystem, systemPrefersDark, () => false);
}

function readStored(key: string | null): ThemeMode | null {
  if (!key) return null;
  try {
    const value = window.localStorage.getItem(key);
    return isMode(value) ? value : null;
  } catch {
    return null; // storage blocked (private mode, sandboxed iframe)
  }
}

// Saved choices are read through useSyncExternalStore: no extra render after mounting, no
// server/client mismatch, and "storage" events keep every open tab in step.
const storageListeners = new Set<() => void>();

function subscribeToStorage(onChange: () => void) {
  storageListeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    storageListeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

function writeStored(key: string | null, mode: ThemeMode) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, mode);
  } catch {
    return; // storage blocked: the in-memory choice is used until the page reloads
  }
  for (const notify of storageListeners) notify();
}

export interface ThemeContextValue {
  /** The chosen mode: `'light'`, `'dark'` or `'system'`. */
  mode: ThemeMode;
  /** What is actually showing: `'system'` resolved to `'light'` or `'dark'`. */
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** Switches between light and dark, based on what is showing now. */
  toggle: () => void;
  /** The custom theme applied by the provider, if any. */
  theme: DawgTheme | undefined;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Mode when the user hasn't chosen one yet. Default `'system'`. */
  defaultMode?: ThemeMode;
  /** Control the mode yourself (also pass `onModeChange`). Nothing is saved to storage then. */
  mode?: ThemeMode;
  /** Called whenever the mode is changed through the context or ThemeToggle. */
  onModeChange?: (mode: ThemeMode) => void;
  /** localStorage key for remembering the choice. `null` turns saving off. Default `'dawg-theme'`. */
  storageKey?: string | null;
  /** Token overrides from `defineTheme`, `mergeThemes` or the presets, applied to the page. */
  theme?: DawgTheme;
}

/**
 * Manages light, dark and system mode for the page (the `data-dawg-theme` attribute on `<html>`),
 * remembers the user's choice, follows the operating system in `'system'` mode, keeps tabs in
 * sync and applies an optional custom theme.
 */
export function ThemeProvider({
  children,
  defaultMode = 'system',
  mode: controlledMode,
  onModeChange,
  storageKey = 'dawg-theme',
  theme,
}: ThemeProviderProps) {
  const controlled = controlledMode !== undefined;
  // The saved choice (null while server rendering, when nothing is saved, or storage is blocked).
  const stored = useSyncExternalStore(
    subscribeToStorage,
    () => (controlled ? null : readStored(storageKey)),
    () => null,
  );
  // In-memory choice, used when storage is off or blocked.
  const [ownMode, setOwnMode] = useState<ThemeMode | null>(null);
  const mode = controlledMode ?? stored ?? ownMode ?? defaultMode;
  const systemDark = useSystemPrefersDark();
  const resolvedMode: ResolvedThemeMode =
    mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

  // The attribute is all CSS needs, including following the OS in "system" mode.
  useBeforePaint(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-dawg-theme');
    root.setAttribute('data-dawg-theme', mode);
    return () => {
      if (previous === null) root.removeAttribute('data-dawg-theme');
      else root.setAttribute('data-dawg-theme', previous);
    };
  }, [mode]);

  const vars = useMemo(
    () => (theme ? themeToCssVars(theme, resolvedMode) : null),
    [theme, resolvedMode],
  );
  useBeforePaint(() => {
    if (!vars) return;
    const style = document.documentElement.style;
    const previous = Object.keys(vars).map((name) => [name, style.getPropertyValue(name)] as const);
    for (const [name, value] of Object.entries(vars)) style.setProperty(name, value);
    return () => {
      for (const [name, value] of previous) {
        if (value) style.setProperty(name, value);
        else style.removeProperty(name);
      }
    };
  }, [vars]);

  const setMode = useCallback(
    (next: ThemeMode) => {
      if (!controlled) {
        setOwnMode(next);
        writeStored(storageKey, next);
      }
      onModeChange?.(next);
    },
    [controlled, storageKey, onModeChange],
  );
  const toggle = useCallback(
    () => setMode(resolvedMode === 'dark' ? 'light' : 'dark'),
    [resolvedMode, setMode],
  );

  const value = useMemo(
    () => ({ mode, resolvedMode, setMode, toggle, theme }),
    [mode, resolvedMode, setMode, toggle, theme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** The current theme mode and controls. Must be used inside a ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside a <ThemeProvider>.');
  return context;
}

export interface ThemeScopeProps extends HTMLAttributes<HTMLDivElement> {
  /** Mode for this part of the page. Default: inherit the surrounding mode. */
  mode?: ThemeMode;
  /** Token overrides for this part of the page only. */
  theme?: DawgTheme;
}

/**
 * Themes one part of the page, e.g. a dark sidebar in a light app or a brand-coloured preview.
 * Renders a `<div>`; give it a background (such as `var(--dawg-color-bg)`) if it needs one.
 */
export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(function ThemeScope(
  { mode, theme, style, ...rest },
  ref,
) {
  const context = useContext(ThemeContext);
  const systemDark = useSystemPrefersDark();
  const resolved: ResolvedThemeMode =
    mode === undefined
      ? (context?.resolvedMode ?? 'light')
      : mode === 'system'
        ? systemDark
          ? 'dark'
          : 'light'
        : mode;
  const vars = theme ? themeToCssVars(theme, resolved) : undefined;
  return <div {...rest} ref={ref} data-dawg-theme={mode} style={{ ...vars, ...style }} />;
});
