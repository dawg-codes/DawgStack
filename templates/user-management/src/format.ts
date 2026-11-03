import { appConfig } from './app.config';

/** Date formats. Change the options here to change them everywhere. */

const date = new Intl.DateTimeFormat(appConfig.locale, { dateStyle: 'medium' });
const relative = new Intl.RelativeTimeFormat(appConfig.locale, { numeric: 'auto' });

export const formatDate = (iso: string) => date.format(new Date(iso));

const STEPS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['minute', 60],
  ['hour', 24],
  ['day', 30],
  ['month', 12],
  ['year', Infinity],
];

/** "5 minutes ago", "yesterday", "3 months ago". Under a minute reads "just now". */
export function formatRelative(iso: string, now = Date.now()): string {
  let value = (new Date(iso).getTime() - now) / 60_000; // minutes, negative for the past
  if (Math.abs(value) < 1) return 'just now';
  for (const [unit, size] of STEPS) {
    if (Math.abs(value) < size) return relative.format(Math.round(value), unit);
    value /= size;
  }
  return formatDate(iso);
}
