// CSV helpers: turn rows into CSV text (RFC 4180), read CSV text back, and download a file.
// No React and no dependencies, so they also work on a server.

export interface CsvColumn<T> {
  /** Column title in the first row. */
  header: string;
  /** The cell value for a row. Dates become ISO strings; null and undefined become empty. */
  value: (row: T) => unknown;
}

export interface ToCsvOptions {
  /** Default `,`. Use `;` for spreadsheets set to languages that use a decimal comma. */
  delimiter?: string;
  /** Line ending. Default `\r\n`, as RFC 4180 and Excel expect. */
  newline?: string;
  /**
   * Put a `'` before text that starts with `=`, `+`, `-`, `@`, a tab or a carriage return, so
   * spreadsheet apps show it instead of running it as a formula (CSV injection). Numbers are
   * not changed. Default true; turn it off only for files that never reach a spreadsheet.
   */
  protectFormulas?: boolean;
}

const FORMULA_START = /^[=+\-@\t\r]/;

function cellText(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  return String(value);
}

/** Quotes a single value when it contains the delimiter, a quote or a line break. */
export function escapeCsvValue(
  value: unknown,
  { delimiter = ',', protectFormulas = true }: Omit<ToCsvOptions, 'newline'> = {},
): string {
  let text = cellText(value);
  if (protectFormulas && typeof value === 'string' && FORMULA_START.test(text)) {
    text = `'${text}`;
  }
  const needsQuotes =
    text.includes(delimiter) || text.includes('"') || text.includes('\n') || text.includes('\r');
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Converts rows to CSV text: a header row, then one line per row.
 *
 * ```ts
 * const csv = toCsv(users, [
 *   { header: 'Name', value: (u) => u.name },
 *   { header: 'Joined', value: (u) => u.joinedAt },
 * ]);
 * ```
 */
export function toCsv<T>(
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
  options: ToCsvOptions = {},
): string {
  const { newline = '\r\n', ...cell } = options;
  const lines = [columns.map((c) => escapeCsvValue(c.header, cell)).join(cell.delimiter ?? ',')];
  for (const row of rows) {
    lines.push(columns.map((c) => escapeCsvValue(c.value(row), cell)).join(cell.delimiter ?? ','));
  }
  return lines.join(newline);
}

/**
 * Reads CSV text into rows of strings. Handles quoted values with delimiters, quotes and line
 * breaks inside them, `\r\n` or `\n` line endings, and a leading byte order mark. Values are
 * not trimmed or converted: check and convert them yourself, as with any user input.
 */
export function parseCsv(
  text: string,
  { delimiter = ',' }: { delimiter?: string } = {},
): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;
  let i = text.charCodeAt(0) === 0xfeff ? 1 : 0;

  const endValue = () => {
    row.push(value);
    value = '';
  };
  const endRow = () => {
    endValue();
    rows.push(row);
    row = [];
  };

  for (; i < text.length; i += 1) {
    const char = text[i]!;
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        value += char;
      }
    } else if (char === '"' && value === '') {
      quoted = true;
    } else if (text.startsWith(delimiter, i)) {
      endValue();
      i += delimiter.length - 1;
    } else if (char === '\n' || char === '\r') {
      endRow();
      if (char === '\r' && text[i + 1] === '\n') i += 1;
    } else {
      value += char;
    }
  }
  // The last row, unless the text ended with a line break.
  if (value !== '' || row.length > 0) endRow();
  return rows;
}

/**
 * Downloads CSV text as a file in the browser. Adds a byte order mark by default, so Excel
 * reads accented and non-Latin characters correctly.
 */
export function downloadCsv(
  csv: string,
  filename: string,
  { bom = true }: { bom?: boolean } = {},
): void {
  const blob = new Blob([bom ? '﻿' : '', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before releasing the file.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
