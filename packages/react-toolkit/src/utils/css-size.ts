/** Turns a numeric size into pixels; strings (e.g. "50%", "2rem") pass through unchanged. */
export function cssSize(value: number | string | undefined): string | undefined {
  return typeof value === 'number' ? `${value}px` : value;
}
