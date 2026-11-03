import { appConfig } from '../app.config';

/** Logo and app name. Replace the SVG with your own logo. */
export function Brand() {
  return (
    <span className="brand">
      <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" />
        <path d="M10 17l4 4 8-9" />
      </svg>
      {appConfig.name}
    </span>
  );
}
