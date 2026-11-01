import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Button, buttonStyleProps, type ButtonVariant } from './Button';

const icon = <svg data-testid="icon" viewBox="0 0 16 16" />;

describe('Button', () => {
  it('renders a type="button" secondary md button by default', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'secondary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveClass('dawg-button');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'outline', 'ghost', 'danger'])(
    'supports the %s variant',
    (variant) => {
      render(<Button variant={variant}>Go</Button>);
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
    },
  );

  it('calls onClick and responds to Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await user.click(screen.getByRole('button'));
    await user.tab();
    await user.tab({ shift: true });
    expect(screen.getByRole('button')).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not fire clicks when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps focus and its accessible name while loading, and ignores clicks', async () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save changes</Button>);
    const button = screen.getByRole('button', { name: 'Save changes' });
    button.focus();
    rerender(
      <Button onClick={onClick} loading>
        Save changes
      </Button>,
    );
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBe(button);
    expect(button.querySelector('.dawg-button__spinner')).toHaveAttribute('aria-hidden', 'true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not submit its form while loading', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Send
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits its form when not loading', () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Send</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('treats aria-disabled as a focusable disabled state', async () => {
    const onClick = vi.fn();
    render(
      <Button aria-disabled onClick={onClick}>
        Publish
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders start and end icons hidden from assistive technology', () => {
    render(
      <Button startIcon={icon} endIcon={<svg data-testid="end" />}>
        Add
      </Button>,
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('end').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('supports icon-only buttons named by aria-label', () => {
    render(
      <Button iconOnly aria-label="Delete item">
        {icon}
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Delete item' });
    expect(button).toHaveAttribute('data-icon-only', 'true');
  });

  it('forwards refs, class names and extra props', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} className="mine" size="lg" fullWidth data-testid="b">
        Go
      </Button>,
    );
    const button = screen.getByTestId('b');
    expect(ref.current).toBe(button);
    expect(button).toHaveClass('dawg-button', 'mine');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveAttribute('data-full-width', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="outline" loading>
          Loading
        </Button>
        <Button disabled>Disabled</Button>
        <Button iconOnly aria-label="Settings">
          {icon}
        </Button>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('buttonStyleProps', () => {
  it('returns the class and data attributes for styling any element as a button', () => {
    expect(buttonStyleProps({ variant: 'primary', size: 'sm' })).toEqual({
      className: 'dawg-button',
      'data-variant': 'primary',
      'data-size': 'sm',
      'data-full-width': undefined,
      'data-icon-only': undefined,
    });
  });

  it('styles a link without changing its role', () => {
    render(
      <a href="/new" {...buttonStyleProps({ variant: 'primary' })}>
        New project
      </a>,
    );
    const link = screen.getByRole('link', { name: 'New project' });
    expect(link).toHaveClass('dawg-button');
    expect(link).toHaveAttribute('data-variant', 'primary');
  });
});
