import { useCallback, useEffect, useState } from 'react';

export type LoadState<T> =
  { status: 'loading' } | { status: 'error'; error: unknown } | { status: 'ready'; data: T };

type Stored<T> = ({ status: 'error'; error: unknown } | { status: 'ready'; data: T }) & {
  key: string;
};

/**
 * Runs a load function when the page opens, and again when `deps` change (e.g. a date range),
 * cancelling the previous request. Returns the state, `retry` for the error screen, and
 * `update` to change the data after saving a change.
 */
export function useLoad<T>(load: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]) {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([...deps, attempt]);
  const [stored, setStored] = useState<Stored<T> | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => setStored({ status: 'ready', data, key }),
      (error: unknown) => {
        if (!controller.signal.aborted) setStored({ status: 'error', error, key });
      },
    );
    return () => controller.abort();
    // `load` is usually an inline function; `key` (from `deps`) says when to load again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Data from an earlier request (another range, say) counts as still loading.
  const state: LoadState<T> =
    !stored || stored.key !== key
      ? { status: 'loading' }
      : stored.status === 'ready'
        ? { status: 'ready', data: stored.data }
        : { status: 'error', error: stored.error };

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  /** Replace the data, or pass a function to change the latest data (e.g. after an Undo). */
  const update = useCallback(
    (next: T | ((data: T) => T)) =>
      setStored((prev) => {
        if (typeof next !== 'function') return { status: 'ready', data: next, key };
        if (prev?.key !== key || prev.status !== 'ready') return prev;
        return { status: 'ready', data: (next as (data: T) => T)(prev.data), key };
      }),
    [key],
  );
  return { state, retry, update };
}
