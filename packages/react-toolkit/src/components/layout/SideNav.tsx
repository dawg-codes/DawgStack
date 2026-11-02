import {
  forwardRef,
  useId,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { useAppShell } from './AppShell';

export interface NavItem {
  label: ReactNode;
  href: string;
  /** Decorative icon (hidden from assistive technology). Needed for MobileTabBar. */
  icon?: ReactNode;
  /** Small extra content after the label, e.g. a count. Give it text screen readers understand. */
  badge?: ReactNode;
  /** Marks the link as the current page. Or pass `currentHref` to the nav instead. */
  current?: boolean;
}

export interface NavSection {
  /** Short heading for a group of links. */
  title?: ReactNode;
  items: readonly NavItem[];
}

/** What a custom link component receives. Spread it onto your router's link. */
export interface NavLinkRenderProps {
  href: string;
  className: string;
  'aria-current'?: 'page';
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  children: ReactNode;
}

/**
 * Renders each link. The default is a plain `<a>`; for a router, map `href` to its prop:
 * `renderLink={({ href, ...props }) => <Link to={href} {...props} />}`.
 */
export type RenderNavLink = (props: NavLinkRenderProps) => ReactElement;

const defaultRenderLink: RenderNavLink = ({ children, ...props }) => <a {...props}>{children}</a>;

const isCurrent = (item: NavItem, currentHref?: string) =>
  item.current ?? (currentHref !== undefined && item.href === currentHref);

export interface SideNavProps extends HTMLAttributes<HTMLElement> {
  /** Links in one list. Use `sections` instead for headed groups. */
  items?: readonly NavItem[];
  /** Groups of links, each with an optional heading. */
  sections?: readonly NavSection[];
  /** The current page's href, to highlight its link (`aria-current="page"`). */
  currentHref?: string;
  /** Custom link component, e.g. for a router. */
  renderLink?: RenderNavLink;
  /** Accessible name of the navigation landmark. Default `'Main'`. */
  label?: string;
  /** Content above the links. */
  header?: ReactNode;
  /** Content below the links, e.g. the signed-in user. */
  footer?: ReactNode;
}

/**
 * Vertical navigation for an AppShell's sidebar. Inside the narrow-screen drawer, choosing a
 * link closes the drawer.
 */
export const SideNav = forwardRef<HTMLElement, SideNavProps>(function SideNav(
  {
    items,
    sections,
    currentHref,
    renderLink = defaultRenderLink,
    label = 'Main',
    header,
    footer,
    className,
    ...rest
  },
  ref,
) {
  const id = useId();
  const shell = useAppShell();
  const groups: readonly NavSection[] = sections ?? (items ? [{ items }] : []);

  return (
    <nav {...rest} ref={ref} aria-label={label} className={cx('dawg-side-nav', className)}>
      {header && <div className="dawg-side-nav__header">{header}</div>}
      <div className="dawg-side-nav__groups">
        {groups.map((group, g) => {
          const headingId = group.title ? `${id}-${g}` : undefined;
          return (
            <div key={g} className="dawg-side-nav__group">
              {group.title && (
                <div id={headingId} className="dawg-side-nav__heading">
                  {group.title}
                </div>
              )}
              <ul className="dawg-side-nav__list" aria-labelledby={headingId}>
                {group.items.map((item) => {
                  const current = isCurrent(item, currentHref);
                  return (
                    <li key={item.href}>
                      {renderLink({
                        href: item.href,
                        className: 'dawg-side-nav__link',
                        'aria-current': current ? 'page' : undefined,
                        onClick: shell?.navOpen ? shell.closeNav : undefined,
                        children: (
                          <>
                            {item.icon && (
                              <span className="dawg-side-nav__icon" aria-hidden="true">
                                {item.icon}
                              </span>
                            )}
                            <span className="dawg-side-nav__label">{item.label}</span>
                            {item.badge != null && (
                              <>
                                {' '}
                                <span className="dawg-side-nav__badge">{item.badge}</span>
                              </>
                            )}
                          </>
                        ),
                      })}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      {footer && <div className="dawg-side-nav__footer">{footer}</div>}
    </nav>
  );
});

export interface MobileTabBarProps extends HTMLAttributes<HTMLElement> {
  /** Up to five links, each with an `icon` and a short `label`. */
  items: readonly NavItem[];
  /** The current page's href (`aria-current="page"`). */
  currentHref?: string;
  /** Custom link component, e.g. for a router. */
  renderLink?: RenderNavLink;
  /** Accessible name of the navigation landmark. Default `'Primary'`. */
  label?: string;
}

/**
 * A bar of icon links fixed to the bottom of the screen on phones (narrower than 48rem);
 * hidden on wider screens. Pass it to AppShell's `tabBar`.
 */
export const MobileTabBar = forwardRef<HTMLElement, MobileTabBarProps>(function MobileTabBar(
  { items, currentHref, renderLink = defaultRenderLink, label = 'Primary', className, ...rest },
  ref,
) {
  return (
    <nav {...rest} ref={ref} aria-label={label} className={cx('dawg-tab-bar', className)}>
      <ul className="dawg-tab-bar__list">
        {items.map((item) => (
          <li key={item.href}>
            {renderLink({
              href: item.href,
              className: 'dawg-tab-bar__link',
              'aria-current': isCurrent(item, currentHref) ? 'page' : undefined,
              children: (
                <>
                  <span className="dawg-tab-bar__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="dawg-tab-bar__label">{item.label}</span>
                  {/* After the label, so it's read as "Inbox 2"; shown over the icon. */}
                  {item.badge != null && (
                    <>
                      {' '}
                      <span className="dawg-tab-bar__badge">{item.badge}</span>
                    </>
                  )}
                </>
              ),
            })}
          </li>
        ))}
      </ul>
    </nav>
  );
});
