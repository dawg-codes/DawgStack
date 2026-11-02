/**
 * App settings. Start here: change the name, the navigation and which sections are shown.
 * Everything is plain data, so the app keeps working while you edit it.
 */
export type Feature = 'team' | 'activity';

export interface NavItem {
  label: string;
  /** A section on the page. Add a router (e.g. react-router) when you need separate pages. */
  href: string;
  /** Hide the link when this feature is turned off. */
  feature?: Feature;
}

export const appConfig = {
  name: 'Starter',
  tagline: 'Your workspace at a glance',
  nav: [
    { label: 'Overview', href: '#overview' },
    { label: 'Projects', href: '#projects' },
    { label: 'Team', href: '#team', feature: 'team' },
    { label: 'Activity', href: '#activity', feature: 'activity' },
  ] satisfies NavItem[] as NavItem[],
  /** Turn sections off without deleting any code. */
  features: { team: true, activity: true } satisfies Record<Feature, boolean>,
};
