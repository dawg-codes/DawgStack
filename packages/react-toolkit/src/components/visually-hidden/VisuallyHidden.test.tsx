import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps text available to assistive technology', () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close dialog</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole('button', { name: 'Close dialog' })).toBeInTheDocument();
  });

  it('merges class names and forwards refs and props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <VisuallyHidden ref={ref} className="extra" data-testid="vh">
        Hidden
      </VisuallyHidden>,
    );
    const el = screen.getByTestId('vh');
    expect(el).toHaveClass('dawg-visually-hidden', 'extra');
    expect(ref.current).toBe(el);
  });
});
