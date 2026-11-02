import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import { cssSize } from '../../utils/css-size';
import { useControllableState } from '../../utils/use-controllable-state';
import { Button } from '../button/Button';
import { toCsv, type ToCsvOptions } from '../csv/csv';
import { DropdownMenu, type MenuItem } from '../menu/DropdownMenu';
import { Skeleton } from '../skeleton/Skeleton';

export type SortDirection = 'asc' | 'desc';
export interface SortState {
  /** The `key` of the sorted column. */
  key: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  /** Unique id of the column; also the row property shown when there's no `cell` or `value`. */
  key: string;
  header: ReactNode;
  /** Plain-text header for CSV export, when `header` isn't a string. */
  headerText?: string;
  /** What to show in the cell. Default: the `value` as text. */
  cell?: (row: T) => ReactNode;
  /** The raw value, used to sort and export. Default: `row[key]`. */
  value?: (row: T) => unknown;
  /** Let users sort by this column. */
  sortable?: boolean;
  /** Default `start`; use `end` for numbers so they line up. */
  align?: 'start' | 'center' | 'end';
  /**
   * The column that names each row, such as a person's name. Its cells are row headers
   * (`<th scope="row">`), and its value labels the row's checkbox and actions menu.
   */
  rowHeader?: boolean;
  /** Column width, e.g. `'12rem'` or `120`. */
  width?: string | number;
  /** Hide this column on screens narrower than `md` (48rem) or `lg` (64rem). */
  hideBelow?: 'md' | 'lg';
}

export interface DataTableProps<T> extends Omit<
  TableHTMLAttributes<HTMLTableElement>,
  'children' | 'summary'
> {
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  /** A stable, unique id for each row, e.g. `(user) => user.id`. */
  getRowId: (row: T) => string;
  /** Names the table for screen readers, e.g. "Team members". Required. */
  caption: ReactNode;
  /** Hide the caption visually (it is still read). */
  hideCaption?: boolean;

  /** Sorted column (controlled). Use with `onSortChange`. */
  sort?: SortState | null;
  /** Initially sorted column (uncontrolled). */
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState) => void;
  /** The rows arrive already sorted (e.g. by your server), so the table doesn't sort them. */
  manualSort?: boolean;

  /** Adds a checkbox to each row and a select-all checkbox to the header. */
  selectable?: boolean;
  /** Selected row ids (controlled). Use with `onSelectionChange`. */
  selectedIds?: readonly string[];
  defaultSelectedIds?: readonly string[];
  onSelectionChange?: (ids: string[]) => void;
  /** Buttons shown above the table while rows are selected, e.g. Delete. */
  bulkActions?: (selectedIds: string[], clearSelection: () => void) => ReactNode;

  /** A menu of actions at the end of each row, such as Edit and Delete. */
  rowActions?: (row: T) => readonly MenuItem[];
  /** Text naming a row, for its checkbox and actions menu. Default: the row header value. */
  getRowLabel?: (row: T) => string;

  /** Shows placeholder rows (or dims the current rows) while data loads. */
  loading?: boolean;
  /** Placeholder rows to show while loading with no rows. Default 5. */
  loadingRows?: number;
  /** Shown when there are no rows, e.g. an EmptyState. Default `'No results.'`. */
  empty?: ReactNode;
  /** Row height. Default `comfortable`. */
  density?: 'comfortable' | 'compact';
  /** Limit the height (e.g. `'32rem'`) and keep the header visible while the rows scroll. */
  maxHeight?: string | number;

  /** Default `'Select all rows'`. */
  selectAllLabel?: string;
  /** Default `` (label) => `Select ${label}` ``. */
  selectRowLabel?: (rowLabel: string) => string;
  /** Default `` (label) => `Actions for ${label}` ``. */
  rowActionsLabel?: (rowLabel: string) => string;
  /** Default `` (count) => `${count} selected` ``. */
  selectedCountLabel?: (count: number) => string;
  /** Default `'Clear selection'`. */
  clearSelectionLabel?: string;
  /** Accessible name of the actions column. Default `'Actions'`. */
  actionsHeaderLabel?: string;
}

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};
const SortIcon = ({ direction }: { direction?: SortDirection }) => (
  <svg {...svg} className="dawg-table__sort-icon" data-direction={direction}>
    {direction === 'asc' ? (
      <path d="M12 19V5M6 11l6-6 6 6" />
    ) : direction === 'desc' ? (
      <path d="M12 5v14M6 13l6 6 6-6" />
    ) : (
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    )}
  </svg>
);
const MoreIcon = () => (
  <svg {...svg}>
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </svg>
);

