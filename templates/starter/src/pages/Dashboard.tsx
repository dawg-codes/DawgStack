import {
  Avatar,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Skeleton,
  VisuallyHidden,
  createStatusBadge,
  type ProgressBarTone,
} from '@dawg-codes/react-toolkit';
import { appConfig } from '../app.config';
import { StatCard } from '../components/StatCard';
import type { DashboardData, ProjectStatus } from '../data/types';
import { useDashboard } from '../data/useDashboard';

// Your status values, mapped to labels and colours. Type-checked against ProjectStatus.
const ProjectStatusBadge = createStatusBadge<ProjectStatus>(
  {
    planning: { label: 'Planning' },
    active: { label: 'Active', tone: 'info', dot: true },
    'at-risk': { label: 'At risk', tone: 'warning' },
    done: { label: 'Done', tone: 'success' },
  },
  { displayName: 'ProjectStatusBadge' },
);

const PROGRESS_TONE: Record<ProjectStatus, ProgressBarTone> = {
  planning: 'neutral',
  active: 'primary',
  'at-risk': 'warning',
  done: 'success',
};

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

function timeAgo(iso: string): string {
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const minutes = Math.round((Date.parse(iso) - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return format.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return format.format(hours, 'hour');
  return format.format(Math.round(hours / 24), 'day');
}

export function Dashboard() {
  const { state, retry } = useDashboard();
  return (
    <main id="main" className="container page" aria-busy={state.status === 'loading'}>
      <div className="page-header" id="overview">
        <h1>{appConfig.name}</h1>
        <p>{appConfig.tagline}</p>
      </div>

      {state.status === 'loading' && <LoadingView />}

      {state.status === 'error' && (
        <Card>
          <EmptyState
            title="Couldn't load your dashboard"
            description={state.message}
            action={
              <Button variant="primary" onClick={retry}>
                Try again
              </Button>
            }
          />
        </Card>
      )}

      {state.status === 'ready' && <ReadyView data={state.data} />}
    </main>
  );
}

function LoadingView() {
  return (
    <>
      <VisuallyHidden role="status">Loading dashboard</VisuallyHidden>
      <ul className="stat-grid">
        {[0, 1, 2, 3].map((i) => (
          <Card as="li" key={i}>
            <Skeleton variant="text" width="60%" />
            <Skeleton height={32} width="40%" />
          </Card>
        ))}
      </ul>
      <Card>
        <Skeleton variant="text" lines={5} />
      </Card>
    </>
  );
}

function ReadyView({ data }: { data: DashboardData }) {
  return (
    <>
      <ul className="stat-grid" aria-label="Summary">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </ul>

      <section id="projects" className="section" aria-labelledby="projects-title">
        <h2 id="projects-title">Projects</h2>
        <Card padding="none">
          <ul className="project-list">
            {data.projects.map((project) => (
              <li key={project.id} className="project-row">
                <div className="project-row__head">
                  <span className="project-row__name">{project.name}</span>
                  <ProjectStatusBadge status={project.status} size="sm" />
                </div>
                <ProgressBar
                  value={project.progress}
                  aria-label={`${project.name} progress`}
                  tone={PROGRESS_TONE[project.status]}
                  size="sm"
                  showValue
                />
                <div className="project-row__meta">
                  <span className="project-row__owner">
                    <Avatar name={project.owner} alt="" size="xs" />
                    {project.owner}
                  </span>
                  <span>Due {dateFormat.format(new Date(project.due))}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {appConfig.features.team && (
        <section id="team" className="section" aria-labelledby="team-title">
          <h2 id="team-title">Team</h2>
          <ul className="team-grid">
            {data.team.map((member) => (
              <Card as="li" key={member.id} className="team-card">
                <Avatar name={member.name} src={member.avatarUrl} alt="" size="lg" />
                <div>
                  <div className="team-card__name">{member.name}</div>
                  <div className="team-card__role">{member.role}</div>
                </div>
              </Card>
            ))}
          </ul>
        </section>
      )}

      {appConfig.features.activity && (
        <section id="activity" className="section" aria-labelledby="activity-title">
          <h2 id="activity-title">Activity</h2>
          <Card padding={data.activity.length ? 'none' : 'md'}>
            {data.activity.length ? (
              <ul className="activity-list">
                {data.activity.map((item) => (
                  <li key={item.id} className="activity-item">
                    <Avatar name={item.who} alt="" size="sm" />
                    <p>
                      <strong>{item.who}</strong> {item.action} <strong>{item.target}</strong>
                    </p>
                    <time dateTime={item.at}>{timeAgo(item.at)}</time>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                size="sm"
                headingLevel={3}
                title="No activity yet"
                description="Updates from your team will appear here."
              />
            )}
          </Card>
        </section>
      )}
    </>
  );
}
