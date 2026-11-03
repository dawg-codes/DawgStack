import type { ReactNode } from 'react';
import {
  Button,
  Card,
  EmptyState,
  createStatusBadge,
  type StatusMap,
} from '@dawg-codes/react-toolkit';
import { appConfig } from '../app.config';
import type { Order, OrderStatus } from '../data/types';

/** Logo and app name. Replace the SVG with your own logo. */
export function Brand() {
  return (
    <a className="brand" href="#/overview">
      <svg className="brand__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" />
        <path d="M10 17l4 4 8-9" />
      </svg>
      <span className="brand__name">{appConfig.name}</span>
    </a>
  );
}

const ORDER_STATUS: StatusMap<OrderStatus> = {
  paid: { label: 'Paid', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  refunded: { label: 'Refunded', tone: 'neutral' },
  failed: { label: 'Failed', tone: 'danger' },
};
/** An order's status as a coloured label. Change the wording and colours above. */
export const OrderStatusBadge = createStatusBadge(ORDER_STATUS, {
  displayName: 'OrderStatusBadge',
});
export const orderStatusLabel = (status: OrderStatus) => ORDER_STATUS[status].label;

/**
 * The order number, with the customer's name under it on narrow screens, where tables hide
 * their Customer column (`hideBelow: 'md'`).
 */
export function OrderCell({ order }: { order: Order }) {
  return (
    <span className="two-line">
      <span className="nowrap">{order.id}</span>
      <span className="two-line__sub narrow-only">{order.customer}</span>
    </span>
  );
}

/** Shown when a page's data fails to load. */
export function LoadError({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <Card>
      <EmptyState
        title={`We couldn't load ${what}`}
        description="Check your connection, then try again."
        action={<Button onClick={onRetry}>Try again</Button>}
      />
    </Card>
  );
}

/** A titled card section used on the overview and settings pages. */
export function Panel({
  title,
  description,
  actions,
  children,
  id,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  const headingId = `${id ?? title.toLowerCase().replace(/\W+/g, '-')}-heading`;
  return (
    <Card as="section" aria-labelledby={headingId} className="panel">
      <div className="panel__header">
        <div>
          <h2 id={headingId} className="panel__title">
            {title}
          </h2>
          {description && <p className="panel__description">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}
