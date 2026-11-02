import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Illustration or icon (hidden from assistive technology). */
  icon?: ReactNode;
  /** Short headline, e.g. "No projects yet". */
  title: ReactNode;
  /** One or two sentences explaining what to do next. */
  description?: ReactNode;
  /** Buttons or links, e.g. a primary "Create project" button. */
  action?: ReactNode;
  /** Heading level for the title so it fits your page outline. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** `sm` for use inside cards, tables and panels. Default `md`. */
  size?: 'sm' | 'md';
  /** Default `center`. */
  align?: 'center' | 'start';
}

/** Explains why an area has no content and what the user can do about it. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  {
    icon,
    title,
    description,
    action,
    headingLevel = 3,
    size = 'md',
    align = 'center',
    className,
    children,
    ...rest
  },
  ref,
) {
  const Heading = `h${headingLevel}` as 'h3';
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('dawg-empty-state', className)}
      data-size={size}
      data-align={align}
    >
      {icon && (
        <div className="dawg-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading className="dawg-empty-state__title">{title}</Heading>
      {description && <p className="dawg-empty-state__description">{description}</p>}
      {children}
      {action && <div className="dawg-empty-state__actions">{action}</div>}
    </div>
  );
});
