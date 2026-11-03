import { useSyncExternalStore } from 'react';
import { appConfig, type Page } from './app.config';

/**
 * A tiny router based on the URL hash (#/users, #/users?role=admin, #/roles), so the template
 * needs no extra packages. With a router such as react-router, make each file in src/pages a
 * route instead.
 */
const PAGES: Page[] = ['users', 'roles'];

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** The current page and its query. Unknown or turned-off pages show the first page that's on. */
export function useRoute(): { page: Page; params: URLSearchParams } {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const enabled = PAGES.filter((page) => appConfig.pages[page]);
  const page = enabled.includes(path as Page) ? (path as Page) : (enabled[0] ?? 'users');
  return { page, params: new URLSearchParams(query) };
}

export const href = (page: Page, params?: Record<string, string>) =>
  `#/${page}${params ? `?${new URLSearchParams(params)}` : ''}`;
