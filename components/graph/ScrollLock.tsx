import { createContext, useContext } from 'react';

/**
 * Lets a canvas stop the page from scrolling while a finger is on it. On
 * Android a parent ScrollView otherwise takes over vertical drags, so panning
 * the graph would scroll the page instead.
 */
export const ScrollLockContext = createContext<((locked: boolean) => void) | null>(null);

export const useScrollLock = () => useContext(ScrollLockContext);
