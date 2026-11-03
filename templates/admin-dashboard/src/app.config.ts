/**
 * App settings. Start here: the name, the navigation and which pages are shown.
 * Everything is plain data, so the app keeps working while you edit it.
 */
export type Page = 'overview' | 'orders' | 'settings';

export const appConfig = {
  name: 'Acme Admin',

  /** The signed-in person, shown in the account menu. Load it from your backend instead. */
  account: { name: 'Ana Silva', email: 'ana@example.com' },

  /** Where "Sign out" goes, e.g. your sign-in page. */
  signOutHref: '#/overview',

  /** Currency and locale for money, numbers and dates. */
  locale: 'en-US',
  currency: 'USD',

  /** Turn pages off without deleting any code; their links disappear too. */
  pages: { overview: true, orders: true, settings: true } satisfies Record<Page, boolean>,
};
