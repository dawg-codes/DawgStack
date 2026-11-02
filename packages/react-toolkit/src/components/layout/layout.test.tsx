import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { pressEscapeIn } from '../../../test/dialog';
import { AppHeader, AppShell, useAppShell } from './AppShell';
import { AuthLayout } from './AuthLayout';
import { PageHeader } from './PageHeader';
import { MobileTabBar, SideNav, type NavItem, type NavSection } from './SideNav';

const Icon = () => <svg data-testid="icon" />;
const SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Overview', href: '/', icon: <Icon /> },
      { label: 'Projects', href: '/projects', icon: <Icon />, badge: '3' },
    ],
  },
  { title: 'Settings', items: [{ label: 'Team', href: '/team' }] },
];

function Shell({ tabs = false }: { tabs?: boolean }) {
  const tabItems: NavItem[] = [
    { label: 'Home', href: '/', icon: <Icon /> },
    { label: 'Inbox', href: '/inbox', icon: <Icon />, badge: '2' },
  ];
  return (
    <AppShell
      header={
        <AppHeader brand={<a href="/">Acme</a>} actions={<button type="button">Account</button>} />
      }
      sidebar={<SideNav sections={SECTIONS} currentHref="/projects" />}
      tabBar={tabs ? <MobileTabBar items={tabItems} currentHref="/inbox" /> : undefined}
    >
      <h1>Projects</h1>
    </AppShell>
  );
}

const wideScreen = () =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('min-width: 64rem'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as unknown as MediaQueryList,
  );

