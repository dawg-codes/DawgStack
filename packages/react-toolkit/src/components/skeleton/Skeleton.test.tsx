import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders an animated rect hidden from assistive technology by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass('dawg-skeleton');
    expect(el).toHaveAttribute('data-variant', 'rect');
    expect(el).toHaveAttribute('data-animated', 'true');
    expect(el).toHaveAttribute('aria-hidden', 'true');
  });

  it('turns numeric sizes into pixels and passes strings through', () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--_w')).toBe('120px');
    expect(el.style.getPropertyValue('--_h')).toBe('2rem');
  });

  it('draws several text lines in a hidden group, marking the last one', () => {
    const { container } = render(<Skeleton variant="text" lines={3} width="80%" />);
    const group = container.firstElementChild as HTMLElement;
    expect(group).toHaveClass('dawg-skeleton-group');
    expect(group).toHaveAttribute('aria-hidden', 'true');
    expect(group.style.getPropertyValue('--_w')).toBe('80%');
    const lines = group.querySelectorAll('.dawg-skeleton');
    expect(lines).toHaveLength(3);
    expect(lines[2]).toHaveAttribute('data-last', 'true');
    expect(lines[0]).not.toHaveAttribute('data-last');
  });

  it('supports circles, turning animation off, refs and custom styles', () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <Skeleton ref={ref} variant="circle" width={48} animated={false} style={{ margin: 4 }} />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(ref.current).toBe(el);
    expect(el).toHaveAttribute('data-variant', 'circle');
    expect(el).not.toHaveAttribute('data-animated');
    expect(el.style.margin).toBe('4px');
  });

  it('has no accessibility violations inside a busy region', async () => {
    const { container } = render(
      <section aria-busy="true" aria-label="Recent activity">
        <Skeleton variant="circle" />
        <Skeleton variant="text" lines={2} />
        <Skeleton height={120} />
      </section>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