/** A native checkbox that can show the "some selected" dash. */
function SelectBox({
  indeterminate = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input {...props} ref={ref} type="checkbox" className="dawg-table__checkbox" />;
}

/** The raw value of a column for a row. */
export function columnValue<T>(column: DataTableColumn<T>, row: T): unknown {
  return column.value ? column.value(row) : (row as Record<string, unknown>)[column.key];
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const isEmpty = (v: unknown) => v == null || v === '' || (typeof v === 'number' && Number.isNaN(v));

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Sorts rows by a column: numbers and dates by value, text in natural order ("Item 2" before
 * "Item 10"), ignoring case. Empty values always go last. The original array isn't changed.
 */
export function sortRows<T>(
  rows: readonly T[],
  column: DataTableColumn<T>,
  direction: SortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...rows].sort((x, y) => {
    const a = columnValue(column, x);
    const b = columnValue(column, y);
    if (isEmpty(a) || isEmpty(b)) return isEmpty(a) === isEmpty(b) ? 0 : isEmpty(a) ? 1 : -1;
    return sign * compareValues(a, b);
  });
}

/**
 * Exports rows to CSV using the table's columns: each column's `headerText` (or string
 * `header`) and `value`. Pass only the columns you want, e.g. `columns.filter(...)`.
 */
export function tableToCsv<T>(
  rows: readonly T[],
  columns: readonly DataTableColumn<T>[],
  options?: ToCsvOptions,
): string {
  return toCsv(
    rows,
    columns.map((column) => ({
      header: column.headerText ?? (typeof column.header === 'string' ? column.header : column.key),
      value: (row: T) => columnValue(column, row),
    })),
    options,
  );
}

function DataTableInner<T>(
  {
    columns,
    rows,
    getRowId,
    caption,
    hideCaption = false,
    sort: sortProp,
    defaultSort = null,
    onSortChange,
    manualSort = false,
    selectable = false,
    selectedIds,
    defaultSelectedIds = [],
    onSelectionChange,
    bulkActions,
    rowActions,
    getRowLabel,
    loading = false,
    loadingRows = 5,
    empty = 'No results.',
    density = 'comfortable',
    maxHeight,
    selectAllLabel = 'Select all rows',
    selectRowLabel = (label) => `Select ${label}`,
    rowActionsLabel = (label) => `Actions for ${label}`,
    selectedCountLabel = (count) => `${count} selected`,
    clearSelectionLabel = 'Clear selection',
    actionsHeaderLabel = 'Actions',
    className,
    style,
    ...rest
  }: DataTableProps<T>,
  ref: ForwardedRef<HTMLTableElement>,
) {
  const captionId = `${useId()}-caption`;
  const [sort, setSort] = useControllableState<SortState | null>(
    sortProp,
    defaultSort,
    onSortChange as ((sort: SortState | null) => void) | undefined,
  );
  const [selected, setSelected] = useControllableState<readonly string[]>(
    selectedIds,
    defaultSelectedIds,
    onSelectionChange as ((ids: readonly string[]) => void) | undefined,
  );

  const sortedRows = useMemo(() => {
    const column = sort && columns.find((c) => c.key === sort.key);
    return column && !manualSort ? sortRows(rows, column, sort.direction) : rows;
  }, [rows, columns, sort, manualSort]);

  const headerColumn = columns.find((c) => c.rowHeader);
  const labelFor = (row: T, index: number) =>
    getRowLabel?.(row) ||
    (headerColumn ? String(columnValue(headerColumn, row) ?? '') : '') ||
    `Row ${index + 1}`;

  const selectedSet = new Set(selected);
  const rowIds = sortedRows.map(getRowId);
  const selectedHere = rowIds.filter((id) => selectedSet.has(id)).length;
  const allSelected = rowIds.length > 0 && selectedHere === rowIds.length;
  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !rowIds.includes(id))
        : [...selected, ...rowIds.filter((id) => !selectedSet.has(id))],
    );
  const toggleRow = (id: string) =>
    setSelected(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  const clearSelection = () => setSelected([]);

  const changeSort = (key: string) =>
    setSort({
      key,
      direction: sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc',
    });

  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const cellProps = (column: DataTableColumn<T>) => ({
    'data-align': column.align && column.align !== 'start' ? column.align : undefined,
    'data-hide-below': column.hideBelow,
  });

  let body: ReactNode;
  if (loading && sortedRows.length === 0) {
    body = Array.from({ length: loadingRows }, (_, i) => (
      <tr key={`loading-${i}`} className="dawg-table__loading-row">
        {selectable && <td />}
        {columns.map((column) => (
          <td key={column.key} {...cellProps(column)}>
            <Skeleton variant="text" width={i % 2 ? '60%' : '80%'} />
          </td>
        ))}
        {rowActions && <td />}
      </tr>
    ));
  } else if (sortedRows.length === 0) {
    body = (
      <tr>
        <td className="dawg-table__empty" colSpan={columnCount}>
          {empty}
        </td>
      </tr>
    );
  } else {
    body = sortedRows.map((row, index) => {
      const id = rowIds[index]!;
      const isSelected = selectedSet.has(id);
      const label = labelFor(row, index);
      return (
        <tr key={id} data-selected={isSelected || undefined}>
          {selectable && (
            <td className="dawg-table__select">
              <SelectBox
                checked={isSelected}
                onChange={() => toggleRow(id)}
                aria-label={selectRowLabel(label)}
              />
            </td>
          )}
          {columns.map((column) => {
            const content = column.cell ? column.cell(row) : String(columnValue(column, row) ?? '');
            return column.rowHeader ? (
              <th key={column.key} scope="row" {...cellProps(column)}>
                {content}
              </th>
            ) : (
              <td key={column.key} {...cellProps(column)}>
                {content}
              </td>
            );
          })}
          {rowActions && (
            <td className="dawg-table__row-actions">
              <DropdownMenu
                label={<MoreIcon />}
                iconOnly
                variant="ghost"
                size="sm"
                align="end"
                aria-label={rowActionsLabel(label)}
                items={rowActions(row)}
              />
            </td>
          )}
        </tr>
      );
    });
  }

  return (
    <div
      className={cx('dawg-table', className)}
      style={style}
      data-density={density}
      data-sticky-header={maxHeight != null || undefined}
    >
      {selectable && (
        // Always present, so screen readers hear the count change.
        <span className="dawg-visually-hidden" role="status">
          {selected.length > 0 ? selectedCountLabel(selected.length) : ''}
        </span>
      )}
      {selectable && selected.length > 0 && (
        <div className="dawg-table__bulk">
          <span className="dawg-table__bulk-count" aria-hidden="true">
            {selectedCountLabel(selected.length)}
          </span>
          <div className="dawg-table__bulk-actions">
            {bulkActions?.([...selected], clearSelection)}
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              {clearSelectionLabel}
            </Button>
          </div>
        </div>
      )}
      {/* Focusable, so keyboard users can scroll a wide table. */}
      <div
        className="dawg-table__scroll"
        role="region"
        aria-labelledby={captionId}
        // A scrollable region must be reachable by keyboard (WCAG 2.1.1, axe scrollable-region-focusable).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        style={maxHeight != null ? ({ maxHeight: cssSize(maxHeight) } as CSSProperties) : undefined}
      >
        <table {...rest} ref={ref} className="dawg-table__table" aria-busy={loading || undefined}>
          <caption
            id={captionId}
            className={cx('dawg-table__caption', hideCaption && 'dawg-visually-hidden')}
          >
            {caption}
          </caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="dawg-table__select">
                  <SelectBox
                    checked={allSelected}
                    indeterminate={selectedHere > 0 && !allSelected}
                    disabled={rowIds.length === 0}
                    onChange={toggleAll}
                    aria-label={selectAllLabel}
                  />
                </th>
              )}
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    {...cellProps(column)}
                    aria-sort={
                      direction ? (direction === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                    style={column.width != null ? { width: cssSize(column.width) } : undefined}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="dawg-table__sort"
                        onClick={() => changeSort(column.key)}
                      >
                        {column.header}
                        <SortIcon direction={direction} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th scope="col" className="dawg-table__row-actions">
                  <span className="dawg-visually-hidden">{actionsHeaderLabel}</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * A table for lists of records: sortable columns, row selection with bulk actions, a menu of
 * actions per row, loading and empty states, and horizontal scrolling on small screens. It is
 * a real `<table>`, so screen readers announce rows, columns and headers. The ref goes to the
 * `<table>`; `className` and `style` go to the wrapper.
 */
export const DataTable = forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: Ref<HTMLTableElement> },
) => ReactElement;
