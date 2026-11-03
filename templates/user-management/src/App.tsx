import { useEffect, useRef, type ReactNode } from 'react';
import { Avatar } from '@dawg-codes/react-toolkit';
import {
  AppHeader,
  AppShell,
  MobileTabBar,
  SideNav,
  type NavItem,
} from '@dawg-codes/react-toolkit/layout';
import { DropdownMenu } from '@dawg-codes/react-toolkit/menu';
import { ThemeToggle } from '@dawg-codes/react-toolkit/theme';
import { appConfig, type Page } from './app.config';
import { ShieldIcon, UserIcon, UsersIcon } from './components/icons';
import { Brand } from './components/parts';
import { sampleUsers } from './data/sample';
import { Roles } from './pages/Roles';
import { Users } from './pages/Users';
import { href, useRoute } from './router';

/** The pages, in navigation order. Add a page here and in app.config.ts. */
const PAGES: Record<
  Page,
  { label: string; icon: ReactNode; render: (params: URLSearchParams) => ReactNode }
> = {
  users: { label: 'Users', icon: <UsersIcon />, render: (params) => <Users params={params} /> },
  roles: { label: 'Roles', icon: <ShieldIcon />, render: () => <Roles /> },
};

const NAV: NavItem[] = (Object.keys(PAGES) as Page[])
  .filter((page) => appConfig.pages[page])
  .map((page) => ({ label: PAGES[page].label, href: href(page), icon: PAGES[page].icon }));

// The signed-in person. Load them from your session instead of the sample data.
const me = sampleUsers.find((u) => u.id === appConfig.currentUserId);

export function App() {
  const { page, params } = useRoute();
  usePageChange(page, PAGES[page].label);

  return (
    <AppShell
      header={
        <AppHeader
          brand={<Brand />}
          actions={
            <>
              <ThemeToggle hideLabels size="sm" />
              <DropdownMenu
                label={<UserIcon />}
                iconOnly
                variant="ghost"
                aria-label="Account"
                align="end"
                items={[{ label: 'Sign out', href: appConfig.signOutHref }]}
              />
            </>
          }
        />
      }
      sidebar={
        <SideNav
          items={NAV}
          currentHref={href(page)}
          footer={
            me && (
              <div className="account">
                <Avatar name={me.name} size="sm" />
                <span className="two-line">
                  {me.name}
                  <span className="two-line__sub">{me.email}</span>
                </span>
              </div>
            )
          }
        />
      }
      tabBar={<MobileTabBar items={NAV} currentHref={href(page)} />}
    >
      {/* Keyed by page, so each page starts fresh, e.g. with the role from a #/users?role= link. */}
      <div key={page} className="page">
        {PAGES[page].render(params)}
      </div>
    </AppShell>
  );
}

/**
 * When the page changes: update the tab title, and put focus on the new page's heading so the
 * change is announced and Tab starts from the top of the page. (Not on the first load: the
 * browser handles that.)
 */
function usePageChange(page: Page, title: string) {
  const shown = useRef(page);
  useEffect(() => {
    document.title = `${title} · ${appConfig.name}`;
    if (shown.current === page) return;
    shown.current = page;
    const heading = document.querySelector<HTMLElement>('main h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [page, title]);
}
