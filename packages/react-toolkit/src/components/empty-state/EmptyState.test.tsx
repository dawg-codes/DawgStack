import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders a title (h3 by default), description and action', () => {
    render(
      <EmptyState
        icon={<svg data-testid="icon" />}
        title="No projects yet"
        description="Create a project to get started."
        action={<button type="button">Create project</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'No projects yet' })).toBeInTheDocument();
    expect(screen.getByText('Create a project to get started.')).toHaveClass(
      'dawg-empty-state__description',
    );
    expect(screen.getByRole('button', { name: 'Create project' }).parentElement).toHaveClass(
      'dawg-empty-state__actions',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the requested heading level', () => {
    render(<EmptyState title="Nothing here" headingLevel={2} />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('omits optional parts and renders extra children', () => {
    const { container } = render(
      <EmptyState title="Empty">
        <a href="/help">Learn more</a>
      </EmptyState>,
    );
    expect(container.querySelector('.dawg-empty-state__icon')).toBeNull();
    expect(container.querySelector('.dawg-empty-state__description')).toBeNull();
    expect(container.querySelector('.dawg-empty-state__actions')).toBeNull();
    expect(screen.getByRole('link', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('forwards refs, size, alignment and props', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="T" size="sm" align="start" className="mine" />);
    expect(ref.current).toHaveClass('dawg-empty-state', 'mine');
    expect(ref.current).toHaveAttribute('data-size', 'sm');
    expect(ref.current).toHaveAttribute('data-align', 'start');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <EmptyState
        icon={<svg />}
        title="No results"
        description="Try a different search."
        action={<button type="button">Clear filters</button>}
      />,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
