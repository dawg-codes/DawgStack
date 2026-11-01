import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is decorative and hidden from assistive technology without a label', () => {
    const { container } = render(<Spinner />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).not.toHaveAttribute('role');
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('announces its label as a status, visually hidden by default', () => {
    render(<Spinner label="Loading results" />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading results');
    expect(screen.getByText('Loading results')).toHaveClass('dawg-visually-hidden');
  });

  it('can show the label on screen', () => {
    render(<Spinner label="Saving" showLabel />);
    expect(screen.getByText('Saving')).toHaveClass('dawg-spinner__label');
  });

  it('exposes size as a data attribute and forwards refs and props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} size="lg" className="mine" data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el).toHaveAttribute('data-size', 'lg');
    expect(el).toHaveClass('dawg-spinner', 'mine');
    expect(ref.current).toBe(el);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Spinner />
        <Spinner label="Loading" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
