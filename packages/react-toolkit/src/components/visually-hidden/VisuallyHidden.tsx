import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

/** Content that is hidden on screen but still read by screen readers. */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ className, ...rest }, ref) {
    return <span ref={ref} className={cx('dawg-visually-hidden', className)} {...rest} />;
  },
);
