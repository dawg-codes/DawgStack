import { useEffect, type ReactNode } from 'react';
import { AuthLayout } from '@dawg-codes/react-toolkit/layout';
import { ThemeToggle } from '@dawg-codes/react-toolkit/theme';
import { appConfig } from '../app.config';
import { Brand } from './Brand';

interface AuthPageProps {
  /** The page heading, also used in the browser tab title. */
  title: string;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

/**
 * The frame every screen shares: brand, heading, theme toggle and the optional side panel.
 * It also puts the page title in the browser tab.
 */
export function AuthPage({ title, description, footer, children }: AuthPageProps) {
  useEffect(() => {
    document.title = `${title} – ${appConfig.name}`;
  }, [title]);

  return (
    <AuthLayout
      brand={<Brand />}
      title={title}
      description={description}
      actions={<ThemeToggle hideLabels size="sm" />}
      footer={footer}
      aside={appConfig.features.sidePanel ? <SidePanel /> : undefined}
    >
      {children}
    </AuthLayout>
  );
}

function SidePanel() {
  return (
    <div className="side-panel">
      <p className="side-panel__title">{appConfig.sidePanel.title}</p>
      <ul className="side-panel__points">
        {appConfig.sidePanel.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
