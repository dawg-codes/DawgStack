import { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  EmptyState,
  createStatusBadge,
  type StatusMap,
} from '@dawg-codes/react-toolkit';
import { downloadCsv } from '@dawg-codes/react-toolkit/csv';
import { ConfirmDialog } from '@dawg-codes/react-toolkit/dialog';
import { SearchField, SelectField } from '@dawg-codes/react-toolkit/form';
import { Pagination, paginate } from '@dawg-codes/react-toolkit/pagination';
import { DataTable, tableToCsv, type DataTableColumn } from '@dawg-codes/react-toolkit/table';
import { useToast } from '@dawg-codes/react-toolkit/toast';
import { EditIcon, InboxIcon, TrashIcon } from './icons';

type Status = 'active' | 'invited' | 'suspended';
interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  status: Status;
  projects: number;
  lastActive: Date;
}

const STATUS: StatusMap<Status> = {
  active: { label: 'Active', tone: 'success' },
  invited: { label: 'Invited', tone: 'info' },
  suspended: { label: 'Suspended', tone: 'neutral' },
};
const MemberStatus = createStatusBadge(STATUS, { displayName: 'MemberStatus' });

// Made-up people for the demo.
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
  'Mara',
];
const LAST = [
  'Silva',
  'Okafor',
  'Li',
  'Novak',
  'Haddad',
  'Moreau',
  'Tanaka',
  'Rossi',
  'Kowalski',
  'Ndiaye',
];
const ROLES: Member['role'][] = ['Owner', 'Admin', 'Member', 'Member', 'Member', 'Viewer'];
const STATUSES: Status[] = ['active', 'active', 'active', 'invited', 'suspended'];
const MEMBERS: Member[] = Array.from({ length: 37 }, (_, i) => {
  const first = FIRST[(i * 7) % FIRST.length]!;
  const last = LAST[(i * 3) % LAST.length]!;
  return {
    id: `m${i + 1}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@example.com`.toLowerCase(),
    role: i === 0 ? 'Owner' : ROLES[1 + (i % (ROLES.length - 1))]!,
    status: STATUSES[i % STATUSES.length]!,
    projects: (i * 13) % 29,
    lastActive: new Date(Date.UTC(2026, 9, 31) - ((i * 37) % 60) * 86_400_000),
  };
});

const dateFormat = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const PAGE_SIZE = 8;

export function TableDemo() {
  const { toast } = useToast();
  const [members, setMembers] = useState(MEMBERS);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);

  const columns: DataTableColumn<Member>[] = [
    {
      key: 'name',
      header: 'Name',
      rowHeader: true,
      sortable: true,
      cell: (m) => (
        <span className="pg-person">
          <Avatar name={m.name} size="sm" />
          <span>
            {m.name}
            <span className="pg-person-email">{m.email}</span>
          </span>
        </span>
      ),
    },
    { key: 'email', header: 'Email', hideBelow: 'lg', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (m) => <MemberStatus status={m.status} />,
      value: (m) => STATUS[m.status].label,
    },
    { key: 'projects', header: 'Projects', sortable: true, align: 'end', hideBelow: 'md' },
    {
      key: 'lastActive',
      header: 'Last active',
      headerText: 'Last active',
      sortable: true,
      hideBelow: 'md',
      cell: (m) => dateFormat.format(m.lastActive),
    },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(
      (m) =>
        (!q || m.name.toLowerCase().includes(q) || m.email.includes(q)) &&
        (!role || m.role === role),
    );
  }, [members, query, role]);
  const current = paginate(filtered, page, PAGE_SIZE);

  const remove = (ids: string[]) => {
    setMembers((list) => list.filter((m) => !ids.includes(m.id)));
    setSelected((list) => list.filter((id) => !ids.includes(id)));
    toast({
      title: ids.length === 1 ? 'Member removed' : `${ids.length} members removed`,
      tone: 'success',
    });
  };

  return (
    <Card padding="sm" className="pg-table-card">
      <div className="pg-table-toolbar">
        <SearchField
          label="Search members"
          hideLabel
          placeholder="Search by name or email"
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
        <SelectField
          label="Role"
          hideLabel
          options={['Admin', 'Member', 'Viewer']}
          placeholder="All roles"
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
        />
        <Button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1500);
          }}
        >
          Reload
        </Button>
        <Button
          variant="outline"
          onClick={() => downloadCsv(tableToCsv(filtered, columns), 'members')}
        >
          Export CSV
        </Button>
      </div>

      <DataTable
        caption="Members"
        hideCaption
        columns={columns}
        rows={loading ? [] : current.items}
        getRowId={(m) => m.id}
        loading={loading}
        loadingRows={PAGE_SIZE}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        bulkActions={(ids, clear) => (
          <Button
            size="sm"
            variant="danger"
            startIcon={<TrashIcon />}
            onClick={() => {
              remove(ids);
              clear();
            }}
          >
            Remove
          </Button>
        )}
        rowActions={(m) => [
          {
            label: 'Edit',
            icon: <EditIcon />,
            onSelect: () => toast({ title: `Editing ${m.name}` }),
          },
          'separator',
          {
            label: 'Remove',
            icon: <TrashIcon />,
            tone: 'danger',
            disabled: m.role === 'Owner',
            onSelect: () => setRemoving(m),
          },
        ]}
        empty={
          <EmptyState
            size="sm"
            icon={<InboxIcon />}
            title="No members found"
            description="Try a different search or role."
            action={
              <Button
                size="sm"
                onClick={() => {
                  setQuery('');
                  setRole('');
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
          current.total ? `Showing ${current.from}–${current.to} of ${current.total}` : 'No members'
        }
      />

      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? 'member'}?`}
        description="They will lose access to all projects straight away."
        confirmLabel="Remove member"
        tone="danger"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) remove([removing.id]);
          setRemoving(null);
        }}
      />
    </Card>
  );
}
