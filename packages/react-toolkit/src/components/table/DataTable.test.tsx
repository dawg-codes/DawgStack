import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { DataTable, sortRows, tableToCsv, type DataTableColumn, type SortState } from './DataTable';

interface Person {
  id: string;
  name: string;
  role: string;
  projects: number;
  joined: Date;
}
const PEOPLE: Person[] = [
  { id: 'p1', name: 'Ana Silva', role: 'Designer', projects: 12, joined: new Date('2024-03-01') },
  { id: 'p2', name: 'ben Okafor', role: 'Engineer', projects: 3, joined: new Date('2022-11-15') },
  { id: 'p3', name: 'Chen Li', role: '', projects: 27, joined: new Date('2025-06-30') },
];
const COLUMNS: DataTableColumn<Person>[] = [
  { key: 'name', header: 'Name', rowHeader: true, sortable: true },
  { key: 'role', header: 'Role', sortable: true, hideBelow: 'md' },
  { key: 'projects', header: 'Projects', sortable: true, align: 'end' },
  {
    key: 'joined',
    header: 'Joined',
    sortable: true,
    cell: (p) => p.joined.toISOString().slice(0, 10),
  },
];

const names = () => screen.getAllByRole('rowheader').map((cell) => cell.textContent);

function setup(props: Partial<Parameters<typeof DataTable<Person>>[0]> = {}) {
  return render(
    <DataTable
      caption="Team members"
      columns={COLUMNS}
      rows={PEOPLE}
      getRowId={(p) => p.id}
      {...props}
    />,
  );
}

