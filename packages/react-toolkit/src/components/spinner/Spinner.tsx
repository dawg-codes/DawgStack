import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Visual size. Default `md`. */
  size?: SpinnerSize;
  /**
   * Text announced by screen readers, e.g. "Loading results". Without a label the spinner is
   * decorative and hidden from assistive technology (use that when nearby text already says
   * something is loading).
   */
  label?: string;
  /** Also show the label next to the spinner. Default `false` (screen readers only). */
  showLabel?: boolean;
}

/** An indeterminate loading indicator. Inherits the current text colour. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = 'md', label, showLabel = false, className, ...rest },
  ref,
) {
  const a11y = label ? { role: 'status' } : { 'aria-hidden': true as const };
  return (
    <span ref={ref} className={cx('dawg-spinner', className)} data-size={size} {...a11y} {...rest}>
      <span className="dawg-spinner__circle" aria-hidden="true" />
      {label && (
        <span className={showLabel ? 'dawg-spinner__label' : 'dawg-visually-hidden'}>{label}</span>
      )}
    </span>
  );
});
