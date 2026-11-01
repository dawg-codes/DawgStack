import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import { cssSize } from '../../utils/css-size';
import { cx } from '../../utils/cx';

export type SkeletonVariant = 'text' | 'rect' | 'circle';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** `rect` (default): a block. `text`: a line of text. `circle`: e.g. for an avatar. */
  variant?: SkeletonVariant;
  /** Number or CSS length. Default: full width (`circle`: 2.5rem). */
  width?: number | string;
  /** Number or CSS length. Default: 1rem (`text`: a text line; `circle`: same as width). */
  height?: number | string;
  /** For `text`: number of lines to draw. The last line is shorter. Default 1. */
  lines?: number;
  /** Shimmer animation (off automatically when the user prefers reduced motion). Default true. */
  animated?: boolean;
}

/**
 * A placeholder shown while content loads. Always hidden from assistive technology: mark the
 * loading region with `aria-busy="true"` and announce the loading state separately.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { variant = 'rect', width, height, lines = 1, animated = true, className, style, ...rest },
  ref,
) {
  const size = {
    '--_w': cssSize(width),
    '--_h': cssSize(height),
  } as CSSProperties;
  const shared = { 'data-animated': animated || undefined, 'aria-hidden': true as const };

  if (variant === 'text' && lines > 1) {
    return (
      <span
        {...rest}
        {...shared}
        ref={ref}
        className={cx('dawg-skeleton-group', className)}
        style={{ ...size, ...style }}
      >
        {Array.from({ length: lines }, (_, i) => (
          <span
            key={i}
            className="dawg-skeleton"
            data-variant="text"
            data-animated={animated || undefined}
            data-last={i === lines - 1 || undefined}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      {...rest}
      {...shared}
      ref={ref}
      className={cx('dawg-skeleton', className)}
      data-variant={variant}
      style={{ ...size, ...style }}
    />
  );
});
