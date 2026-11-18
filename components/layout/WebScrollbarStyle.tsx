import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

const STYLE_ID = 'mathart-scrollbars';

/**
 * Web only: thin, theme-coloured scrollbars on the browser's own scroll
 * containers (no drawn or fake scrollbar). Native platforms keep their
 * standard scroll indicators. Renders nothing.
 */
export function WebScrollbarStyle() {
  const { colors } = useAppTheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = `
      * { scrollbar-width: thin; scrollbar-color: ${colors.borderStrong} transparent; }
      *::-webkit-scrollbar { width: 8px; height: 8px; }
      *::-webkit-scrollbar-track { background: transparent; }
      *::-webkit-scrollbar-thumb { background-color: ${colors.borderStrong}; border-radius: 8px; border: 2px solid transparent; background-clip: content-box; }
      *::-webkit-scrollbar-thumb:hover { background-color: ${colors.textSecondary}; }
    `;
  }, [colors.borderStrong, colors.textSecondary]);

  return null;
}
