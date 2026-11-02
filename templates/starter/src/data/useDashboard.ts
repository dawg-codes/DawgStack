import { useCallback, useEffect, useState } from 'react';
import { loadDashboard } from './api';
import type { DashboardData } from './types';

export type DashboardState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: DashboardData };

/** Loads the dashboard once, cancels on unmount, and offers a retry after an error. */
export function useDashboard() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal).then(
      (data) => setState({ status: 'ready', data }),
      (error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong.',
        });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}
