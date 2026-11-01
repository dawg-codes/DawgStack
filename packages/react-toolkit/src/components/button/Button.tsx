import { forwardRef, type ButtonHTMLAttributes, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  /** Visual style. Default `secondary`; use `primary` for the main action in a view. */
  variant?: ButtonVariant;
  /** Height and text size. Default `md`. */
  size?: ButtonSize;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
  /** Square button for a single icon. Give it an `aria-label`. */
  iconOnly?: boolean;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  /**
   * Shows a spinner and ignores clicks. The button stays focusable and keeps its accessible
   * name (it is marked `aria-busy` and `aria-disabled`), so keyboard users don't lose their place.
   */
  loading?: boolean;
  /** Icon before the label (hidden from assistive technology). */
  startIcon?: ReactNode;
  /** Icon after the label (hidden from assistive technology). */
  endIcon?: ReactNode;
}

/**
 * Class name and data attributes that give any element the button look, e.g. a router link:
 * `<Link to="/new" {...buttonStyleProps({ variant: 'primary' })}>New</Link>`.
 */
export function buttonStyleProps({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
}: ButtonStyleOptions = {}) {
  return {
    className: 'dawg-button',
    'data-variant': variant,
    'data-size': size,
    'data-full-width': fullWidth || undefined,
    'data-icon-only': iconOnly || undefined,
  };
}

/** A button with variants, sizes, icons and a loading state. Defaults to `type="button"`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    fullWidth,
    iconOnly,
    loading = false,
    startIcon,
    endIcon,
    type = 'button',
    className,
    onClick,
    children,
    'aria-disabled': ariaDisabled,
    ...rest
  },
  ref,
) {
  const blocked = loading || ariaDisabled === true || ariaDisabled === 'true';
  const style = buttonStyleProps({ variant, size, fullWidth, iconOnly });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      // Also cancels form submission when this is a submit button.
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      {...style}
      ref={ref}
      type={type}
      className={cx(style.className, className)}
      data-loading={loading || undefined}
      aria-disabled={blocked || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading && <span className="dawg-button__spinner" aria-hidden="true" />}
      <span className="dawg-button__content">
        {startIcon && (
          <span className="dawg-button__icon" aria-hidden="true">
            {startIcon}
          </span>
        )}
        {iconOnly ? children : <span className="dawg-button__label">{children}</span>}
        {endIcon && (
          <span className="dawg-button__icon" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </span>
    </button>
  );
});
