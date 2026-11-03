import { useSyncExternalStore } from 'react';
import { appConfig, type Page } from './app.config';

/**
 * A tiny router based on the URL hash (#/overview, #/orders), so the template needs no extra
 * packages. With a router such as react-router, make each file in src/pages a route instead.
 */
const PAGES: Page[] = ['overview', 'orders', 'settings'];

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** The current page. Unknown or turned-off pages show the first page that's on. */
export function usePage(): Page {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const name = hash.replace(/^#\/?/, '').split('?')[0] as Page;
  const enabled = PAGES.filter((page) => appConfig.pages[page]);
  return enabled.includes(name) ? name : (enabled[0] ?? 'overview');
}

export const href = (page: Page) => `#/${page}`;
