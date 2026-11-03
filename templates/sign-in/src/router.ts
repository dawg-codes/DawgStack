import { useSyncExternalStore } from 'react';

/**
 * A tiny router based on the URL hash (#/sign-in, #/reset-password?token=...), so the
 * template needs no extra packages. In an app with a router (e.g. react-router), make each
 * screen in src/pages a route instead and replace `navigate` and `href`.
 */
export const routes = [
  'sign-in',
  'sign-up',
  'forgot-password',
  'check-email',
  'reset-password',
  'verify',
  'signed-in',
] as const;
export type Route = (typeof routes)[number];

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** The current screen and its query parameters. Unknown addresses show the sign-in screen. */
export function useRoute(): { route: Route; params: URLSearchParams } {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const route = (routes as readonly string[]).includes(path) ? (path as Route) : 'sign-in';
  return { route, params: new URLSearchParams(query) };
}

export function href(route: Route, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params)}` : '';
  return `#/${route}${query}`;
}

export function navigate(route: Route, params?: Record<string, string>) {
  window.location.hash = href(route, params);
}
