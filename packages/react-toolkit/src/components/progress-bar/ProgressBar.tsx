import { forwardRef, useId, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ProgressBarTone = 'primary' | 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Current value from 0 to `max`. Leave undefined (or null) for an indeterminate bar. */
  value?: number | null;
  /** Default 100. */
  max?: number;
  /**
   * Visible label, also used as the accessible name. Without it, pass `aria-label`
   * (or `aria-labelledby`) so screen readers can name the bar.
   */
  label?: ReactNode;
  /** Show the formatted value next to the label. */
  showValue?: boolean;
  /** Text for the value, shown and announced. Default: a rounded percentage, e.g. "42%". */
  formatValue?: (value: number, max: number) => string;
  /** Fill colour. Default `primary`. */
  tone?: ProgressBarTone;
  /** Bar thickness. Default `md`. */
  size?: ProgressBarSize;
  /**
   * `progressbar` (default): progress of a task. `meter`: a measurement within a known range,
   * such as storage used or seats taken (never indeterminate).
   */
  semantics?: 'progressbar' | 'meter';
}

const percent = (value: number, max: number) => `${Math.round((value / max) * 100)}%`;

/** A horizontal bar showing progress or a measurement. */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    value,
    max = 100,
    label,
    showValue = false,
    formatValue = percent,
    tone = 'primary',
    size = 'md',
    semantics = 'progressbar',
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  },
  ref,
) {
  const labelId = `${useId()}-label`;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const hasValue = typeof value === 'number' && Number.isFinite(value);
  const indeterminate = semantics === 'progressbar' && !hasValue;
  const current = hasValue ? Math.min(Math.max(value, 0), safeMax) : 0;
  const valueText = indeterminate ? undefined : formatValue(current, safeMax);
  const hasLabel = label !== undefined && label !== null && label !== false;

  return (
    <div
      {...rest}
      ref={ref}
      className={cx('dawg-progress', className)}
      data-tone={tone}
      data-size={size}
      data-indeterminate={indeterminate || undefined}
    >
      {(hasLabel || (showValue && valueText)) && (
        <div className="dawg-progress__header">
          {hasLabel && (
            <span id={labelId} className="dawg-progress__label">
              {label}
            </span>
          )}
          {showValue && valueText && (
            <span className="dawg-progress__value" aria-hidden="true">
              {valueText}
            </span>
          )}
        </div>
      )}
      <div
        className="dawg-progress__track"
        role={semantics}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (hasLabel ? labelId : undefined)}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : current}
        aria-valuetext={valueText}
      >
        <div
          className="dawg-progress__fill"
          style={{ '--_value': current / safeMax } as CSSProperties}
        />
      </div>
    </div>
  );
});
