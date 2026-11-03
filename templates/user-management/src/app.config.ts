/**
 * App settings. Start here: the name, who is signed in and which pages are shown.
 * Everything is plain data, so the app keeps working while you edit it.
 */
export type Page = 'users' | 'roles';

export const appConfig = {
  name: 'Acme',

  /**
   * The signed-in person's id. They can't change their own role, suspend or remove
   * themselves (your server must check this too). Load it from your session instead.
   */
  currentUserId: 'u-01',

  /** Where "Sign out" goes, e.g. your sign-in page. */
  signOutHref: '#/users',

  /** Locale for dates and numbers. */
  locale: 'en-US',

  /** Rows per page in the user table. */
  pageSize: 10,

  /** The most email addresses one invitation can include. */
  maxInvites: 20,

  /** Turn pages off without deleting any code; their links disappear too. */
  pages: { users: true, roles: true } satisfies Record<Page, boolean>,
};
