import { useCallback, type MutableRefObject, type Ref } from 'react';

function assign<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as MutableRefObject<T | null>).current = node;
}

/** One ref callback that fills two refs, e.g. the caller's forwarded ref and an internal one. */
export function useMergedRef<T>(a: Ref<T> | undefined, b: Ref<T> | undefined) {
  return useCallback(
    (node: T | null) => {
      assign(a, node);
      assign(b, node);
    },
    [a, b],
  );
}
