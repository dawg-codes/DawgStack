import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { installMatchMedia, resetMedia } from './media';

const browserLike = typeof window !== 'undefined';
if (browserLike) installMatchMedia();

afterEach(() => {
  cleanup();
  if (!browserLike) return;
  resetMedia();
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-dawg-theme');
  document.documentElement.removeAttribute('style');
});
