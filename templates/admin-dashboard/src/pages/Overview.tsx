import { useState } from 'react';
import { Card, ProgressBar, Skeleton } from '@dawg-codes/react-toolkit';
import { SelectField } from '@dawg-codes/react-toolkit/form';
import { PageHeader } from '@dawg-codes/react-toolkit/layout';
import { DataTable, type DataTableColumn } from '@dawg-codes/react-toolkit/table';
import { appConfig } from '../app.config';
import {
  LoadError,
  OrderCell,
  OrderStatusBadge,
  Panel,
  orderStatusLabel,
} from '../components/parts';
import { TrendDownIcon, TrendUpIcon } from '../components/icons';
import { loadOverview } from '../data/api';
import type { Order, Range, Stat } from '../data/types';
import { useLoad } from '../data/useLoad';
import { formatChange, formatDate, formatMoney, formatNumber } from '../format';
import { href } from '../router';

const RANGES: { value: Range; label: string; previous: string }[] = [
  { value: '7d', label: 'Last 7 days', previous: 'previous 7 days' },
  { value: '30d', label: 'Last 30 days', previous: 'previous 30 days' },
  { value: '90d', label: 'Last 90 days', previous: 'previous 90 days' },
];

const RECENT_COLUMNS: DataTableColumn<Order>[] = [
  { key: 'id', header: 'Order', rowHeader: true, cell: (o) => <OrderCell order={o} /> },
  { key: 'customer', header: 'Customer', hideBelow: 'md' },
  { key: 'placedAt', header: 'Date', hideBelow: 'lg', cell: (o) => formatDate(o.placedAt) },
  { key: 'total', header: 'Total', align: 'end', cell: (o) => formatMoney(o.total) },
  {
    key: 'status',
    header: 'Status',
    cell: (o) => <OrderStatusBadge status={o.status} />,
    value: (o) => orderStatusLabel(o.status),
  },
];

export function Overview() {
  const [range, setRange] = useState<Range>('30d');
  const { state, retry } = useLoad((signal) => loadOverview(range, signal), [range]);
  const loading = state.status === 'loading';
  const previous = RANGES.find((r) => r.value === range)!.previous;

  return (
    <>
      <PageHeader
        title="Overview"
        description={`How ${appConfig.name} is doing.`}
        actions={
          <SelectField
            label="Date range"
            hideLabel
            options={RANGES}
            value={range}
            onChange={(event) => setRange(event.target.value as Range)}
          />
        }
      />
      {state.status === 'error' ? (
        <LoadError what="the overview" onRetry={retry} />
      ) : (
        <div className="page-stack" aria-busy={loading || undefined}>
          <ul className="stat-grid" aria-label="Key numbers">
            {loading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Card as="li" key={i} className="stat">
                    <Skeleton variant="text" width="45%" />
                    <Skeleton height="2rem" width="60%" />
                    <Skeleton variant="text" width="75%" />
                  </Card>
                ))
              : state.data.stats.map((stat) => (
                  <StatCard key={stat.id} stat={stat} previous={previous} />
                ))}
          </ul>

          <div className="overview-columns">
            <Panel title="Sales by channel" description="Share of revenue in this period.">
              <div className="channel-list">
                {loading
                  ? Array.from({ length: 4 }, (_, i) => (
                      <Skeleton key={i} variant="text" lines={2} />
                    ))
                  : state.data.channels.map((channel) => (
                      <ProgressBar
                        key={channel.name}
                        semantics="meter"
                        label={channel.name}
                        value={Math.round(channel.share * 100)}
                        showValue
                      />
                    ))}
              </div>
            </Panel>
            <Panel
              title="Recent orders"
              actions={
                appConfig.pages.orders && (
                  <a className="panel__link" href={href('orders')}>
                    View all orders
                  </a>
                )
              }
            >
              <DataTable
                caption="The 5 most recent orders"
                hideCaption
                density="compact"
                columns={RECENT_COLUMNS}
                rows={state.status === 'ready' ? state.data.recentOrders : []}
                getRowId={(o) => o.id}
                loading={loading}
                empty="No orders yet."
              />
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}

function StatCard({ stat, previous }: { stat: Stat; previous: string }) {
  const value =
    stat.format === 'money'
      ? formatMoney(stat.value)
      : stat.format === 'percent'
        ? `${(stat.value * 100).toFixed(1)}%`
        : formatNumber(stat.value);
  const rising = stat.change >= 0;
  const good = rising === stat.higherIsBetter;
  return (
    <Card as="li" className="stat">
      <p className="stat__label">{stat.label}</p>
      <p className="stat__value">{value}</p>
      <p className="stat__change" data-good={good || undefined}>
        <span className="stat__delta">
          {rising ? <TrendUpIcon /> : <TrendDownIcon />}
          {formatChange(stat.change)}
        </span>{' '}
        <span className="stat__vs">vs {previous}</span>
      </p>
    </Card>
  );
}
