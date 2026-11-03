import { useEffect, useRef, type ReactNode } from 'react';
import { Avatar } from '@dawg-codes/react-toolkit';
import {
  AppHeader,
  AppShell,
  MobileTabBar,
  SideNav,
  type NavItem,
} from '@dawg-codes/react-toolkit/layout';
import { DropdownMenu, type MenuItem } from '@dawg-codes/react-toolkit/menu';
import { ThemeToggle } from '@dawg-codes/react-toolkit/theme';
import { appConfig, type Page } from './app.config';
import { HomeIcon, ReceiptIcon, SettingsIcon, UserIcon } from './components/icons';
import { Brand } from './components/parts';
import { Orders } from './pages/Orders';
import { Overview } from './pages/Overview';
import { Settings } from './pages/Settings';
import { href, usePage } from './router';

/** The pages, in navigation order. Add a page here and in app.config.ts. */
const PAGES: Record<Page, { label: string; icon: ReactNode; render: () => ReactNode }> = {
  overview: { label: 'Overview', icon: <HomeIcon />, render: () => <Overview /> },
  orders: { label: 'Orders', icon: <ReceiptIcon />, render: () => <Orders /> },
  settings: { label: 'Settings', icon: <SettingsIcon />, render: () => <Settings /> },
};

const NAV: NavItem[] = (Object.keys(PAGES) as Page[])
  .filter((page) => appConfig.pages[page])
  .map((page) => ({ label: PAGES[page].label, href: href(page), icon: PAGES[page].icon }));

const ACCOUNT_MENU: MenuItem[] = [
  ...(appConfig.pages.settings
    ? [{ label: 'Settings', href: href('settings') }, 'separator' as const]
    : []),
  { label: 'Sign out', href: appConfig.signOutHref },
];

export function App() {
  const page = usePage();
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
                items={ACCOUNT_MENU}
              />
            </>
          }
        />
      }
      sidebar={<SideNav items={NAV} currentHref={href(page)} footer={<Account />} />}
      tabBar={<MobileTabBar items={NAV} currentHref={href(page)} />}
    >
      {PAGES[page].render()}
    </AppShell>
  );
}

/** Who is signed in, at the bottom of the navigation. */
function Account() {
  const { name, email } = appConfig.account;
  return (
    <div className="account">
      <Avatar name={name} size="sm" />
      <span className="two-line">
        {name}
        <span className="two-line__sub">{email}</span>
      </span>
    </div>
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
