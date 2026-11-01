import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes value, range and a percentage to assistive technology', () => {
    render(<ProgressBar value={42} label="Upload" />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '42%');
  });

  it('clamps out-of-range values', () => {
    const { rerender } = render(<ProgressBar value={150} aria-label="Done" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<ProgressBar value={-5} aria-label="Done" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('is indeterminate without a value', () => {
    const { container } = render(<ProgressBar aria-label="Loading" />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).not.toHaveAttribute('aria-valuetext');
    expect(container.firstElementChild).toHaveAttribute('data-indeterminate', 'true');
  });

  it('shows a formatted value and uses a custom max', () => {
    render(
      <ProgressBar
        value={3}
        max={8}
        label="Seats taken"
        showValue
        formatValue={(v, m) => `${v} of ${m}`}
      />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Seats taken' });
    expect(bar).toHaveAttribute('aria-valuemax', '8');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 8');
    expect(screen.getByText('3 of 8')).toHaveAttribute('aria-hidden', 'true');
    const fill = bar.querySelector('.dawg-progress__fill') as HTMLElement;
    expect(fill.style.getPropertyValue('--_value')).toBe('0.375');
  });

  it('can use meter semantics, which are never indeterminate', () => {
    render(<ProgressBar semantics="meter" aria-label="Storage used" />);
    const meter = screen.getByRole('meter', { name: 'Storage used' });
    expect(meter).toHaveAttribute('aria-valuenow', '0');
  });

  it('falls back to a max of 100 when max is not a positive number', () => {
    render(<ProgressBar value={50} max={0} aria-label="x" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '100');
  });

  it('forwards refs, tone, size and props to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ProgressBar
        ref={ref}
        value={10}
        tone="danger"
        size="lg"
        className="mine"
        aria-labelledby="ext"
      />,
    );
    expect(ref.current).toHaveClass('dawg-progress', 'mine');
    expect(ref.current).toHaveAttribute('data-tone', 'danger');
    expect(ref.current).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-labelledby', 'ext');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <ProgressBar value={60} label="Profile complete" showValue />
        <ProgressBar aria-label="Loading" />
        <ProgressBar semantics="meter" value={7} max={10} label="Seats" tone="warning" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
