import { useCallback, useState } from 'react';

/**
 * State that the parent may control (pass `value`) or leave to the component (pass `defaultValue`).
 * `onChange` is called either way.
 */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [own, setOwn] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : own;
  const set = useCallback(
    (next: T) => {
      if (!controlled) setOwn(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, set] as const;
}
