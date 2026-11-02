import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axeViolations } from '../../../test/a11y';
import { Badge, type BadgeTone, type BadgeVariant } from './Badge';
import { StatusBadge, createStatusBadge, type StatusMap } from './StatusBadge';

describe('Badge', () => {
  it('renders a neutral soft md badge by default', () => {
    render(<Badge data-testid="b">Draft</Badge>);
    const badge = screen.getByTestId('b');
    expect(badge).toHaveClass('dawg-badge');
    expect(badge).toHaveAttribute('data-tone', 'neutral');
    expect(badge).toHaveAttribute('data-variant', 'soft');
    expect(badge).toHaveAttribute('data-size', 'md');
    expect(badge).toHaveTextContent('Draft');
  });

  it.each<BadgeTone>(['neutral', 'primary', 'info', 'success', 'warning', 'danger'])(
    'supports the %s tone',
    (tone) => {
      render(
        <Badge tone={tone} data-testid="b">
          x
        </Badge>,
      );
      expect(screen.getByTestId('b')).toHaveAttribute('data-tone', tone);
    },
  );

  it.each<BadgeVariant>(['soft', 'solid', 'outline'])('supports the %s variant', (variant) => {
    render(
      <Badge variant={variant} data-testid="b">
        x
      </Badge>,
    );
    expect(screen.getByTestId('b')).toHaveAttribute('data-variant', variant);
  });

  it('hides the icon and dot from assistive technology', () => {
    render(
      <Badge icon={<svg data-testid="icon" />} dot="pulse" data-testid="b">
        Live
      </Badge>,
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    const dot = screen.getByTestId('b').querySelector('.dawg-badge__dot');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
    expect(dot).toHaveAttribute('data-pulse', 'true');
    expect(screen.getByTestId('b')).toHaveTextContent(/^Live$/);
  });

  it('forwards refs and props', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="mine" title="Status" size="sm">
        x
      </Badge>,
    );
    expect(ref.current).toHaveClass('dawg-badge', 'mine');
    expect(ref.current).toHaveAttribute('title', 'Status');
    expect(ref.current).toHaveAttribute('data-size', 'sm');
  });
});

type OrderStatus = 'pending' | 'paid' | 'refunded';
const ORDER: StatusMap<OrderStatus> = {
  pending: { label: 'Pending', tone: 'warning', dot: true },
  paid: { label: 'Paid', tone: 'success' },
  refunded: { label: 'Refunded' },
};

describe('StatusBadge', () => {
  it('shows the label and tone defined for the status', () => {
    render(<StatusBadge status="paid" statuses={ORDER} data-testid="b" />);
    const badge = screen.getByTestId('b');
    expect(badge).toHaveTextContent('Paid');
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge).toHaveAttribute('data-status', 'paid');
  });

  it('defaults the tone to neutral and passes through the dot', () => {
    const { rerender } = render(<StatusBadge status="refunded" statuses={ORDER} data-testid="b" />);
    expect(screen.getByTestId('b')).toHaveAttribute('data-tone', 'neutral');
    rerender(<StatusBadge status="pending" statuses={ORDER} data-testid="b" />);
    expect(screen.getByTestId('b').querySelector('.dawg-badge__dot')).not.toBeNull();
  });

  it('falls back to a neutral badge with the raw value for unknown statuses', () => {
    const statuses = ORDER as StatusMap<string>;
    render(<StatusBadge status="disputed" statuses={statuses} data-testid="b" />);
    expect(screen.getByTestId('b')).toHaveTextContent('disputed');
    expect(screen.getByTestId('b')).toHaveAttribute('data-tone', 'neutral');
  });

  it('never resolves inherited object keys such as "constructor"', () => {
    const statuses = ORDER as StatusMap<string>;
    render(<StatusBadge status="constructor" statuses={statuses} data-testid="b" />);
    expect(screen.getByTestId('b')).toHaveTextContent('constructor');
  });

  it('uses a custom fallback when given', () => {
    const statuses = ORDER as StatusMap<string>;
    render(
      <StatusBadge
        status="??"
        statuses={statuses}
        fallback={{ label: 'Unknown', tone: 'danger' }}
        data-testid="b"
      />,
    );
    expect(screen.getByTestId('b')).toHaveTextContent('Unknown');
    expect(screen.getByTestId('b')).toHaveAttribute('data-tone', 'danger');
  });

  it('createStatusBadge binds a status map into a reusable component', () => {
    const Order = createStatusBadge(ORDER, { displayName: 'OrderStatus' });
    const ref = createRef<HTMLSpanElement>();
    render(<Order ref={ref} status="pending" variant="solid" />);
    expect(Order.displayName).toBe('OrderStatus');
    expect(ref.current).toHaveTextContent('Pending');
    expect(ref.current).toHaveAttribute('data-tone', 'warning');
    expect(ref.current).toHaveAttribute('data-variant', 'solid');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <p>
        Order <StatusBadge status="paid" statuses={ORDER} />{' '}
        <Badge tone="danger" variant="solid" icon={<svg />}>
          Overdue
        </Badge>{' '}
        <Badge variant="outline" dot="pulse">
          Live
        </Badge>
      </p>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
