import type { Channel, Order, OrderStatus, Range, Stat } from './types';

/** Made-up demo data. Delete this file once src/data/api.ts talks to your backend. */

const FIRST = [
  'Ana',
  'Ben',
  'Chen',
  'Dara',
  'Eli',
  'Fatima',
  'Gus',
  'Hana',
  'Ivan',
  'Jo',
  'Kiri',
  'Leo',
];
const LAST = ['Silva', 'Okafor', 'Li', 'Novak', 'Haddad', 'Moreau', 'Tanaka', 'Rossi', 'Ndiaye'];
const STATUSES: OrderStatus[] = [
  'paid',
  'paid',
  'paid',
  'pending',
  'paid',
  'refunded',
  'paid',
  'failed',
];
const NOW = Date.UTC(2026, 9, 31, 12);

export const sampleOrders: Order[] = Array.from({ length: 48 }, (_, i) => {
  const first = FIRST[(i * 5) % FIRST.length]!;
  const last = LAST[(i * 7) % LAST.length]!;
  return {
    id: `ORD-${String(1048 - i).padStart(4, '0')}`,
    customer: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    total: Math.round((19 + ((i * 37) % 260) + ((i * 13) % 100) / 100) * 100) / 100,
    items: 1 + ((i * 3) % 5),
    status: STATUSES[i % STATUSES.length]!,
    placedAt: new Date(NOW - i * 7.5 * 3_600_000),
  };
});

const SCALE: Record<Range, number> = { '7d': 1, '30d': 4.2, '90d': 12.6 };

export function sampleStats(range: Range): Stat[] {
  const s = SCALE[range];
  return [
    {
      id: 'revenue',
      label: 'Revenue',
      value: Math.round(18_420 * s),
      format: 'money',
      change: 0.124,
      higherIsBetter: true,
    },
    {
      id: 'orders',
      label: 'Orders',
      value: Math.round(312 * s),
      format: 'number',
      change: 0.068,
      higherIsBetter: true,
    },
    {
      id: 'customers',
      label: 'New customers',
      value: Math.round(87 * s),
      format: 'number',
      change: -0.031,
      higherIsBetter: true,
    },
    {
      id: 'refunds',
      label: 'Refund rate',
      value: 0.021,
      format: 'percent',
      change: -0.15,
      higherIsBetter: false,
    },
  ];
}

export const sampleChannels: Channel[] = [
  { name: 'Online store', share: 0.58 },
  { name: 'Marketplace', share: 0.24 },
  { name: 'Retail', share: 0.12 },
  { name: 'Wholesale', share: 0.06 },
];
