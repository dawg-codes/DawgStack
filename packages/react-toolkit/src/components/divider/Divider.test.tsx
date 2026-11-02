import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders a horizontal <hr> separator by default', () => {
    render(<Divider />);
    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('HR');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-spacing', 'md');
  });

  it('renders a vertical separator with aria-orientation', () => {
    render(<Divider orientation="vertical" />);
    const separator = screen.getByRole('separator');
    expect(separator.tagName).toBe('DIV');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('hides decorative dividers from assistive technology', () => {
    const { container } = render(<Divider decorative />);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps a label readable by screen readers', () => {
    render(<Divider label="or" />);
    expect(screen.queryByRole('separator')).toBeNull();
    expect(screen.getByText('or')).toHaveClass('dawg-divider__label');
    expect(screen.getByText('or').parentElement).toHaveAttribute('data-labelled');
  });

  it('forwards refs and props', () => {
    const ref = createRef<HTMLElement>();
    render(<Divider ref={ref} spacing="lg" className="mine" />);
    expect(ref.current).toBe(screen.getByRole('separator'));
    expect(ref.current).toHaveClass('dawg-divider', 'mine');
    expect(ref.current).toHaveAttribute('data-spacing', 'lg');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <p>Above</p>
        <Divider />
        <div style={{ display: 'flex' }}>
          <span>Left</span>
          <Divider orientation="vertical" />
          <span>Right</span>
        </div>
        <Divider label="or" />
        <Divider decorative />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
