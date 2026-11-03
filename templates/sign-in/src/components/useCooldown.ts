import { useEffect, useState } from 'react';

/**
 * A countdown for "Send again" buttons, so people (and scripts) can't send a flood of emails
 * or codes. Your server should rate-limit these requests too.
 */
export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  return { remaining, start: () => setRemaining(seconds) };
}
