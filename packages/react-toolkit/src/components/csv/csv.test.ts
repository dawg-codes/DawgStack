import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadCsv, escapeCsvValue, parseCsv, toCsv } from './csv';

interface User {
  name: string;
  email: string;
  visits: number;
  joined: Date | null;
}
const users: User[] = [
  {
    name: 'Ana Silva',
    email: 'ana@example.com',
    visits: 12,
    joined: new Date('2026-01-05T00:00:00Z'),
  },
  { name: 'Ben "BJ" Jones', email: 'ben@example.com', visits: -3, joined: null },
  { name: 'Chen, Li', email: 'li@example.com', visits: 0, joined: new Date('invalid') },
];
const columns = [
  { header: 'Name', value: (u: User) => u.name },
  { header: 'Email', value: (u: User) => u.email },
  { header: 'Visits', value: (u: User) => u.visits },
  { header: 'Joined', value: (u: User) => u.joined },
];

describe('toCsv', () => {
  it('writes a header row and quotes values that need it', () => {
    expect(toCsv(users, columns)).toBe(
      [
        'Name,Email,Visits,Joined',
        'Ana Silva,ana@example.com,12,2026-01-05T00:00:00.000Z',
        '"Ben ""BJ"" Jones",ben@example.com,-3,',
        '"Chen, Li",li@example.com,0,',
      ].join('\r\n'),
    );
  });

  it('supports another delimiter and line ending', () => {
    const csv = toCsv(users.slice(2), columns.slice(0, 2), { delimiter: ';', newline: '\n' });
    expect(csv).toBe('Name;Email\nChen, Li;li@example.com');
  });

  it('quotes line breaks', () => {
    expect(escapeCsvValue('line one\nline two')).toBe('"line one\nline two"');
  });

  it('defuses text that a spreadsheet would run as a formula, but not numbers', () => {
    for (const formula of ['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\t=x', '\r=x']) {
      expect(escapeCsvValue(formula).replace(/^"|"$/g, '')).toBe(`'${formula}`);
    }
    expect(escapeCsvValue(-5)).toBe('-5');
    expect(escapeCsvValue('=1+1', { protectFormulas: false })).toBe('=1+1');
  });
});

describe('parseCsv', () => {
  it('reads what toCsv writes', () => {
    const text = toCsv(users, columns, { protectFormulas: false });
    expect(parseCsv(text)).toEqual([
      ['Name', 'Email', 'Visits', 'Joined'],
      ['Ana Silva', 'ana@example.com', '12', '2026-01-05T00:00:00.000Z'],
      ['Ben "BJ" Jones', 'ben@example.com', '-3', ''],
      ['Chen, Li', 'li@example.com', '0', ''],
    ]);
  });

  it('handles line breaks in quotes, \\n endings, a byte order mark and a trailing newline', () => {
    expect(parseCsv('﻿a,b\n"1\n2",3\n')).toEqual([
      ['a', 'b'],
      ['1\n2', '3'],
    ]);
  });

  it('keeps empty values, including a trailing one', () => {
    expect(parseCsv('a,,c,\n,,,')).toEqual([
      ['a', '', 'c', ''],
      ['', '', '', ''],
    ]);
  });

  it('supports other delimiters and returns nothing for empty text', () => {
    expect(parseCsv('a;b\n1;2', { delimiter: ';' })).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
    expect(parseCsv('')).toEqual([]);
  });
});

describe('downloadCsv', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('downloads a UTF-8 file with a byte order mark and the .csv extension', async () => {
    vi.useFakeTimers();
    const blobs: Blob[] = [];
    const createObjectURL = vi.fn((blob: Blob) => {
      blobs.push(blob);
      return 'blob:test';
    });
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe('users.csv');
      expect(this.href).toBe('blob:test');
    });

    downloadCsv('a,b', 'users');
    expect(click).toHaveBeenCalledTimes(1);
    expect(document.querySelector('a[download]')).toBeNull();
    expect(blobs[0]!.type).toBe('text/csv;charset=utf-8');
    const bytes = new Uint8Array(await blobs[0]!.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    vi.advanceTimersByTime(1000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
