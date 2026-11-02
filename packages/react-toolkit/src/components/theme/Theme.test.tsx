import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { setSystemDark } from '../../../test/media';
import { defineTheme, mergeThemes, themeToCssVars } from './define-theme';
import { getThemeScript } from './script';
import { ThemeProvider, ThemeScope, useTheme, type ThemeProviderProps } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

const html = () => document.documentElement;
const wrapper =
  (props: Omit<ThemeProviderProps, 'children'> = {}) =>
  ({ children }: { children: ReactNode }) => <ThemeProvider {...props}>{children}</ThemeProvider>;

describe('ThemeProvider', () => {
  it('defaults to system mode and resolves it from the OS preference', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.mode).toBe('system');
    expect(result.current.resolvedMode).toBe('light');
    expect(html()).toHaveAttribute('data-dawg-theme', 'system');
    act(() => setSystemDark(true));
    expect(result.current.resolvedMode).toBe('dark');
  });

  it('restores the saved choice after mounting', () => {
    localStorage.setItem('dawg-theme', 'dark');
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.mode).toBe('dark');
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
  });

  it('ignores invalid saved values', () => {
    localStorage.setItem('dawg-theme', 'purple');
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper({ defaultMode: 'light' }) });
    expect(result.current.mode).toBe('light');
  });

  it('saves changes and reports them', () => {
    const onModeChange = vi.fn();
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper({ onModeChange }) });
    act(() => result.current.setMode('dark'));
    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('dawg-theme')).toBe('dark');
    expect(onModeChange).toHaveBeenCalledWith('dark');
  });

  it('uses a custom storage key, or none', () => {
    const custom = renderHook(() => useTheme(), { wrapper: wrapper({ storageKey: 'my-app' }) });
    act(() => custom.result.current.setMode('light'));
    expect(localStorage.getItem('my-app')).toBe('light');
    custom.unmount();
    localStorage.clear();
    const none = renderHook(() => useTheme(), { wrapper: wrapper({ storageKey: null }) });
    act(() => none.result.current.setMode('dark'));
    expect(localStorage.length).toBe(0);
    expect(none.result.current.mode).toBe('dark');
  });

  it('keeps working when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    act(() => result.current.setMode('dark'));
    expect(result.current.mode).toBe('dark');
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
  });

  it('can be controlled', () => {
    const onModeChange = vi.fn();
    const { result } = renderHook(() => useTheme(), {
      wrapper: wrapper({ mode: 'dark', onModeChange }),
    });
    act(() => result.current.setMode('light'));
    expect(onModeChange).toHaveBeenCalledWith('light');
    expect(result.current.mode).toBe('dark');
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
    expect(localStorage.length).toBe(0);
  });

  it('follows a choice made in another tab', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    // Another tab writes the shared storage; this tab then receives a "storage" event.
    act(() => {
      localStorage.setItem('dawg-theme', 'dark');
      window.dispatchEvent(new StorageEvent('storage', { key: 'dawg-theme', newValue: 'dark' }));
    });
    expect(result.current.mode).toBe('dark');
  });

  it('toggle() switches away from what is currently showing', () => {
    setSystemDark(true);
    const { result } = renderHook(() => useTheme(), { wrapper: wrapper() });
    expect(result.current.resolvedMode).toBe('dark');
    act(() => result.current.toggle());
    expect(result.current.mode).toBe('light');
    act(() => result.current.toggle());
    expect(result.current.mode).toBe('dark');
  });

  it('applies a custom theme for the showing mode and cleans up on unmount', () => {
    const theme = defineTheme({
      tokens: { 'radius-md': '2px' },
      light: { 'color-primary-solid': '#111111' },
      dark: { 'color-primary-solid': '#eeeeee' },
    });
    html().setAttribute('data-dawg-theme', 'light'); // e.g. set earlier by getThemeScript()
    const { result, unmount } = renderHook(() => useTheme(), {
      wrapper: wrapper({ theme, defaultMode: 'light' }),
    });
    const style = html().style;
    expect(style.getPropertyValue('--dawg-radius-md')).toBe('2px');
    expect(style.getPropertyValue('--dawg-color-primary-solid')).toBe('#111111');
    act(() => result.current.setMode('dark'));
    expect(style.getPropertyValue('--dawg-color-primary-solid')).toBe('#eeeeee');
    unmount();
    expect(style.getPropertyValue('--dawg-radius-md')).toBe('');
    expect(style.getPropertyValue('--dawg-color-primary-solid')).toBe('');
    expect(html()).toHaveAttribute('data-dawg-theme', 'light');
  });

  it('useTheme explains when the provider is missing', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow(/inside a <ThemeProvider>/);
  });
});

