import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type BadgeTone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'soft' | 'solid' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Colour meaning. Default `neutral`. Always pair colour with a clear text label. */
  tone?: BadgeTone;
  /** `soft` (default): tinted background. `solid`: filled. `outline`: border only. */
  variant?: BadgeVariant;
  /** Default `md`. */
  size?: BadgeSize;
  /** Icon before the label (hidden from assistive technology). */
  icon?: ReactNode;
  /** Small dot before the label; `'pulse'` animates it (still when reduced motion is on). */
  dot?: boolean | 'pulse';
}

/** A short status or category label. Long labels are truncated with an ellipsis. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    tone = 'neutral',
    variant = 'soft',
    size = 'md',
    icon,
    dot = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <span
      {...rest}
      ref={ref}
      className={cx('dawg-badge', className)}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
    >
      {dot && (
        <span
          className="dawg-badge__dot"
          data-pulse={dot === 'pulse' || undefined}
          aria-hidden="true"
        />
      )}
      {icon && (
        <span className="dawg-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="dawg-badge__label">{children}</span>
    </span>
  );
});