describe('AppShell and AppHeader', () => {
  it('provides a skip link, banner, navigation and main landmarks', () => {
    render(<Shell />);
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    const main = screen.getByRole('main');
    expect(skip).toHaveAttribute('href', `#${main.id}`);
    expect(main).toHaveAttribute('tabindex', '-1');
    expect(main).toHaveTextContent('Projects');
    expect(screen.getByRole('banner')).toHaveTextContent('Acme');
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    // The skip link comes before everything else.
    expect(document.querySelector('a')).toBe(skip);
  });

  it('moves focus to main from the skip link without changing the URL', async () => {
    render(<Shell />);
    const before = window.location.hash;
    await userEvent.click(screen.getByRole('link', { name: 'Skip to main content' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe(before);
  });

  it('opens the sidebar in a drawer from the menu button on narrow screens', async () => {
    render(<Shell />);
    const menu = screen.getByRole('button', { name: 'Open navigation' });
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveAttribute('aria-haspopup', 'dialog');
    await userEvent.click(menu);
    const drawer = screen.getByRole('dialog', { name: 'Menu' });
    expect(drawer).toHaveAttribute('data-placement', 'start');
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveAttribute('aria-controls', drawer.id);
    expect(within(drawer).getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('closes the drawer when a link is chosen, or on Escape', async () => {
    render(<Shell />);
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = screen.getByRole('dialog', { name: 'Menu' });
    await userEvent.click(within(drawer).getByRole('link', { name: 'Team' }));
    expect(drawer).not.toHaveAttribute('open');

    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(drawer).toHaveAttribute('open');
    act(() => pressEscapeIn(drawer as HTMLDialogElement));
    expect(drawer).not.toHaveAttribute('open');
  });

  it('never opens the drawer on wide screens, where the sidebar is a column', async () => {
    wideScreen();
    render(<Shell />);
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(document.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('omits the menu button without a sidebar, and outside an AppShell', () => {
    render(
      <AppShell header={<AppHeader brand="Acme" />}>
        <p>Content</p>
      </AppShell>,
    );
    expect(screen.queryByRole('button', { name: 'Open navigation' })).toBeNull();
    expect(document.querySelector('dialog')).toBeNull();
    render(<AppHeader brand="Standalone" />);
    expect(screen.getAllByRole('banner')).toHaveLength(2);
  });

  it('exposes its navigation state through useAppShell', async () => {
    function MyMenuButton() {
      const shell = useAppShell();
      return (
        <button type="button" onClick={shell?.openNav}>
          {shell?.navOpen ? 'open' : 'closed'}
        </button>
      );
    }
    render(
      <AppShell sidebar={<SideNav items={[{ label: 'A', href: '#a' }]} />}>
        <MyMenuButton />
      </AppShell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'closed' }));
    expect(screen.getByRole('button', { name: 'open' })).toBeInTheDocument();
  });

  it('accepts custom labels, a main id and a forwarded ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell
        ref={ref}
        mainId="content"
        skipLinkLabel="Ir al contenido"
        header={<AppHeader menuLabel="Abrir menú" />}
        sidebar={<SideNav items={[]} />}
      />,
    );
    expect(ref.current).toHaveClass('dawg-app');
    expect(screen.getByRole('link', { name: 'Ir al contenido' })).toHaveAttribute(
      'href',
      '#content',
    );
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
  });

  it('has no axe violations, with the drawer closed and open', async () => {
    render(<Shell tabs />);
    expect(await axeViolations(document.body)).toEqual([]);
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(await axeViolations(document.body)).toEqual([]);
  });
});

describe('SideNav', () => {
  it('marks the current page and labels each group by its heading', () => {
    render(<SideNav sections={SECTIONS} currentHref="/projects" />);
    expect(screen.getByRole('link', { name: 'Projects 3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Overview' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('list', { name: 'Settings' })).toBeInTheDocument();
    for (const icon of screen.getAllByTestId('icon')) {
      expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('lets an item mark itself current, and takes a flat list', () => {
    render(<SideNav items={[{ label: 'Docs', href: '/docs', current: true }]} label="Docs" />);
    expect(screen.getByRole('navigation', { name: 'Docs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders links through renderLink, e.g. a router link', () => {
    const renderLink = vi.fn(({ href, children, ...props }) => (
      <a data-to={href} href={`#router${href}`} {...props}>
        {children}
      </a>
    ));
    render(<SideNav items={[{ label: 'Team', href: '/team' }]} renderLink={renderLink} />);
    const link = screen.getByRole('link', { name: 'Team' });
    expect(link).toHaveAttribute('data-to', '/team');
    expect(link).toHaveClass('dawg-side-nav__link');
    expect(renderLink).toHaveBeenCalledWith(expect.objectContaining({ href: '/team' }));
  });

  it('shows header and footer content', () => {
    render(<SideNav items={[]} header="Workspace" footer="Signed in as Ana" />);
    expect(screen.getByText('Workspace')).toHaveClass('dawg-side-nav__header');
    expect(screen.getByText('Signed in as Ana')).toHaveClass('dawg-side-nav__footer');
  });
});

describe('MobileTabBar', () => {
  it('is a labelled navigation list with the current tab marked', async () => {
    render(
      <MobileTabBar
        items={[
          { label: 'Home', href: '/', icon: <Icon /> },
          { label: 'Alerts', href: '/alerts', icon: <Icon />, badge: '5' },
        ]}
        currentHref="/alerts"
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Alerts 5' })).toHaveAttribute('aria-current', 'page');
    expect(await axeViolations(nav)).toEqual([]);
  });
});

describe('PageHeader', () => {
  it('renders the title as h1, with description, actions and eyebrow', () => {
    render(
      <PageHeader
        title="Projects"
        description="Everything your team is working on."
        actions={<button type="button">New project</button>}
        eyebrow={<a href="/">Home</a>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByText('Everything your team is working on.')).toHaveClass(
      'dawg-page-header__description',
    );
    expect(screen.getByRole('button', { name: 'New project' }).parentElement).toHaveClass(
      'dawg-page-header__actions',
    );
    expect(screen.getByRole('link', { name: 'Home' }).parentElement).toHaveClass(
      'dawg-page-header__eyebrow',
    );
  });

  it('can use an h2', () => {
    render(<PageHeader title="Section" titleAs="h2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument();
  });
});

describe('AuthLayout', () => {
  it('is a page with a main landmark, an h1 and optional parts', async () => {
    const { container } = render(
      <AuthLayout
        brand="Acme"
        title="Sign in"
        description="Welcome back."
        actions={<button type="button">Theme</button>}
        footer={<a href="/sign-up">Create an account</a>}
        aside={<p>Plan your week in minutes.</p>}
      >
        <form aria-label="Sign in">
          <label>
            Email <input type="email" />
          </label>
        </form>
      </AuthLayout>,
    );
    const main = screen.getByRole('main');
    expect(within(main).getByRole('heading', { level: 1, name: 'Sign in' })).toBeInTheDocument();
    expect(within(main).getByRole('form', { name: 'Sign in' })).toBeInTheDocument();
    expect(within(main).getByRole('link', { name: 'Create an account' })).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('data-has-aside');
    expect(screen.getByText('Plan your week in minutes.').closest('aside')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toContainElement(
      screen.getByRole('button', { name: 'Theme' }),
    );
    expect(screen.getByRole('complementary')).toHaveClass('dawg-auth__aside');
    expect(await axeViolations(container)).toEqual([]);
  });
});
