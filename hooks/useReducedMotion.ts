import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useDisplayPreferences } from '@/features/preferences/displayPreferences';

/**
 * True when the phone's "Reduce motion" setting is on, or the learner turned on
 * Reduce motion in the app (Profile › Appearance & motion). Gate all
 * non-essential animation on it.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const { reduceMotion } = useDisplayPreferences();

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduced || reduceMotion;
}
