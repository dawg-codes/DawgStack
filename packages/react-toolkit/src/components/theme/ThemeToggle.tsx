import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import type { ThemeMode } from './define-theme';
import { useTheme } from './ThemeProvider';

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  focusable: false,
};

const ICONS: Record<ThemeMode, ReactNode> = {
  light: (
    <svg {...svg}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg {...svg}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  ),
  system: (
    <svg {...svg}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

const DEFAULT_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export interface ThemeToggleProps extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** Accessible name of the group (not shown). Default `'Theme'`. */
  label?: string;
  /** Which choices to offer, in order. Default light, dark and system. */
  options?: readonly ThemeMode[];
  /** Text for each choice, e.g. for translations. */
  labels?: Partial<Record<ThemeMode, string>>;
  /** Show icons only; the text is still read by screen readers and shown as a tooltip. */
  hideLabels?: boolean;
  /** Default `md`. */
  size?: 'sm' | 'md';
}

/**
 * Lets users choose light, dark or system mode. Built from native radio buttons, so arrow keys
 * and screen readers work as expected. Must be used inside a ThemeProvider.
 */
export const ThemeToggle = forwardRef<HTMLFieldSetElement, ThemeToggleProps>(function ThemeToggle(
  {
    label = 'Theme',
    options = ['light', 'dark', 'system'],
    labels,
    hideLabels = false,
    size = 'md',
    className,
    ...rest
  },
  ref,
) {
  const { mode, setMode } = useTheme();
  const name = useId();
  return (
    <fieldset
      {...rest}
      ref={ref}
      className={cx('dawg-theme-toggle', className)}
      data-size={size}
      data-hide-labels={hideLabels || undefined}
    >
      <legend className="dawg-visually-hidden">{label}</legend>
      {options.map((option) => {
        const text = labels?.[option] ?? DEFAULT_LABELS[option];
        return (
          <label
            key={option}
            className="dawg-theme-toggle__option"
            title={hideLabels ? text : undefined}
          >
            <input
              type="radio"
              className="dawg-theme-toggle__input"
              name={name}
              value={option}
              checked={mode === option}
              onChange={() => setMode(option)}
            />
            <span className="dawg-theme-toggle__box">
              <span className="dawg-theme-toggle__icon" aria-hidden="true">
                {ICONS[option]}
              </span>
              <span className={hideLabels ? 'dawg-visually-hidden' : undefined}>{text}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
});
