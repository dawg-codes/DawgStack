import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cx } from '../../utils/cx';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Default `horizontal`. A vertical divider stretches to the height of its flex row. */
  orientation?: DividerOrientation;
  /**
   * Purely visual: hidden from assistive technology. Use when the divider doesn't separate
   * distinct sections (e.g. inside a toolbar that already groups its items).
   */
  decorative?: boolean;
  /** Short text in the middle of a horizontal divider, e.g. "or". It is read by screen readers. */
  label?: ReactNode;
  /** Space around the line. Default `md`. */
  spacing?: DividerSpacing;
}

/** A thin line that separates content. Horizontal dividers render an `<hr>`. */
export const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
  { orientation = 'horizontal', decorative = false, label, spacing = 'md', className, ...rest },
  ref,
) {
  const common = {
    className: cx('dawg-divider', className),
    'data-orientation': orientation,
    'data-spacing': spacing,
  };

  if (label !== undefined && label !== null && orientation === 'horizontal') {
    // A separator's content is hidden from screen readers, so a labelled divider is a plain
    // element whose text is read normally; the lines are drawn in CSS.
    return (
      <div
        {...rest}
        {...common}
        ref={ref as Ref<HTMLDivElement>}
        data-labelled=""
        aria-hidden={decorative || undefined}
      >
        <span className="dawg-divider__label">{label}</span>
      </div>
    );
  }

  if (decorative) {
    return <div {...rest} {...common} ref={ref as Ref<HTMLDivElement>} aria-hidden="true" />;
  }

  if (orientation === 'vertical') {
    return (
      <div
        {...rest}
        {...common}
        ref={ref as Ref<HTMLDivElement>}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  return <hr {...rest} {...common} ref={ref as Ref<HTMLHRElement>} />;
});
