import { useEffect, useMemo, useState } from 'react';
import { Button, EmptyState } from '@dawg-codes/react-toolkit';
import { downloadCsv } from '@dawg-codes/react-toolkit/csv';
import { ConfirmDialog } from '@dawg-codes/react-toolkit/dialog';
import { SearchField, SelectField } from '@dawg-codes/react-toolkit/form';
import { PageHeader } from '@dawg-codes/react-toolkit/layout';
import type { MenuItem } from '@dawg-codes/react-toolkit/menu';
import { Pagination, paginate } from '@dawg-codes/react-toolkit/pagination';
import {
  DataTable,
  sortRows,
  tableToCsv,
  type DataTableColumn,
  type SortState,
} from '@dawg-codes/react-toolkit/table';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { appConfig } from '../app.config';
import {
  DownloadIcon,
  EyeIcon,
  KeyIcon,
  MailIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons';
import { InviteDialog } from '../components/InviteDialog';
import { LoadError, UserCell, UserStatusBadge, isYou, statusLabel } from '../components/parts';
import { RoleDialog } from '../components/RoleDialog';
import { UserPanel, type UserActions } from '../components/UserPanel';
import {
  changeRole,
  loadUsers,
  reactivateUsers,
  removeUsers,
  resendInvite,
  suspendUsers,
} from '../data/api';
import type { Role, User, UserStatus } from '../data/types';
import { useLoad } from '../data/useLoad';
import { formatDate, formatRelative } from '../format';
import { errorMessage, people, type Action } from '../messages';
import { ROLES, ROLE_ORDER, roleLabel } from '../roles';
import { useIsNarrow } from '../useMediaQuery';

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'invited', label: 'Invited' },
  { value: 'suspended', label: 'Suspended' },
];
const ROLE_OPTIONS = ROLE_ORDER.map((value) => ({ value, label: ROLES[value].label }));

const COLUMNS: DataTableColumn<User>[] = [
  {
    key: 'name',
    header: 'Name',
    rowHeader: true,
    sortable: true,
    cell: (u) => <UserCell user={u} />,
  },
  { key: 'role', header: 'Role', sortable: true, value: (u) => roleLabel(u.role) },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    hideBelow: 'md',
    cell: (u) => <UserStatusBadge status={u.status} />,
    value: (u) => statusLabel(u.status),
  },
  {
    key: 'lastActiveAt',
    header: 'Last active',
    sortable: true,
    hideBelow: 'lg',
    cell: (u) => (u.lastActiveAt ? formatRelative(u.lastActiveAt) : 'Not yet'),
  },
  {
    key: 'addedAt',
    header: 'Added',
    sortable: true,
    hideBelow: 'lg',
    cell: (u) => formatDate(u.addedAt),
  },
];

/** How some columns sort, when that differs from what they show: roles by rank, not A–Z. */
const SORT_BY: Partial<Record<string, (u: User) => unknown>> = {
  role: (u) => ROLE_ORDER.indexOf(u.role),
  status: (u) => STATUS_OPTIONS.findIndex((s) => s.value === u.status),
  lastActiveAt: (u) => u.lastActiveAt ?? '',
};

/** The columns in Export CSV. */
const EXPORT_COLUMNS: DataTableColumn<User>[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', value: (u) => roleLabel(u.role) },
  { key: 'status', header: 'Status', value: (u) => statusLabel(u.status) },
  { key: 'lastActiveAt', header: 'Last active', value: (u) => u.lastActiveAt ?? '' },
  { key: 'addedAt', header: 'Added' },
];

const isRole = (value: string | null): value is Role => ROLE_ORDER.includes(value as Role);

