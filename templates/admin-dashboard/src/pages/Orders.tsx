import { useMemo, useState } from 'react';
import { Button, EmptyState } from '@dawg-codes/react-toolkit';
import { downloadCsv } from '@dawg-codes/react-toolkit/csv';
import { ConfirmDialog, Dialog } from '@dawg-codes/react-toolkit/dialog';
import { SearchField, SelectField } from '@dawg-codes/react-toolkit/form';
import { PageHeader } from '@dawg-codes/react-toolkit/layout';
import { Pagination, paginate } from '@dawg-codes/react-toolkit/pagination';
import {
  DataTable,
  sortRows,
  tableToCsv,
  type DataTableColumn,
  type SortState,
} from '@dawg-codes/react-toolkit/table';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { DownloadIcon, EyeIcon, RefundIcon } from '../components/icons';
import { LoadError, OrderCell, OrderStatusBadge, orderStatusLabel } from '../components/parts';
import { loadOrders, refundOrder } from '../data/api';
import type { Order, OrderStatus } from '../data/types';
import { useLoad } from '../data/useLoad';
import { formatDate, formatMoney } from '../format';
import { useIsNarrow } from '../useMediaQuery';

const PAGE_SIZE = 10;
const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'failed', label: 'Failed' },
];

const COLUMNS: DataTableColumn<Order>[] = [
  {
    key: 'id',
    header: 'Order',
    rowHeader: true,
    sortable: true,
    cell: (o) => <OrderCell order={o} />,
  },
  {
    key: 'customer',
    header: 'Customer',
    sortable: true,
    hideBelow: 'md',
    cell: (o) => (
      <span className="two-line">
        {o.customer}
        <span className="two-line__sub">{o.email}</span>
      </span>
    ),
  },
  {
    key: 'placedAt',
    header: 'Date',
    headerText: 'Date',
    sortable: true,
    hideBelow: 'md',
    cell: (o) => formatDate(o.placedAt),
  },
  { key: 'items', header: 'Items', align: 'end', hideBelow: 'lg' },
  {
    key: 'total',
    header: 'Total',
    align: 'end',
    sortable: true,
    cell: (o) => formatMoney(o.total),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    cell: (o) => <OrderStatusBadge status={o.status} />,
    value: (o) => orderStatusLabel(o.status),
  },
];

export function Orders() {
  const { toast } = useToast();
  const { state, retry, update } = useLoad(loadOrders, []);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortState | null>({ key: 'placedAt', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [refunding, setRefunding] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const narrow = useIsNarrow();

  const orders = useMemo(() => (state.status === 'ready' ? state.data : []), [state]);
  // Filter and sort the whole list first, then show one page of it.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = orders.filter(
      (o) =>
        (!status || o.status === status) &&
        (!q || [o.id, o.customer, o.email].some((text) => text.toLowerCase().includes(q))),
    );
    const column = sort && COLUMNS.find((c) => c.key === sort.key);
    return column ? sortRows(matches, column, sort.direction) : matches;
  }, [orders, query, status, sort]);
  const current = paginate(filtered, page, PAGE_SIZE);

  async function confirmRefund() {
    if (!refunding) return;
    setBusy(true);
    try {
      const refunded = await refundOrder(refunding.id);
      update(orders.map((o) => (o.id === refunded.id ? refunded : o)));
      setViewing((v) => (v?.id === refunded.id ? refunded : v));
      toast({ title: `${refunded.id} refunded`, tone: 'success' });
      setRefunding(null);
    } catch {
      toast({ title: "Couldn't refund the order. Try again.", tone: 'danger', duration: Infinity });
    } finally {
      setBusy(false);
    }
  }

  const resetFilters = () => {
    setQuery('');
    setStatus('');
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Search, sort and refund orders."
        actions={
          <Button
            startIcon={<DownloadIcon />}
            disabled={state.status !== 'ready'}
            onClick={() => downloadCsv(tableToCsv(filtered, COLUMNS), 'orders')}
          >
            Export CSV
          </Button>
        }
      />
      {state.status === 'error' ? (
        <LoadError what="orders" onRetry={retry} />
      ) : (
        <div className="page-stack">
          <div className="toolbar">
            <SearchField
              label="Search orders"
              hideLabel
              placeholder="Search by order, name or email"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
            <SelectField
              label="Status"
              hideLabel
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <DataTable
            caption="Orders"
            hideCaption
            columns={COLUMNS}
            rows={current.items}
            getRowId={(o) => o.id}
            density={narrow ? 'compact' : 'comfortable'}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            manualSort
            loading={state.status === 'loading'}
            loadingRows={PAGE_SIZE}
            getRowLabel={(o) => o.id}
            rowActions={(o) => [
              { label: 'View details', icon: <EyeIcon />, onSelect: () => setViewing(o) },
              {
                label: 'Refund',
                icon: <RefundIcon />,
                tone: 'danger',
                disabled: o.status !== 'paid',
                onSelect: () => setRefunding(o),
              },
            ]}
            empty={
              <EmptyState
                size="sm"
                title="No orders match"
                description="Try a different search or status."
                action={
                  <Button size="sm" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
          <Pagination
            page={current.page}
            pageCount={current.pageCount}
            onPageChange={setPage}
            summary={
              state.status === 'ready'
                ? current.total
                  ? `Showing ${current.from}–${current.to} of ${current.total}`
                  : 'No orders'
                : 'Loading…'
            }
          />
        </div>
      )}

      <Dialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        placement="end"
        title={viewing ? `Order ${viewing.id}` : 'Order'}
        description={viewing ? `Placed by ${viewing.customer}` : undefined}
        footer={
          viewing?.status === 'paid' && (
            <Button variant="danger" onClick={() => setRefunding(viewing)}>
              Refund
            </Button>
          )
        }
      >
        {viewing && (
          <dl className="details">
            <dt>Status</dt>
            <dd>
              <OrderStatusBadge status={viewing.status} />
            </dd>
            <dt>Placed</dt>
            <dd>{formatDate(viewing.placedAt)}</dd>
            <dt>Items</dt>
            <dd>{viewing.items}</dd>
            <dt>Total</dt>
            <dd>{formatMoney(viewing.total)}</dd>
            <dt>Email</dt>
            <dd>{viewing.email}</dd>
          </dl>
        )}
      </Dialog>

      <ConfirmDialog
        open={refunding !== null}
        title={refunding ? `Refund ${refunding.id}?` : 'Refund order?'}
        description={
          refunding
            ? `${refunding.customer} will get ${formatMoney(refunding.total)} back. This can't be undone.`
            : undefined
        }
        confirmLabel={refunding ? `Refund ${formatMoney(refunding.total)}` : 'Refund'}
        tone="danger"
        loading={busy}
        onConfirm={confirmRefund}
        onCancel={() => setRefunding(null)}
      />
    </>
  );
}
