import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Pagination, pageItems, paginate } from './Pagination';

describe('pageItems', () => {
  it.each([
    [1, 1, [1]],
    [1, 5, [1, 2, 'gap', 5]],
    [3, 5, [1, 2, 3, 4, 5]],
    [10, 20, [1, 'gap', 9, 10, 11, 'gap', 20]],
    [20, 20, [1, 'gap', 19, 20]],
    [4, 20, [1, 2, 3, 4, 5, 'gap', 20]],
  ])('page %i of %i', (page, count, expected) => {
    expect(pageItems(page, count)).toEqual(expected);
  });

  it('keeps the current page in range and supports more siblings', () => {
    expect(pageItems(99, 3)).toEqual([1, 2, 3]);
    expect(pageItems(10, 20, 2)).toEqual([1, 'gap', 8, 9, 10, 11, 12, 'gap', 20]);
  });
});

describe('paginate', () => {
  const rows = Array.from({ length: 23 }, (_, i) => i + 1);
  it('returns one page of rows and its position', () => {
    expect(paginate(rows, 3, 10)).toEqual({
      items: [21, 22, 23],
      page: 3,
      pageCount: 3,
      from: 21,
      to: 23,
      total: 23,
    });
  });
  it('clamps the page and handles no rows', () => {
    expect(paginate(rows, 9, 10).page).toBe(3);
    expect(paginate([], 1, 10)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      from: 0,
      to: 0,
      total: 0,
    });
  });
});

describe('Pagination', () => {
  it('is a labelled nav that marks the current page', () => {
    const ref = createRef<HTMLElement>();
    render(<Pagination ref={ref} page={10} pageCount={20} onPageChange={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(ref.current).toBe(nav);
    expect(screen.getByRole('button', { name: 'Page 10' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Page 5' })).toBeNull();
    expect(screen.getByText('Page 10 of 20')).toHaveClass('dawg-pagination__compact');
  });

  it('calls onPageChange from the numbers and the steps', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' })); // current: no-op
    expect(onPageChange.mock.calls).toEqual([[4], [1], [3]]);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    rerender(<Pagination page={3} pageCount={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('renders links when getHref is given', () => {
    render(<Pagination page={1} pageCount={3} getHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '?page=2');
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '?page=2');
    const previous = screen.getByRole('link', { name: 'Previous' });
    expect(previous).not.toHaveAttribute('href');
    expect(previous).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows a summary and takes translated labels', () => {
    render(
      <Pagination
        page={2}
        pageCount={4}
        onPageChange={() => {}}
        summary="Mostrando 11–20 de 35"
        label="Paginación"
        previousLabel="Anterior"
        nextLabel="Siguiente"
        pageLabel={(p) => `Página ${p}`}
        compactLabel={(p, n) => `Página ${p} de ${n}`}
      />,
    );
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toHaveTextContent(
      'Mostrando 11–20 de 35',
    );
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument();
    expect(screen.getByText('Página 2 de 4')).toBeInTheDocument();
  });

  it('has no axe violations as buttons or links', async () => {
    const { container } = render(
      <>
        <Pagination page={5} pageCount={12} onPageChange={() => {}} summary="41–50 of 120" />
        <Pagination page={1} pageCount={3} getHref={(p) => `#p${p}`} label="Results pages" />
      </>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