export function Users({ params }: { params: URLSearchParams }) {
  const { toast } = useToast();
  const narrow = useIsNarrow();
  const { state, retry, update } = useLoad(loadUsers, []);
  const users = useMemo(() => (state.status === 'ready' ? state.data : []), [state]);

  // Filters. A link such as #/users?role=admin opens with that role chosen.
  const [query, setQuery] = useState('');
  const [role, setRole] = useState(() => {
    const fromLink = params.get('role');
    return isRole(fromLink) ? fromLink : '';
  });
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<SortState | null>({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  // Dialogs and the details panel.
  const [inviting, setInviting] = useState(false);
  const [roleFor, setRoleFor] = useState<User[]>([]);
  const [removing, setRemoving] = useState<{ users: User[]; open: boolean }>({
    users: [],
    open: false,
  });
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const viewing = users.find((u) => u.id === viewingId) ?? null;

  // After removing people, the button focus would go back to may have gone with their row.
  // This runs once the dialogs have closed; if focus was left on nothing, it moves to the
  // page heading, so keyboard and screen reader users keep their place.
  const [removedCount, setRemovedCount] = useState(0);
  useEffect(() => {
    if (!removedCount) return;
    const timer = setTimeout(() => {
      const active = document.activeElement;
      const lost = !active || active === document.body || active.closest('dialog:not([open])');
      if (!lost) return;
      const heading = document.querySelector<HTMLElement>('main h1');
      if (!heading) return;
      heading.tabIndex = -1;
      heading.focus();
    });
    return () => clearTimeout(timer);
  }, [removedCount]);

  // Filter and sort the whole list first, then show one page of it.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = users.filter(
      (u) =>
        (!role || u.role === role) &&
        (!status || u.status === status) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)),
    );
    const column = sort && COLUMNS.find((c) => c.key === sort.key);
    if (!column) return matches;
    return sortRows(
      matches,
      { ...column, value: SORT_BY[column.key] ?? column.value },
      sort.direction,
    );
  }, [users, query, role, status, sort]);
  const current = paginate(filtered, page, appConfig.pageSize);

  const byIds = (ids: readonly string[]) => users.filter((u) => ids.includes(u.id));
  const filterChanged = () => {
    setPage(1);
    setSelected([]); // don't act on rows that are no longer shown
  };

  /** Runs a request, shows its result and keeps the list in step with the server. */
  async function run<T>(action: Action, request: () => Promise<T>, done: (result: T) => void) {
    setBusy(true);
    try {
      done(await request());
    } catch (error) {
      toast({ tone: 'danger', title: errorMessage(error, action), duration: Infinity });
    } finally {
      setBusy(false);
    }
  }
  const merge = (changed: User[]) =>
    update((list) => list.map((u) => changed.find((c) => c.id === u.id) ?? u));
  const who = (list: User[]) => (list.length === 1 ? list[0]!.name : people(list.length));

  function saveRole(next: Role) {
    const targets = roleFor;
    if (targets.every((u) => u.role === next)) {
      setRoleFor([]);
      return;
    }
    void run(
      'role',
      () =>
        changeRole(
          targets.map((u) => u.id),
          next,
        ),
      (changed) => {
        merge(changed);
        setRoleFor([]);
        setSelected([]);
        toast({
          tone: 'success',
          title: `${who(targets)} now ${targets.length === 1 ? 'has' : 'have'} the ${ROLES[next].label} role`,
        });
      },
    );
  }

  function suspend(targets: User[]) {
    void run(
      'suspend',
      () => suspendUsers(targets.map((u) => u.id)),
      (changed) => {
        merge(changed);
        setSelected([]);
        if (!changed.length) {
          toast({
            tone: 'info',
            title: 'Nobody to suspend',
            description: 'Only active people can be suspended.',
          });
          return;
        }
        toast({
          title: `Suspended ${who(changed)}`,
          description: 'They can’t sign in until they’re reactivated.',
          action: { label: 'Undo', onClick: () => reactivate(changed, true) },
        });
      },
    );
  }

  function reactivate(targets: User[], undoing = false) {
    void run(
      'reactivate',
      () => reactivateUsers(targets.map((u) => u.id)),
      (changed) => {
        merge(changed);
        setSelected([]);
        if (!changed.length) {
          toast({
            tone: 'info',
            title: 'Nobody to reactivate',
            description: 'Only suspended people can be reactivated.',
          });
        } else if (!undoing) {
          toast({ tone: 'success', title: `Reactivated ${who(changed)}` });
        }
      },
    );
  }

  function resend(user: User) {
    void run(
      'resend',
      () => resendInvite(user.id),
      () => toast({ tone: 'success', title: `Invitation sent again to ${user.email}` }),
    );
  }

  function confirmRemove() {
    const targets = removing.users;
    const ids = targets.map((u) => u.id);
    void run(
      'remove',
      () => removeUsers(ids),
      () => {
        update((list) => list.filter((u) => !ids.includes(u.id)));
        setSelected((s) => s.filter((id) => !ids.includes(id)));
        setRemoving((r) => ({ ...r, open: false }));
        if (viewingId && ids.includes(viewingId)) setViewingId(null);
        setRemovedCount((n) => n + 1);
        const cancelled = targets.every((u) => u.status === 'invited');
        toast({
          tone: 'success',
          title: cancelled
            ? `Cancelled the invitation for ${who(targets)}`
            : `Removed ${who(targets)}`,
        });
      },
    );
  }

  const actions: UserActions = {
    changeRole: (u) => setRoleFor([u]),
    resendInvite: resend,
    suspend: (u) => suspend([u]),
    reactivate: (u) => reactivate([u]),
    remove: (u) => setRemoving({ users: [u], open: true }),
  };

  function rowActions(u: User): MenuItem[] {
    const view: MenuItem = {
      label: 'View details',
      icon: <EyeIcon />,
      onSelect: () => setViewingId(u.id),
    };
    if (isYou(u)) return [view];
    return [
      view,
      { label: 'Change role…', icon: <KeyIcon />, onSelect: () => actions.changeRole(u) },
      u.status === 'invited'
        ? {
            label: 'Resend invitation',
            icon: <MailIcon />,
            onSelect: () => actions.resendInvite(u),
          }
        : u.status === 'active'
          ? { label: 'Suspend', icon: <PauseIcon />, onSelect: () => actions.suspend(u) }
          : { label: 'Reactivate', icon: <PlayIcon />, onSelect: () => actions.reactivate(u) },
      'separator',
      {
        label: u.status === 'invited' ? 'Cancel invitation' : 'Remove…',
        icon: <TrashIcon />,
        tone: 'danger',
        onSelect: () => actions.remove(u),
      },
    ];
  }

  const removingInvites = removing.users.every((u) => u.status === 'invited');
  const removeTitle =
    removing.users.length === 1
      ? removingInvites
        ? `Cancel the invitation for ${removing.users[0]!.email}?`
        : `Remove ${removing.users[0]!.name}?`
      : `Remove ${people(removing.users.length)}?`;

  return (
    <>
      <PageHeader
        title="Users"
        description={
          state.status === 'ready'
            ? `${people(users.length)} in ${appConfig.name}.`
            : 'Everyone in your workspace.'
        }
        actions={
          <>
            <Button
              startIcon={<DownloadIcon />}
              disabled={state.status !== 'ready'}
              onClick={() => downloadCsv(tableToCsv(filtered, EXPORT_COLUMNS), 'users')}
            >
              Export CSV
            </Button>
            <Button variant="primary" startIcon={<PlusIcon />} onClick={() => setInviting(true)}>
              Invite people
            </Button>
          </>
        }
      />
      {state.status === 'error' ? (
        <LoadError what="the user list" onRetry={retry} />
      ) : (
        <div className="page-stack">
          <div className="toolbar">
            <SearchField
              label="Search people"
              hideLabel
              placeholder="Search by name or email"
              value={query}
              onValueChange={(value) => {
                setQuery(value);
                filterChanged();
              }}
            />
            <SelectField
              label="Role"
              hideLabel
              placeholder="All roles"
              options={ROLE_OPTIONS}
              value={role}
              onChange={(event) => {
                setRole(event.target.value);
                filterChanged();
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
                filterChanged();
              }}
            />
          </div>
          <DataTable
            caption="People"
            hideCaption
            columns={COLUMNS}
            rows={current.items}
            getRowId={(u) => u.id}
            getRowLabel={(u) => u.name}
            density={narrow ? 'compact' : 'comfortable'}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            manualSort
            loading={state.status === 'loading'}
            loadingRows={appConfig.pageSize}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
            selectedCountLabel={(count) => `${people(count)} selected`}
            bulkActions={(ids) => {
              const targets = byIds(ids);
              return (
                <>
                  <Button size="sm" onClick={() => setRoleFor(targets)}>
                    Change role
                  </Button>
                  <Button size="sm" onClick={() => suspend(targets)} disabled={busy}>
                    Suspend
                  </Button>
                  <Button size="sm" onClick={() => reactivate(targets)} disabled={busy}>
                    Reactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => setRemoving({ users: targets, open: true })}
                  >
                    Remove
                  </Button>
                </>
              );
            }}
            rowActions={rowActions}
            empty={
              <EmptyState
                size="sm"
                title="Nobody matches"
                description="Try a different search, role or status."
                action={
                  <Button
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setRole('');
                      setStatus('');
                      filterChanged();
                    }}
                  >
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
                  : 'Nobody to show'
                : 'Loading…'
            }
          />
        </div>
      )}

      <InviteDialog
        open={inviting}
        onClose={() => setInviting(false)}
        onInvited={(invited) => update((list) => [...invited, ...list])}
      />
      <RoleDialog users={roleFor} onClose={() => setRoleFor([])} onSave={saveRole} busy={busy} />
      <UserPanel user={viewing} onClose={() => setViewingId(null)} actions={actions} busy={busy} />
      <ConfirmDialog
        open={removing.open}
        title={removeTitle}
        description={
          removingInvites
            ? 'The link in their email will stop working. You can invite them again later.'
            : `They lose access to ${appConfig.name} straight away. You can invite them again later.`
        }
        confirmLabel={
          removingInvites && removing.users.length === 1
            ? 'Cancel invitation'
            : `Remove ${removing.users.length === 1 ? removing.users[0]!.name : people(removing.users.length)}`
        }
        cancelLabel={removingInvites && removing.users.length === 1 ? 'Keep it' : 'Cancel'}
        tone="danger"
        loading={busy}
        onConfirm={confirmRemove}
        onCancel={() => setRemoving((r) => ({ ...r, open: false }))}
      />
    </>
  );
}
