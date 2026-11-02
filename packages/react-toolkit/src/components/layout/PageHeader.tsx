import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page's main heading. */
  title: ReactNode;
  /** Short text under the title. */
  description?: ReactNode;
  /** Buttons for the page's main actions, e.g. "New project". They wrap under the title on phones. */
  actions?: ReactNode;
  /** Content above the title, such as breadcrumbs or a back link. */
  eyebrow?: ReactNode;
  /** Heading element. Default `h1`; there should be one per page. */
  titleAs?: 'h1' | 'h2';
}

/** The title area at the top of a page, with optional description and actions. */
export const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(function PageHeader(
  { title, description, actions, eyebrow, titleAs: Title = 'h1', className, ...rest },
  ref,
) {
  return (
    <div {...rest} ref={ref} className={cx('dawg-page-header', className)}>
      {eyebrow && <div className="dawg-page-header__eyebrow">{eyebrow}</div>}
      <div className="dawg-page-header__row">
        <div className="dawg-page-header__text">
          <Title className="dawg-page-header__title">{title}</Title>
          {description && <p className="dawg-page-header__description">{description}</p>}
        </div>
        {actions && <div className="dawg-page-header__actions">{actions}</div>}
      </div>
    </div>
  );
});
