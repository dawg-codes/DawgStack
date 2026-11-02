import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

export interface AuthLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The page heading, e.g. "Sign in". */
  title: ReactNode;
  /** Short text under the title. */
  description?: ReactNode;
  /** Logo and app name above the title. */
  brand?: ReactNode;
  /** Content in the top corner, e.g. a ThemeToggle. */
  actions?: ReactNode;
  /** Content under the form, e.g. "No account? Create one". */
  footer?: ReactNode;
  /** A side panel shown next to the form on wide screens, e.g. a product message or image. */
  aside?: ReactNode;
  /** The form. */
  children?: ReactNode;
}

/**
 * A full-page layout for sign-in, sign-up and password reset screens: a centred panel with
 * the brand, a heading and the form, and an optional side panel on wide screens.
 */
export const AuthLayout = forwardRef<HTMLDivElement, AuthLayoutProps>(function AuthLayout(
  { title, description, brand, actions, footer, aside, children, className, ...rest },
  ref,
) {
  return (
    <div
      {...rest}
      ref={ref}
      className={cx('dawg-auth', className)}
      data-has-aside={aside != null || undefined}
    >
      {/* A header (banner landmark), so the controls in it are inside a landmark. */}
      {actions && <header className="dawg-auth__actions">{actions}</header>}
      <main className="dawg-auth__main">
        <div className="dawg-auth__panel">
          {brand && <div className="dawg-auth__brand">{brand}</div>}
          <div className="dawg-auth__heading">
            <h1 className="dawg-auth__title">{title}</h1>
            {description && <p className="dawg-auth__description">{description}</p>}
          </div>
          {children}
          {footer && <div className="dawg-auth__footer">{footer}</div>}
        </div>
      </main>
      {aside != null && <aside className="dawg-auth__aside">{aside}</aside>}
    </div>
  );
});
