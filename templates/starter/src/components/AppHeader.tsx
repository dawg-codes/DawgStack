import { ThemeToggle } from '@dawg-codes/react-toolkit/theme';
import { appConfig } from '../app.config';

/** Top bar: app name, navigation from app.config.ts, and the light/dark/system toggle. */
export function AppHeader() {
  const links = appConfig.nav.filter((item) => !item.feature || appConfig.features[item.feature]);
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <a className="app-brand" href="#overview">
          <svg className="app-brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <rect width="32" height="32" rx="8" />
            <path d="M9 11h14M9 16h14M9 21h9" />
          </svg>
          {appConfig.name}
        </a>
        <nav className="app-nav" aria-label="Main">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeToggle hideLabels size="sm" />
      </div>
    </header>
  );
}
