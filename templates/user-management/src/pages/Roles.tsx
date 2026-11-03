import { Card, Skeleton, VisuallyHidden } from '@dawg-codes/react-toolkit';
import { PageHeader } from '@dawg-codes/react-toolkit/layout';
import { DataTable, type DataTableColumn } from '@dawg-codes/react-toolkit/table';
import { appConfig } from '../app.config';
import { CheckIcon, DashIcon } from '../components/icons';
import { LoadError } from '../components/parts';
import { loadUsers } from '../data/api';
import type { Role } from '../data/types';
import { useLoad } from '../data/useLoad';
import { people } from '../messages';
import { PERMISSIONS, ROLES, ROLE_ORDER } from '../roles';
import { href } from '../router';
import { useIsNarrow } from '../useMediaQuery';

type Permission = (typeof PERMISSIONS)[number];

const PERMISSION_COLUMNS: DataTableColumn<Permission>[] = [
  { key: 'label', header: 'Permission', rowHeader: true },
  ...ROLE_ORDER.map((role): DataTableColumn<Permission> => ({
    key: role,
    header: ROLES[role].label,
    align: 'center',
    cell: (p) => <Allowed yes={p.roles.includes(role)} />,
  })),
];

/** A tick or a dash, with words for screen readers. */
function Allowed({ yes }: { yes: boolean }) {
  return (
    <span className="allowed" data-allowed={yes || undefined}>
      {yes ? <CheckIcon /> : <DashIcon />}
      <VisuallyHidden>{yes ? 'Yes' : 'No'}</VisuallyHidden>
    </span>
  );
}

export function Roles() {
  const { state, retry } = useLoad(loadUsers, []);
  const narrow = useIsNarrow();
  const count = (role: Role) =>
    state.status === 'ready' ? state.data.filter((u) => u.role === role).length : 0;

  return (
    <>
      <PageHeader
        title="Roles"
        description="What each role can do. Change someone's role from the Users page."
      />
      <div className="page-stack">
        {state.status === 'error' ? (
          <LoadError what="role members" onRetry={retry} />
        ) : (
          <ul className="role-grid" aria-label="Roles">
            {ROLE_ORDER.map((role) => (
              <Card as="li" key={role} className="role-card">
                <h2 className="role-card__title">{ROLES[role].label}</h2>
                <p className="role-card__description">{ROLES[role].description}</p>
                <p className="role-card__count">
                  {state.status === 'loading' ? (
                    <Skeleton variant="text" width="6rem" />
                  ) : appConfig.pages.users && count(role) > 0 ? (
                    <a href={href('users', { role })}>
                      {people(count(role))}
                      <VisuallyHidden> with the {ROLES[role].label} role</VisuallyHidden>
                    </a>
                  ) : (
                    people(count(role))
                  )}
                </p>
              </Card>
            ))}
          </ul>
        )}
        <section aria-labelledby="permissions-heading" className="page-stack page-stack--tight">
          <h2 id="permissions-heading" className="section-title">
            Permissions
          </h2>
          <DataTable
            className="permissions-table"
            caption="What each role can do"
            hideCaption
            columns={PERMISSION_COLUMNS}
            rows={PERMISSIONS}
            getRowId={(p) => p.label}
            density={narrow ? 'compact' : 'comfortable'}
          />
        </section>
      </div>
    </>
  );
}
