import { useCallback, useEffect, useState } from 'react';

/** Seconds-remaining countdown, e.g. to space out "Resend email" (avoids rate limits). */
export function useCooldown(seconds: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  const start = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, active: remaining > 0, start };
}