describe('DataTable', () => {
  it('is a captioned table with column and row headers in a focusable scroll region', () => {
    const ref = createRef<HTMLTableElement>();
    setup({ ref });
    const table = screen.getByRole('table', { name: 'Team members' });
    expect(ref.current).toBe(table);
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([
      'Name',
      'Role',
      'Projects',
      'Joined',
    ]);
    expect(names()).toEqual(['Ana Silva', 'ben Okafor', 'Chen Li']);
    const region = screen.getByRole('region', { name: 'Team members' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('cell', { name: '2024-03-01' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '12' })).toHaveAttribute('data-align', 'end');
    expect(screen.getByRole('columnheader', { name: 'Role' })).toHaveAttribute(
      'data-hide-below',
      'md',
    );
  });

  it('sorts by a column when its header button is pressed, then reverses', async () => {
    setup();
    const header = () => screen.getByRole('columnheader', { name: 'Projects' });
    expect(header()).not.toHaveAttribute('aria-sort');
    await userEvent.click(within(header()).getByRole('button', { name: 'Projects' }));
    expect(header()).toHaveAttribute('aria-sort', 'ascending');
    expect(names()).toEqual(['ben Okafor', 'Ana Silva', 'Chen Li']);
    await userEvent.click(within(header()).getByRole('button'));
    expect(header()).toHaveAttribute('aria-sort', 'descending');
    expect(names()).toEqual(['Chen Li', 'Ana Silva', 'ben Okafor']);
  });

  it('sorts text ignoring case and dates by time, with empty values last', async () => {
    setup({ defaultSort: { key: 'name', direction: 'asc' } });
    expect(names()).toEqual(['Ana Silva', 'ben Okafor', 'Chen Li']);
    await userEvent.click(screen.getByRole('button', { name: 'Joined' }));
    expect(names()).toEqual(['ben Okafor', 'Ana Silva', 'Chen Li']);
    await userEvent.click(screen.getByRole('button', { name: 'Role' }));
    expect(names()).toEqual(['Ana Silva', 'ben Okafor', 'Chen Li']);
    await userEvent.click(screen.getByRole('button', { name: 'Role' }));
    expect(names()).toEqual(['ben Okafor', 'Ana Silva', 'Chen Li']);
  });

  it('works with controlled sorting and leaves rows alone with manualSort', async () => {
    const onSortChange = vi.fn();
    function Controlled() {
      const [sort, setSort] = useState<SortState | null>(null);
      return (
        <DataTable
          caption="People"
          columns={COLUMNS}
          rows={PEOPLE}
          getRowId={(p) => p.id}
          sort={sort}
          onSortChange={(next) => {
            onSortChange(next);
            setSort(next);
          }}
          manualSort
        />
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Projects' }));
    expect(onSortChange).toHaveBeenCalledWith({ key: 'projects', direction: 'asc' });
    expect(screen.getByRole('columnheader', { name: 'Projects' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(names()).toEqual(['Ana Silva', 'ben Okafor', 'Chen Li']);
  });

  it('selects rows, with a select-all box that shows a partial selection', async () => {
    const onSelectionChange = vi.fn();
    setup({ selectable: true, onSelectionChange });
    const all = screen.getByRole('checkbox', { name: 'Select all rows' });
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select ben Okafor' }));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p2']);
    expect((all as HTMLInputElement).indeterminate).toBe(true);
    expect(screen.getByRole('status')).toHaveTextContent('1 selected');
    expect(screen.getByRole('row', { name: /ben Okafor/ })).toHaveAttribute('data-selected');

    await userEvent.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['p2', 'p1', 'p3']);
    expect(all).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('3 selected');
    await userEvent.click(all);
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('shows bulk actions for the selection, with a clear button', async () => {
    const remove = vi.fn();
    setup({
      selectable: true,
      defaultSelectedIds: ['p1', 'p3'],
      bulkActions: (ids, clear) => (
        <button
          type="button"
          onClick={() => {
            remove(ids);
            clear();
          }}
        >
          Remove
        </button>
      ),
    });
    expect(screen.getByText('2 selected', { selector: '.dawg-table__bulk-count' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(remove).toHaveBeenCalledWith(['p1', 'p3']);
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Select Chen Li' }));
    await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.getByRole('checkbox', { name: 'Select Chen Li' })).not.toBeChecked();
  });

  it('adds an actions menu to each row, named after the row', async () => {
    const edit = vi.fn();
    setup({ rowActions: (p) => [{ label: 'Edit', onSelect: () => edit(p.id) }] });
    expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Actions for Chen Li' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(edit).toHaveBeenCalledWith('p3');
  });

  it('uses getRowLabel for labels when given', () => {
    setup({ selectable: true, getRowLabel: (p) => `${p.name} (${p.id})` });
    expect(screen.getByRole('checkbox', { name: 'Select Ana Silva (p1)' })).toBeInTheDocument();
  });

  it('shows placeholder rows while loading and an empty state with no rows', () => {
    const { rerender } = setup({ rows: [], loading: true, loadingRows: 3 });
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('aria-busy', 'true');
    expect(table.querySelectorAll('tbody tr')).toHaveLength(3);
    rerender(
      <DataTable
        caption="Team members"
        columns={COLUMNS}
        rows={[]}
        getRowId={(p) => p.id}
        selectable
        empty="Nobody here yet."
      />,
    );
    const cell = screen.getByRole('cell', { name: 'Nobody here yet.' });
    expect(cell).toHaveAttribute('colspan', '5');
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeDisabled();
  });

  it('can hide the caption, set density and a max height', () => {
    setup({ hideCaption: true, density: 'compact', maxHeight: 320, className: 'mine' });
    expect(screen.getByText('Team members')).toHaveClass('dawg-visually-hidden');
    const wrapper = screen.getByRole('table').closest('.dawg-table')!;
    expect(wrapper).toHaveClass('mine');
    expect(wrapper).toHaveAttribute('data-density', 'compact');
    expect(wrapper).toHaveAttribute('data-sticky-header');
    expect(screen.getByRole('region')).toHaveStyle({ maxHeight: '320px' });
  });

  it('has no axe violations with selection, sorting and row actions', async () => {
    const { container } = setup({
      selectable: true,
      defaultSelectedIds: ['p2'],
      defaultSort: { key: 'name', direction: 'desc' },
      rowActions: () => [{ label: 'Edit' }],
      bulkActions: () => <button type="button">Archive</button>,
    });
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('sortRows and tableToCsv', () => {
  it('sorts numbers inside text naturally without changing the input', () => {
    const rows = [{ v: 'Item 10' }, { v: 'item 2' }, { v: null }, { v: 'Item 1' }];
    const sorted = sortRows(rows, { key: 'v', header: 'V' }, 'asc');
    expect(sorted.map((r) => r.v)).toEqual(['Item 1', 'item 2', 'Item 10', null]);
    expect(rows[0]!.v).toBe('Item 10');
  });

  it('exports the columns to CSV using their values', () => {
    const csv = tableToCsv(PEOPLE.slice(0, 2), [
      ...COLUMNS.slice(0, 3),
      { key: 'joined', header: <b>Joined</b>, headerText: 'Joined on' },
    ]);
    expect(csv.split('\r\n')).toEqual([
      'Name,Role,Projects,Joined on',
      'Ana Silva,Designer,12,2024-03-01T00:00:00.000Z',
      'ben Okafor,Engineer,3,2022-11-15T00:00:00.000Z',
    ]);
  });
});
