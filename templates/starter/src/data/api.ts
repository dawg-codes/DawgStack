import { sampleDashboard } from './sample';
import type { DashboardData } from './types';

/**
 * Loads everything the dashboard shows. This is the only function to change when you connect
 * your backend, for example:
 *
 *   const response = await fetch('/api/dashboard', { signal });
 *   if (!response.ok) throw new Error(`Request failed (${response.status})`);
 *   return (await response.json()) as DashboardData;
 */
export async function loadDashboard(signal?: AbortSignal): Promise<DashboardData> {
  await delay(600, signal); // pretend network latency, so the loading state is visible
  return sampleDashboard;
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}
