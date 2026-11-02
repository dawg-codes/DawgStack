import { useEffect, useLayoutEffect } from 'react';

/** useLayoutEffect in the browser (runs before paint), useEffect on the server (no warning). */
export const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;