describe('ThemeScope', () => {
  const brand = defineTheme({
    light: { 'color-primary-solid': '#0f766e' },
    dark: { 'color-primary-solid': '#5eead4' },
  });

  it('themes only its own subtree', () => {
    render(
      <ThemeScope mode="dark" theme={brand} data-testid="scope">
        x
      </ThemeScope>,
    );
    const scope = screen.getByTestId('scope');
    expect(scope).toHaveAttribute('data-dawg-theme', 'dark');
    expect(scope.style.getPropertyValue('--dawg-color-primary-solid')).toBe('#5eead4');
    expect(html()).not.toHaveAttribute('data-dawg-theme');
  });

  it('inherits the surrounding mode when none is given', () => {
    render(
      <ThemeProvider defaultMode="dark">
        <ThemeScope theme={brand} data-testid="scope" />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId('scope');
    expect(scope).not.toHaveAttribute('data-dawg-theme');
    expect(scope.style.getPropertyValue('--dawg-color-primary-solid')).toBe('#5eead4');
  });
});

describe('ThemeToggle', () => {
  const renderToggle = (props: Parameters<typeof ThemeToggle>[0] = {}) =>
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggle {...props} />
      </ThemeProvider>,
    );

  it('is a named group of radio buttons reflecting the mode', () => {
    renderToggle();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('changes and saves the mode on click', async () => {
    renderToggle();
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
    expect(localStorage.getItem('dawg-theme')).toBe('dark');
  });

  it('groups its radios under one name, which gives native arrow-key navigation', () => {
    // jsdom can't simulate arrow keys between radios; the real-browser check covers the keys.
    renderToggle();
    const names = screen.getAllByRole('radio').map((r) => r.getAttribute('name'));
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
  });

  it('supports a subset of options, custom labels and icon-only display', () => {
    renderToggle({
      options: ['light', 'dark'],
      labels: { light: 'Clair', dark: 'Sombre' },
      label: 'Thème',
      hideLabels: true,
    });
    expect(screen.getByRole('group', { name: 'Thème' })).toHaveAttribute('data-hide-labels');
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeInTheDocument();
    expect(screen.getByText('Clair')).toHaveClass('dawg-visually-hidden');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderToggle();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('getThemeScript', () => {
  const run = (code: string) => new Function(code)();

  it('applies the saved mode before React loads', () => {
    localStorage.setItem('dawg-theme', 'dark');
    run(getThemeScript());
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
  });

  it('falls back to the default for missing or invalid values', () => {
    run(getThemeScript({ defaultMode: 'light' }));
    expect(html()).toHaveAttribute('data-dawg-theme', 'light');
    localStorage.setItem('x', '"><script>');
    run(getThemeScript({ storageKey: 'x' }));
    expect(html()).toHaveAttribute('data-dawg-theme', 'system');
  });

  it('safely embeds a custom storage key', () => {
    localStorage.setItem('a"b', 'dark');
    run(getThemeScript({ storageKey: 'a"b' }));
    expect(html()).toHaveAttribute('data-dawg-theme', 'dark');
  });
});

describe('defineTheme and mergeThemes', () => {
  it('rejects unknown tokens and empty values', () => {
    expect(() => defineTheme({ tokens: { 'radius-huge': '1px' } as never })).toThrow(/unknown/);
    expect(() => defineTheme({ light: { 'color-bg': ' ' } })).toThrow(/non-empty/);
  });

  it('merges themes with later ones winning', () => {
    const a = defineTheme({ tokens: { 'radius-md': '1px' }, dark: { 'color-bg': '#000000' } });
    const b = defineTheme({ tokens: { 'radius-md': '2px', 'button-radius': '9999px' } });
    const merged = mergeThemes(a, null, b);
    expect(merged.tokens).toEqual({ 'radius-md': '2px', 'button-radius': '9999px' });
    expect(merged.dark).toEqual({ 'color-bg': '#000000' });
    expect(Object.isFrozen(merged.tokens)).toBe(true);
  });

  it('turns a theme into CSS custom properties for one mode', () => {
    const theme = defineTheme({
      tokens: { 'radius-md': '1px', 'color-bg': '#ffffff' },
      dark: { 'color-bg': '#000000' },
    });
    expect(themeToCssVars(theme, 'dark')).toEqual({
      '--dawg-radius-md': '1px',
      '--dawg-color-bg': '#000000',
    });
    expect(themeToCssVars(theme, 'light')['--dawg-color-bg']).toBe('#ffffff');
  });
});
