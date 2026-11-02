import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';

/** The page numbers to show, with `'gap'` where numbers are skipped: 1 … 4 5 6 … 20. */
export function pageItems(page: number, pageCount: number, siblings = 1): (number | 'gap')[] {
  const last = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), last);
  // First, last, current and its neighbours; fill a gap of one with that number itself.
  const shown = new Set([1, last]);
  for (let p = current - siblings; p <= current + siblings; p += 1) {
    if (p >= 1 && p <= last) shown.add(p);
  }
  const sorted = [...shown].sort((a, b) => a - b);
  const items: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const previous = sorted[i - 1];
    if (previous !== undefined && p - previous === 2) items.push(previous + 1);
    else if (previous !== undefined && p - previous > 2) items.push('gap');
    items.push(p);
  });
  return items;
}

/** The rows on one page, plus what's needed to describe it ("11–20 of 95"). */
export function paginate<T>(rows: readonly T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  const items = rows.slice(start, start + pageSize);
  return {
    items,
    page: current,
    pageCount,
    /** 1-based position of the first and last row shown (0 when there are none). */
    from: items.length ? start + 1 : 0,
    to: start + items.length,
    total: rows.length,
  };
}

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** The current page, starting at 1. */
  page: number;
  pageCount: number;
  /** Called with the chosen page. Not needed when `getHref` makes the pages links. */
  onPageChange?: (page: number) => void;
  /**
   * Makes each page a link, e.g. ``(page) => `?page=${page}` ``, so pages can be bookmarked and
   * opened in new tabs. Without it, pages are buttons.
   */
  getHref?: (page: number) => string;
  /** How many pages to show either side of the current one. Default 1. */
  siblingCount?: number;
  /** Text such as "Showing 11–20 of 95", shown before the page buttons. */
  summary?: ReactNode;
  /** Accessible name of the navigation landmark. Default `'Pagination'`. */
  label?: string;
  /** Default `'Previous'`. */
  previousLabel?: string;
  /** Default `'Next'`. */
  nextLabel?: string;
  /** Accessible name of each page number. Default `` (page) => `Page ${page}` ``. */
  pageLabel?: (page: number) => string;
  /** Short status shown on phones instead of the numbers. Default `` `Page ${page} of ${pageCount}` ``. */
  compactLabel?: (page: number, pageCount: number) => string;
}

const Chevron = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className="dawg-pagination__chevron"
    data-flip={flip || undefined}
  >
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

/**
 * Page navigation: Previous and Next, page numbers with gaps, and the current page marked with
 * `aria-current="page"`. On phones the numbers give way to "Page 2 of 10".
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageCount,
    onPageChange,
    getHref,
    siblingCount = 1,
    summary,
    label = 'Pagination',
    previousLabel = 'Previous',
    nextLabel = 'Next',
    pageLabel = (p) => `Page ${p}`,
    compactLabel = (p, count) => `Page ${p} of ${count}`,
    className,
    ...rest
  },
  ref,
) {
  const last = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), last);

  // A link or a button, depending on getHref. Unavailable steps (Previous on page 1) are
  // disabled buttons or links without an href, so they can't be activated.
  const control = (
    target: number,
    content: ReactNode,
    props: { className: string; 'aria-label'?: string; 'aria-current'?: 'page' },
    enabled = true,
  ) => {
    if (getHref) {
      return enabled ? (
        <a {...props} href={getHref(target)} onClick={() => onPageChange?.(target)}>
          {content}
        </a>
      ) : (
        <a {...props} aria-disabled="true" role="link">
          {content}
        </a>
      );
    }
    return (
      <button
        {...props}
        type="button"
        disabled={!enabled}
        onClick={props['aria-current'] ? undefined : () => onPageChange?.(target)}
      >
        {content}
      </button>
    );
  };

  return (
    <nav {...rest} ref={ref} aria-label={label} className={cx('dawg-pagination', className)}>
      {summary && <p className="dawg-pagination__summary">{summary}</p>}
      <ul className="dawg-pagination__list">
        <li>
          {control(
            current - 1,
            <>
              <Chevron />
              <span className="dawg-pagination__step-label">{previousLabel}</span>
            </>,
            { className: 'dawg-pagination__step', 'aria-label': previousLabel },
            current > 1,
          )}
        </li>
        {pageItems(current, last, siblingCount).map((item, i) =>
          item === 'gap' ? (
            <li key={`gap-${i}`} className="dawg-pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item} className="dawg-pagination__number">
              {control(item, item, {
                className: 'dawg-pagination__page',
                'aria-label': pageLabel(item),
                'aria-current': item === current ? 'page' : undefined,
              })}
            </li>
          ),
        )}
        {/* Shown (and read) only on phones, where the page numbers are hidden. */}
        <li className="dawg-pagination__compact">{compactLabel(current, last)}</li>
        <li>
          {control(
            current + 1,
            <>
              <span className="dawg-pagination__step-label">{nextLabel}</span>
              <Chevron flip />
            </>,
            { className: 'dawg-pagination__step', 'aria-label': nextLabel },
            current < last,
          )}
        </li>
      </ul>
    </nav>
  );
});
