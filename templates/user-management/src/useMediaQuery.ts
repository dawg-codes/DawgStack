import { useCallback, useSyncExternalStore } from 'react';

/** True while a CSS media query matches, e.g. `useMediaQuery('(max-width: 47.99rem)')`. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}

/** Phones and narrow windows: the width below which tables hide their less important columns. */
export const useIsNarrow = () => useMediaQuery('(max-width: 47.99rem)');
